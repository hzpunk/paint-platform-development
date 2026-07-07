#!/bin/bash
set -e

echo "============================================="
echo "   Paint Platform Deployment Automation     "
echo "============================================="

# ─── Самоперезапуск после git pull ────────────────────────────────────
# Если это первый запуск (DEPLOY_RESTARTED не задан), тянем код и
# перезапускаем скрипт, чтобы выполнялась НОВАЯ версия, а не буфер.
if [ -z "$DEPLOY_RESTARTED" ]; then
  echo "--> Pulling latest changes from Git..."
  git pull origin main || git pull origin master
  echo "--> Re-executing updated deploy.sh..."
  export DEPLOY_RESTARTED=1
  exec bash "$0" "$@"
fi

echo "--> Code is up to date. Continuing deployment..."

# ─── 1. Install dependencies ──────────────────────────────────────────
echo "--> Installing npm packages..."
npm install --legacy-peer-deps

# ─── 2. Helper: определяем команду docker compose ─────────────────────
# Поддерживаем и docker-compose v1, и docker compose v2 (plugin)
if command -v docker-compose &>/dev/null; then
  DC="docker-compose"
elif docker compose version &>/dev/null 2>&1; then
  DC="docker compose"
else
  DC=""
fi

# ─── 3. Запуск контейнера PostgreSQL ──────────────────────────────────
if [ -n "$DC" ] && [ -f "docker-compose.prod.yml" ]; then
  echo "--> Starting database container (using: $DC)..."
  $DC -f docker-compose.prod.yml up -d db

  echo "--> Waiting for PostgreSQL to be ready..."
  MAX_WAIT=40
  WAITED=0
  until $DC -f docker-compose.prod.yml exec -T db pg_isready -U postgres -q 2>/dev/null; do
    if [ "$WAITED" -ge "$MAX_WAIT" ]; then
      echo "ERROR: PostgreSQL did not become ready in ${MAX_WAIT}s."
      $DC -f docker-compose.prod.yml logs db | tail -20
      exit 1
    fi
    sleep 1
    WAITED=$((WAITED + 1))
  done
  echo "--> PostgreSQL is ready (${WAITED}s)."
else
  echo "WARNING: docker / docker-compose.prod.yml not found. Expecting external DB at DATABASE_URL."
fi

# ─── 4. Prisma: generate + apply schema ───────────────────────────────
echo "--> Running Prisma Client generation & database updates..."
npx prisma generate
npx prisma db push --accept-data-loss

# ─── 5. Build & restart app ───────────────────────────────────────────
if command -v pm2 &>/dev/null && [ -f "ecosystem.config.js" ]; then
  echo "--> PM2 detected! Building and reloading..."
  npm run build
  pm2 reload ecosystem.config.js || pm2 start ecosystem.config.js
  echo "--> PM2 reload complete!"

elif [ -n "$DC" ] && [ -f "docker-compose.prod.yml" ]; then
  echo "--> Docker Compose: building and starting app container..."
  $DC -f docker-compose.prod.yml up -d --build app
  echo "--> App container started!"

else
  echo "--> No PM2 or Docker detected. Building..."
  npm run build
  echo "--> Done. Run 'npm run start' to start the server."
fi

echo "============================================="
echo "   Deployment completed successfully!        "
echo "============================================="
