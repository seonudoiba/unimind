#!/bin/bash
set -e

echo "🚀 Starting UniMindKidz Backend Deployment..."

# 1. Pull latest code from git repository
echo "📦 Pulling latest changes from git..."
git pull origin main

# 2. Install production dependencies
echo "📥 Installing dependencies..."
npm ci --only=production

# 3. Generate Prisma client & sync schema migrations
echo "🗄️ Running Prisma migrations & client generation..."
npx prisma generate
npx prisma db push --accept-data-loss

# 4. Ensure logs and uploads directories exist
mkdir -p logs uploads

# 5. Reload PM2 processes gracefully with zero downtime
echo "♻️ Reloading PM2 processes..."
pm2 reload ecosystem.config.cjs --env production || pm2 start ecosystem.config.cjs --env production

echo "✅ Deployment completed successfully!"
pm2 status
