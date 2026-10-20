"""Parolni tanlab topishga (brute-force) qarshi cheklovlar."""
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle
from rest_framework.views import exception_handler as drf_exception_handler


class LoginUserThrottle(SimpleRateThrottle):
    """Bitta username uchun daqiqasiga 10 ta urinish (qaysi IP dan bo'lishidan qat'i nazar)."""
    scope = 'login_user'
    rate = '10/min'

    def get_cache_key(self, request, view):
        username = str(request.data.get('username', '')).strip().lower()[:150]
        if not username:
            return None
        return self.cache_format % {'scope': self.scope, 'ident': username}


class LoginIPThrottle(SimpleRateThrottle):
    """Bitta IP dan daqiqasiga 100 ta urinish."""
    scope = 'login_ip'
    rate = '100/min'

    def get_cache_key(self, request, view):
        forwarded = request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
        ident = forwarded or request.META.get('REMOTE_ADDR') or 'unknown'
        return self.cache_format % {'scope': self.scope, 'ident': ident}


LOGIN_THROTTLES = [LoginUserThrottle, LoginIPThrottle]


def exception_handler(exc, context):
    """429 javobiga frontend o'qiydigan `error` maydonini qo'shadi."""
    response = drf_exception_handler(exc, context)
    if response is not None and response.status_code == 429:
        wait = getattr(exc, 'wait', None)
        minutes = max(1, int((wait or 60) // 60) + (1 if (wait or 60) % 60 else 0))
        return Response(
            {'error': f'Juda ko‘p urinish. Taxminan {minutes} daqiqadan keyin qayta urinib ko‘ring.'},
            status=429,
        )
    return response
