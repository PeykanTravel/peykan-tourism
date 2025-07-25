#!/usr/bin/env bash
set -e

echo "⏹️ Stopping containers..."
docker-compose -f docker-compose.production.yml down

echo "🗑️ Removing host logs directory to reset permissions..."
rm -rf ./logs

echo "🔄 Starting containers..."
docker-compose -f docker-compose.production.yml up -d

echo "⏳ Waiting 10s for containers to initialize..."
sleep 10

echo "✅ Containers status:"
docker-compose -f docker-compose.production.yml ps

echo "📄 Last 20 lines of backend logs:"
docker-compose -f docker-compose.production.yml logs --tail=20 backend

echo "📄 Last 20 lines of frontend logs:"
docker-compose -f docker-compose.production.yml logs --tail=20 frontend

echo "🎉 Done!"
