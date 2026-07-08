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

# Включаем Docker BuildKit для быстрого кэширования сборки
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

echo "--> Code is up to date. Continuing deployment..."

# ─── 1. Install dependencies ──────────────────────────────────────────
echo "--> Installing npm packages..."
npm install --legacy-peer-deps

# ─── 2. Helper: определяем команду docker compose ─────────────────────
if command -v docker-compose &>/dev/null; then
  DC="docker-compose"
elif docker compose version &>/dev/null 2>&1; then
  DC="docker compose"
else
  DC=""
fi

# ─── 3. Запуск PostgreSQL + ожидание готовности ───────────────────────
# Если на самом хосте запущен системный postgresql, гасим его, чтобы не занимал порт 5432
if command -v systemctl &>/dev/null && systemctl is-active --quiet postgresql; then
  echo "--> Detected active system-wide postgresql on host. Stopping it..."
  systemctl stop postgresql || true
fi

echo "--> Ensuring PostgreSQL is running..."

# Функция ожидания — принимает способ проверки
wait_for_pg() {
  local CHECK_CMD="$1"
  local MAX_WAIT=60
  local WAITED=0
  echo "--> Waiting for PostgreSQL to accept connections..."
  until eval "$CHECK_CMD" &>/dev/null; do
    if [ "$WAITED" -ge "$MAX_WAIT" ]; then
      echo "ERROR: PostgreSQL not ready after ${MAX_WAIT}s."
      exit 1
    fi
    sleep 1
    WAITED=$((WAITED + 1))
  done
  echo "--> PostgreSQL ready (${WAITED}s)."
}

if [ -n "$DC" ] && [ -f "docker-compose.prod.yml" ]; then
  # ── Способ 1: docker-compose ──────────────────────────────────────
  echo "--> Starting DB via $DC..."
  $DC -f docker-compose.prod.yml up -d db
  # Ждём через compose exec — имя сервиса всегда "db"
  wait_for_pg "$DC -f docker-compose.prod.yml exec -T db pg_isready -U postgres -q"

else
  # ── Способ 2: docker run (fallback) ───────────────────────────────
  echo "--> docker-compose.prod.yml not found. Starting via 'docker run'..."
  if docker ps -a --filter "name=^paint_db$" -q | grep -q .; then
    echo "--> Container paint_db exists. Starting..."
    docker start paint_db 2>/dev/null || true
  else
    echo "--> Creating new container paint_db..."
    docker run -d \
      --name paint_db \
      --restart always \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_PASSWORD=postgres \
      -e POSTGRES_DB=paint_platform_dev \
      -p 5433:5432 \
      -v paint_pgdata:/var/lib/postgresql/data \
      postgres:15
  fi
  # Ждём через docker exec с точным именем
  wait_for_pg "docker exec paint_db pg_isready -U postgres -q"
fi

# ─── 4. Резервное копирование БД (бэкап) ──────────────────────────────
echo "--> Creating database backup..."
mkdir -p backups
BACKUP_FILE="backups/backup_$(date +%Y%m%d_%H%M%S).sql"

if [ -n "$DC" ] && [ -f "docker-compose.prod.yml" ]; then
  if $DC -f docker-compose.prod.yml exec -T db pg_dump -U postgres paint_platform_dev > "$BACKUP_FILE" 2>/dev/null; then
    echo "--> Backup created successfully: $BACKUP_FILE"
  else
    echo "--> Backup skipped or failed (possibly a fresh database with no tables yet)."
    rm -f "$BACKUP_FILE"
  fi
else
  if docker exec paint_db pg_dump -U postgres paint_platform_dev > "$BACKUP_FILE" 2>/dev/null; then
    echo "--> Backup created successfully: $BACKUP_FILE"
  else
    echo "--> Backup skipped or failed (possibly a fresh database)."
    rm -f "$BACKUP_FILE"
  fi
fi

# Храним только последние 10 бэкапов
ls -t backups/backup_*.sql 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true

# ─── 5. Prisma: generate + apply schema ───────────────────────────────
echo "--> Running Prisma Client generation & database updates..."
npx prisma generate

if ! npx prisma db push --accept-data-loss; then
  echo "❌ Error: Prisma db push failed!"
  echo "--> Printing Database Container Logs for diagnosis:"
  if [ -n "$DC" ] && [ -f "docker-compose.prod.yml" ]; then
    $DC -f docker-compose.prod.yml logs db | tail -50
  else
    docker logs paint_db | tail -50
  fi
  exit 1
fi

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
  echo "--> No PM2 or Docker Compose for app. Building..."
  npm run build
  echo "--> Done. Run 'npm run start' to launch."
fi

echo "============================================="
echo "   Deployment completed successfully!        "
echo "============================================="
