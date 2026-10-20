"""Ota-ona paneli yordamchilari (views.py dan mustaqil, aylanma import bo'lmasligi uchun)."""
from datetime import timedelta
from django.utils import timezone


def is_parent(user):
    return bool(user and user.is_authenticated and hasattr(user, 'parent_account'))


def subscription_active(parent):
    sub = getattr(parent, 'parent_subscription', None)
    return bool(sub and sub.active_until and sub.active_until > timezone.now())


def child_control(user):
    """Farzand uchun faol ota-ona cheklovi (faqat ota-ona obunasi faol bo'lsa)."""
    link = getattr(user, 'parent_link', None)
    if link and subscription_active(link.parent):
        return link
    return None


def hours_open(open_time, close_time, now=None):
    now = timezone.localtime(now) if now else timezone.localtime()
    current = now.time().replace(tzinfo=None)
    if open_time == close_time:
        return True
    if open_time < close_time:
        return open_time <= current < close_time
    return current >= open_time or current < close_time


def child_hours_blocked(user):
    """Ota-ona belgilagan vaqt yoki pauza sabab farzand hozir kira olmasa True."""
    link = child_control(user)
    if not link:
        return False
    if link.paused:
        return True
    if link.open_time and link.close_time:
        return not hours_open(link.open_time, link.close_time)
    return False


def extend_subscription(parent, plan_key, plans):
    from .models import ParentSubscription
    sub, _ = ParentSubscription.objects.get_or_create(parent=parent)
    base = sub.active_until if sub.active_until and sub.active_until > timezone.now() else timezone.now()
    sub.active_until = base + timedelta(days=plans[plan_key]['days'])
    sub.plan = plan_key
    sub.save()
    return sub
