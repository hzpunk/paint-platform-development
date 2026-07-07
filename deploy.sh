#!/bin/bash
set -e

echo "============================================="
echo "   Paint Platform Deployment Automation     "
echo "============================================="

# ─── Самоперезапуск: bash буферирует скрипт до git pull ───────────────
if [ -z "$DEPLOY_RESTARTED" ]; then
  echo "--> Pulling latest changes from Git..."
  git pull origin main || git pull origin master
  export DEPLOY_RESTARTED=1
  exec bash "$0" "$@"
fi

echo "--> Code is up to date. Continuing deployment..."

# ─── 1. Install dependencies ──────────────────────────────────────────
echo "--> Installing npm packages..."
npm install --legacy-peer-deps

# ─── 2. Helper: определяем команду docker ─────────────────────────────
if command -v docker-compose &>/dev/null; then
  DC="docker-compose"
elif docker compose version &>/dev/null 2>&1; then
  DC="docker compose"
else
  DC=""
fi

# ─── 3. Запуск PostgreSQL ─────────────────────────────────────────────
echo "--> Ensuring PostgreSQL is running..."

PG_RUNNING=$(docker ps --filter "name=paint_db" --filter "status=running" -q 2>/dev/null || true)

if [ -n "$PG_RUNNING" ]; then
  echo "--> PostgreSQL container 'paint_db' is already running."

elif [ -n "$DC" ] && [ -f "docker-compose.prod.yml" ]; then
  # Запускаем через docker-compose
  echo "--> Starting DB via docker-compose ($DC)..."
  $DC -f docker-compose.prod.yml up -d db

else
  # Запускаем напрямую через docker run (fallback)
  echo "--> docker-compose.prod.yml not found. Starting DB via 'docker run'..."
  docker run -d \
    --name paint_db \
    --restart always \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=paint_platform_dev \
    -p 5432:5432 \
    -v paint_pgdata:/var/lib/postgresql/data \
    postgres:15 2>/dev/null || {
      echo "--> Container 'paint_db' already exists but stopped. Starting it..."
      docker start paint_db
    }
fi

# ─── 4. Ждём готовности PostgreSQL ────────────────────────────────────
echo "--> Waiting for PostgreSQL to accept connections..."
MAX_WAIT=45
WAITED=0
until docker exec paint_db pg_isready -U postgres -q 2>/dev/null; do
  if [ "$WAITED" -ge "$MAX_WAIT" ]; then
    echo "ERROR: PostgreSQL not ready after ${MAX_WAIT}s."
    docker logs paint_db 2>&1 | tail -20
    exit 1
  fi
  sleep 1
  WAITED=$((WAITED + 1))
done
echo "--> PostgreSQL ready (${WAITED}s)."

# ─── 5. Prisma: generate + apply schema ───────────────────────────────
echo "--> Running Prisma Client generation & database updates..."
npx prisma generate
npx prisma db push --accept-data-loss

# ─── 6. Build & restart app ───────────────────────────────────────────
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
  echo "--> No PM2 or Docker Compose for app. Building..."
  npm run build
  echo "--> Done. Run 'npm run start' to launch."
fi

echo "============================================="
echo "   Deployment completed successfully!        "
echo "============================================="
