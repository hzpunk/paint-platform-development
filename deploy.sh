#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "============================================="
echo "   Paint Platform Deployment Automation     "
echo "============================================="

# ─── 1. Pull latest code ──────────────────────
echo "--> Pulling latest changes from Git..."
git pull origin main || git pull origin master

# ─── 2. Install dependencies ──────────────────
echo "--> Installing npm packages..."
npm install --legacy-peer-deps

# ─── 3. Ensure PostgreSQL is running via Docker ───
# Запускаем только контейнер с БД (не всё приложение),
# независимо от того, используется ли PM2 или docker-compose для app.
echo "--> Starting database container..."
if command -v docker-compose &>/dev/null && [ -f "docker-compose.prod.yml" ]; then
  docker-compose -f docker-compose.prod.yml up -d db
  echo "--> Waiting for PostgreSQL to be ready..."

  # Ждём до 30 секунд, пока БД не примет соединения
  MAX_WAIT=30
  WAITED=0
  until docker-compose -f docker-compose.prod.yml exec -T db pg_isready -U postgres -q 2>/dev/null; do
    if [ "$WAITED" -ge "$MAX_WAIT" ]; then
      echo "ERROR: PostgreSQL did not become ready in ${MAX_WAIT}s. Aborting."
      exit 1
    fi
    sleep 1
    WAITED=$((WAITED + 1))
  done
  echo "--> PostgreSQL is ready (waited ${WAITED}s)."
else
  echo "WARNING: docker-compose.prod.yml not found. Assuming external DB is available."
fi

# ─── 4. Prisma: generate client + apply migrations ───
echo "--> Running Prisma Client generation & database updates..."
npx prisma generate
npx prisma db push --accept-data-loss

# ─── 5. Build & restart app ───────────────────
if command -v pm2 &>/dev/null && [ -f "ecosystem.config.js" ]; then
  echo "--> PM2 detected! Building and reloading PM2 cluster..."
  npm run build
  pm2 reload ecosystem.config.js || pm2 start ecosystem.config.js
  echo "--> PM2 reload complete!"

elif command -v docker-compose &>/dev/null && [ -f "docker-compose.prod.yml" ]; then
  echo "--> Docker Compose: building and starting app container..."
  docker-compose -f docker-compose.prod.yml up -d --build app
  echo "--> Docker containers started!"

else
  echo "--> No PM2 or Docker detected. Running standard Next.js build..."
  npm run build
  echo "--> Build complete. Please restart the Next.js process using 'npm run start'."
fi

echo "============================================="
echo "   Deployment completed successfully!        "
echo "============================================="
