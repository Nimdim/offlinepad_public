DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'offlinepad_landing',
        'USER': 'offlinepad_landing',
        "HOST": 'localhost',
        'PASSWORD': 'DB_PASSWORD_PLACEHOLDER',
    }
}

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
DEBUG = False

CSRF_TRUSTED_ORIGINS = ["https://offlinepad.com"]
ALLOWED_HOSTS = ["127.0.0.1", "offlinepad.com"]
SECRET_KEY = 'SECRET_KEY_PLACEHOLDER'
STATIC_ROOT = 'static'