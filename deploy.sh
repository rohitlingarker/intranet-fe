#!/bin/bash
set -e

APP_NAME="intranet-fe"
BUILD_DIR="./dist"
# DEST_DIR="/var/www/$APP_NAME/html"
DEST_DIR="/home/pavesadmin/timesheet-app"
SERVER_USER="pavesadmin"
SERVER_IP="192.168.2.120"
BRANCH="main"

echo "📥 Fetching latest code..."
git fetch origin

echo "🔄 Checking out latest $BRANCH..."
git stash --keep-index --quiet || true
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "🏗️ Building project from HEAD of $BRANCH..."
npm ci
npm run build

echo "🚀 Copying build files to server..."
ssh "$SERVER_USER@$SERVER_IP" "sudo rm -rf $DEST_DIR/*"
scp -r "$BUILD_DIR"/* "$SERVER_USER@$SERVER_IP:$DEST_DIR/"

echo "🔁 Reloading Nginx..."
ssh "$SERVER_USER@$SERVER_IP" "sudo systemctl reload nginx"

PREV_BRANCH=$(git rev-parse --abbrev-ref @{-1} 2>/dev/null || echo "")
if [ -n "$PREV_BRANCH" ] && [ "$PREV_BRANCH" != "$BRANCH" ]; then
    echo "↩️ Returning to previous branch ($PREV_BRANCH)..."
    git checkout "$PREV_BRANCH"
    git stash pop --quiet || true
fi

echo "✅ Deployment complete! (Deployed from origin/$BRANCH)"
