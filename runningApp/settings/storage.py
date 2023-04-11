import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

STATIC_URL = '/static/'

# Django Static Files Directory(s)
STATICFILES_DIRS = (os.path.join(BASE_DIR, 'frontend-static'),)

# Path where collectstatic will save the static files
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# Base url to serve media files
MEDIA_URL = 'media/'

# Path where media is stored
MEDIA_ROOT = os.path.join(BASE_DIR, "media/")