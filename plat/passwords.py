"""Parol qoidalari: sodda, lekin eng oson topiladigan parollarni rad etadi."""

MIN_LENGTH = 6

_COMMON = {
    '123456', '1234567', '12345678', '123456789', '111111', '000000', '121212',
    '654321', '123123', '112233', 'qwerty', 'qwerty123', 'qwertyuiop', 'password',
    'password1', 'parol', 'parol123', 'abc123', 'abcdef', 'iloveyou', 'bonbon',
    'bon-bon', 'bonbon123', 'admin123', 'qazwsx',
}


def password_error(password, username='', email='', name=''):
    """Parol yaroqsiz bo'lsa — o'zbekcha xabar, yaroqli bo'lsa — None."""
    password = str(password or '')
    if len(password) < MIN_LENGTH:
        return f'Parol kamida {MIN_LENGTH} ta belgi bo‘lsin.'
    lowered = password.lower()
    if lowered in _COMMON:
        return 'Bu parol juda oson topiladi. Boshqa parol tanlang.'
    if password.isdigit():
        return 'Parol faqat raqamlardan iborat bo‘lmasin. Harf ham qo‘shing.'
    if len(set(lowered)) <= 2:
        return 'Parol juda sodda (bir xil belgilar). Boshqa parol tanlang.'
    uname = str(username or '').strip().lower()
    if uname and (lowered == uname or (len(uname) >= 4 and uname in lowered)):
        return 'Parol foydalanuvchi nomiga o‘xshash bo‘lmasin.'
    local_email = str(email or '').split('@')[0].strip().lower()
    if len(local_email) >= 4 and lowered == local_email:
        return 'Parol email manzilga o‘xshash bo‘lmasin.'
    return None
