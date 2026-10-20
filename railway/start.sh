#!/bin/sh
set -eu

: "${PORT:=8080}"

IS_RAILWAY=0
if [ -n "${RAILWAY_ENVIRONMENT:-}${RAILWAY_PROJECT_ID:-}${RAILWAY_SERVICE_ID:-}" ]; then
  IS_RAILWAY=1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  if [ -n "${RAILWAY_VOLUME_MOUNT_PATH:-}" ]; then
    VOLUME_PATH="$RAILWAY_VOLUME_MOUNT_PATH"
    if [ ! -d "$VOLUME_PATH" ] || [ ! -w "$VOLUME_PATH" ]; then
      if [ "$IS_RAILWAY" -eq 1 ]; then
        echo "[CyberKid] ERROR: Railway Volume mavjud emas yoki yozish uchun ruxsat yo'q: $VOLUME_PATH" >&2
        exit 1
      fi
      echo "[CyberKid] WARNING: Volume mavjud emas yoki yozish uchun ruxsat yo'q: $VOLUME_PATH. Lokal vaqtinchalik SQLite ishlatiladi." >&2
      VOLUME_PATH="${INSTA_KIDS_DATA_PATH:-/tmp/instakids-data}"
    else
      export RAILWAY_VOLUME_MOUNT_PATH="$VOLUME_PATH"
      mkdir -p "$VOLUME_PATH/media"
      if [ ! -f "$VOLUME_PATH/db.sqlite3" ] && [ -f /app/db.sqlite3 ]; then
        echo "[CyberKid] First run: copying initial SQLite database to $VOLUME_PATH"
        cp /app/db.sqlite3 "$VOLUME_PATH/db.sqlite3"
      fi
    fi
  else
    if [ "$IS_RAILWAY" -eq 1 ]; then
      echo "[CyberKid] ERROR: DATABASE_URL topilmadi. Railway web service Variables bo'limida PostgreSQL DATABASE_URL qiymatini ulang yoki Volume'ni /data ga mount qiling." >&2
      exit 1
    fi
    VOLUME_PATH="${INSTA_KIDS_DATA_PATH:-/tmp/instakids-data}"
    mkdir -p "$VOLUME_PATH/media"
    echo "[CyberKid] WARNING: PostgreSQL yoki doimiy Volume ulanmagan. Lokal vaqtinchalik SQLite ishlatiladi." >&2
    export INSTA_KIDS_DATA_PATH="$VOLUME_PATH"
  fi
fi

if [ -n "${DATABASE_URL:-}" ]; then
  echo "[CyberKid] Database: PostgreSQL"
elif [ -n "${RAILWAY_VOLUME_MOUNT_PATH:-}" ]; then
  echo "[CyberKid] Database: SQLite on persistent Railway Volume (${RAILWAY_VOLUME_MOUNT_PATH})"
else
  echo "[CyberKid] Database: Temporary SQLite (${INSTA_KIDS_DATA_PATH})"
fi

if python manage.py migrate --noinput; then
  :
else
  echo "[CyberKid] ERROR: Database migration failed. Server will not start or switch to another database; check DATABASE_URL connectivity and PostgreSQL storage." >&2
  exit 1
fi

# Login urinishlarini cheklash uchun production DB kesh jadvali.
if python manage.py createcachetable; then
  :
else
  echo "[CyberKid] ERROR: Database cache jadvali yaratilmadi. Serverni ishga tushirish to'xtatildi." >&2
  exit 1
fi

# SQLite is kept to one worker to avoid multi-process write locks.
if [ -n "${DATABASE_URL:-}" ]; then
  WORKERS="${WEB_CONCURRENCY:-3}"
else
  WORKERS=1
fi

# Start Django first, then wait until it is ready before raising nginx.
gunicorn config.wsgi:application \
  --bind 127.0.0.1:8000 \
  --worker-class gthread \
  --workers "$WORKERS" \
  --threads "${GUNICORN_THREADS:-32}" \
  --timeout 120 \
  --graceful-timeout 30 \
  --keep-alive 75 \
  --max-requests 2000 \
  --max-requests-jitter 200 \
  --access-logfile - \
  --error-logfile - &
GUNICORN_PID=$!

cleanup() {
  kill "$GUNICORN_PID" 2>/dev/null || true
  wait "$GUNICORN_PID" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

READY_TIMEOUT=60
READY_CHECKED=0
while [ "$READY_CHECKED" -lt "$READY_TIMEOUT" ]; do
  if python -c "import urllib.request; request=urllib.request.Request('http://127.0.0.1:8000/health/', headers={'X-Forwarded-Proto': 'https'}); urllib.request.urlopen(request, timeout=2).read()" >/dev/null 2>&1; then
    break
  fi
  READY_CHECKED=$((READY_CHECKED + 1))
  sleep 1
done

if ! python -c "import urllib.request; request=urllib.request.Request('http://127.0.0.1:8000/health/', headers={'X-Forwarded-Proto': 'https'}); urllib.request.urlopen(request, timeout=2).read()" >/dev/null 2>&1; then
  echo "[CyberKid] ERROR: Django did not become healthy within ${READY_TIMEOUT}s. Exiting." >&2
  exit 1
fi

# Let nginx be the public process and keep the container alive.
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf
nginx -t
nginx -g 'daemon off;'
