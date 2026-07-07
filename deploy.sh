#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "============================================="
echo "   Paint Platform Deployment Automation     "
echo "============================================="

# 1. Pull latest code
echo "--> Pulling latest changes from Git..."
git pull origin main || git pull origin master

# 2. Install dependencies
echo "--> Installing npm packages..."
npm install --legacy-peer-deps

# 3. Database migrations and Client generation
echo "--> Running Prisma Client generation & database updates..."
npx prisma generate
npx prisma db push --accept-data-loss

# 4. Detect deployment type and run
if command -v pm2 &> /dev/null && [ -f "ecosystem.config.js" ]; then
  echo "--> PM2 detected! Building and reloading PM2 cluster..."
  npm run build
  pm2 reload ecosystem.config.js || pm2 start ecosystem.config.js
  echo "--> PM2 reload complete!"
elif command -v docker-compose &> /dev/null && [ -f "docker-compose.prod.yml" ]; then
  echo "--> Docker Compose detected! Building and starting containers..."
  docker-compose -f docker-compose.prod.yml up -d --build
  echo "--> Docker containers started!"
else
  echo "--> No PM2 or Docker detected. Running in standard Next.js build/start mode..."
  npm run build
  echo "--> Build complete. Please restart the Next.js process using 'npm run start'."
fi

echo "============================================="
echo "   Deployment completed successfully!        "
echo "============================================="
