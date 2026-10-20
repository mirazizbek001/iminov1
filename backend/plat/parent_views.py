import re
from datetime import datetime
from django.conf import settings as django_settings
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
from django.middleware.csrf import get_token
from django.utils import timezone
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import LoginActivity, ParentAccount, ParentChild, ParentPayment, UsageState
from .parental import extend_subscription, is_parent, subscription_active
from .passwords import password_error
from .safety import validate_text
from .throttles import LOGIN_THROTTLES

PAYMENT_REQUIRED = status.HTTP_402_PAYMENT_REQUIRED


def _plans():
    return django_settings.PARENT_PLANS


def _parent_payload(user):
    sub = getattr(user, 'parent_subscription', None)
    active = subscription_active(user)
    pending = user.parent_payments.filter(status=ParentPayment.PENDING).first()
    return {
        'id': user.id,
        'username': user.username,
        'name': user.first_name,
        'email': user.email,
        'subscription': {
            'active': active,
            'plan': sub.plan if sub else '',
            'until': timezone.localtime(sub.active_until).isoformat() if sub and sub.active_until else None,
        },
        'plans': [{'key': key, 'title': plan['title'], 'days': plan['days'], 'price': plan['price']} for key, plan in _plans().items()],
        'payment': {
            'card': django_settings.PARENT_PAYMENT_CARD,
            'owner': django_settings.PARENT_PAYMENT_CARD_OWNER,
            'testMode': django_settings.PARENT_PAYMENT_TEST_MODE,
            'pending': {'id': pending.id, 'plan': pending.plan, 'amount': pending.amount, 'note': pending.note} if pending else None,
        },
        'csrfToken': None,
    }


def _session_payload(request, user):
    data = _parent_payload(user)
    data['csrfToken'] = get_token(request._request)
    return data


def _require_parent(request):
    if not is_parent(request.user):
        return Response({'error': 'Faqat ota-ona akkaunti uchun.'}, status=status.HTTP_403_FORBIDDEN)
    return None


def _require_subscription(request):
    if not subscription_active(request.user):
        return Response({'error': 'Bu funksiya pullik. Avval obunani yoqing.', 'code': 'subscription_required'}, status=PAYMENT_REQUIRED)
    return None


@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
@throttle_classes(LOGIN_THROTTLES)
def parent_register(request):
    data = request.data
    username = str(data.get('username', '')).strip().lower()
    email = str(data.get('email', '')).strip().lower()
    name = str(data.get('name', '')).strip()
    password = str(data.get('password', ''))
    if not re.fullmatch(r'[a-z0-9._]{3,30}', username):
        return Response({'error': 'Foydalanuvchi nomi 3–30 ta belgi: a-z, 0-9, nuqta, pastki chiziq.'}, status=400)
    if username == 'admin' or validate_text(username, 'Username') or validate_text(name, 'Ism'):
        return Response({'error': 'Bu foydalanuvchi nomi ruxsat etilmaydi.'}, status=400)
    if not name:
        return Response({'error': 'Ismingizni kiriting.'}, status=400)
    if not email or '@' not in email or '.' not in email.rsplit('@', 1)[-1]:
        return Response({'error': 'To‘g‘ri email manzil kiriting.'}, status=400)
    password_problem = password_error(password, username=username, email=email, name=name)
    if password_problem:
        return Response({'error': password_problem}, status=400)
    try:
        with transaction.atomic():
            if User.objects.filter(username__iexact=username).exists():
                return Response({'error': 'Bu foydalanuvchi nomi band.'}, status=status.HTTP_409_CONFLICT)
            user = User.objects.create_user(username=username, email=email, first_name=name[:150], password=password)
            ParentAccount.objects.create(user=user, phone=str(data.get('phone', ''))[:32])
    except IntegrityError:
        return Response({'error': 'Bu foydalanuvchi nomi band.'}, status=status.HTTP_409_CONFLICT)
    auth_login(request._request, user)
    return Response(_session_payload(request, user), status=status.HTTP_201_CREATED)


@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
@throttle_classes(LOGIN_THROTTLES)
def parent_login(request):
    username = str(request.data.get('username', '')).strip().lower()
    password = str(request.data.get('password', ''))
    user = authenticate(request._request, username=username, password=password)
    if not user or not is_parent(user):
        return Response({'error': 'Foydalanuvchi nomi yoki parol noto‘g‘ri.'}, status=status.HTTP_401_UNAUTHORIZED)
    auth_login(request._request, user)
    return Response(_session_payload(request, user))


@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
def parent_session(request):
    if not is_parent(request.user):
        return Response({'authenticated': False})
    return Response({'authenticated': True, **_session_payload(request, request.user)})


@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def parent_checkout(request):
    denied = _require_parent(request)
    if denied:
        return denied
    plan_key = str(request.data.get('plan', ''))
    plans = _plans()
    if plan_key not in plans:
        return Response({'error': 'Noto‘g‘ri tarif.'}, status=400)
    pending = ParentPayment.objects.filter(parent=request.user, status=ParentPayment.PENDING).first()
    if pending and pending.plan == plan_key:
        payment = pending
    else:
        if pending:
            pending.status = ParentPayment.REJECTED
            pending.note = 'Almashtirildi'
            pending.save(update_fields=['status', 'note'])
        payment = ParentPayment.objects.create(
            parent=request.user, plan=plan_key, amount=plans[plan_key]['price'],
            note=f'BB-{request.user.username}',
        )
    if django_settings.PARENT_PAYMENT_TEST_MODE:
        payment.status = ParentPayment.PAID
        payment.confirmed_at = timezone.now()
        payment.save(update_fields=['status', 'confirmed_at'])
        extend_subscription(request.user, plan_key, plans)
    return Response(_session_payload(request, User.objects.get(pk=request.user.pk)))


def _child_payload(link):
    child = link.child
    last = LoginActivity.objects.filter(user=child).first()
    usage = getattr(child, 'platform_usage', None)
    return {
        'id': child.id,
        'username': child.username,
        'name': child.first_name,
        'paused': link.paused,
        'usageLimitMinutes': link.usage_limit_minutes,
        'cooldownMinutes': link.cooldown_minutes,
        'start': link.open_time.strftime('%H:%M') if link.open_time else None,
        'end': link.close_time.strftime('%H:%M') if link.close_time else None,
        'usedSeconds': usage.used_seconds if usage else 0,
        'lastLogin': timezone.localtime(last.created_at).strftime('%d.%m.%Y %H:%M') if last else None,
        'lastDevice': last.device if last else None,
    }


@api_view(['GET', 'POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
@throttle_classes(LOGIN_THROTTLES)
def parent_children(request):
    denied = _require_parent(request) or _require_subscription(request)
    if denied:
        return denied
    if request.method == 'POST':
        username = str(request.data.get('username', '')).strip().lower()
        password = str(request.data.get('password', ''))
        child = authenticate(request._request, username=username, password=password)
        if not child or is_parent(child) or child.is_staff or child.is_superuser:
            return Response({'error': 'Farzand foydalanuvchi nomi yoki paroli noto‘g‘ri.'}, status=status.HTTP_400_BAD_REQUEST)
        existing = ParentChild.objects.filter(child=child).first()
        if existing and existing.parent_id != request.user.id:
            return Response({'error': 'Bu akkaunt boshqa ota-onaga bog‘langan.'}, status=status.HTTP_409_CONFLICT)
        if not existing:
            ParentChild.objects.create(parent=request.user, child=child)
            UsageState.objects.get_or_create(user=child)
    links = ParentChild.objects.filter(parent=request.user).select_related('child').order_by('child__username')
    return Response([_child_payload(link) for link in links])


def _parse_time(value):
    if value in (None, ''):
        return None
    return datetime.strptime(str(value), '%H:%M').time()


def _parse_minutes(value, low=1, high=1440):
    if value in (None, ''):
        return None
    return max(low, min(high, int(value)))


@api_view(['PUT', 'DELETE'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def parent_child_detail(request, username):
    denied = _require_parent(request) or _require_subscription(request)
    if denied:
        return denied
    link = ParentChild.objects.filter(parent=request.user, child__username=username).select_related('child').first()
    if not link:
        return Response({'error': 'Farzand topilmadi.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'DELETE':
        link.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    data = request.data
    try:
        if 'usageLimitMinutes' in data: link.usage_limit_minutes = _parse_minutes(data['usageLimitMinutes'])
        if 'cooldownMinutes' in data: link.cooldown_minutes = _parse_minutes(data['cooldownMinutes'])
        if 'start' in data or 'end' in data:
            start, end = _parse_time(data.get('start')), _parse_time(data.get('end'))
            if bool(start) != bool(end):
                return Response({'error': 'Boshlanish va tugash vaqtini birga kiriting.'}, status=400)
            link.open_time, link.close_time = start, end
        if 'paused' in data: link.paused = bool(data['paused'])
    except (ValueError, TypeError):
        return Response({'error': 'Vaqt yoki daqiqa qiymati noto‘g‘ri.'}, status=400)
    link.save()
    return Response(_child_payload(link))


@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def parent_child_activity(request, username):
    denied = _require_parent(request) or _require_subscription(request)
    if denied:
        return denied
    link = ParentChild.objects.filter(parent=request.user, child__username=username).select_related('child').first()
    if not link:
        return Response({'error': 'Farzand topilmadi.'}, status=status.HTTP_404_NOT_FOUND)
    items = LoginActivity.objects.filter(user=link.child)[:30]
    return Response([{
        'id': item.id,
        'device': item.device or 'Noma\'lum qurilma',
        'time': timezone.localtime(item.created_at).strftime('%d.%m.%Y %H:%M'),
    } for item in items])
