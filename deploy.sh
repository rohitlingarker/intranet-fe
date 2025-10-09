#!/bin/bash
set -e

APP_NAME="intranet-fe"
BUILD_DIR="./dist"
DEST_DIR="/var/www/$APP_NAME/html"
SERVER_USER="pavesadmin"
SERVER_IP="192.168.2.120"
BRANCH="main"

echo "📥 Fetching latest code..."
git fetch origin
git stash --keep-index --quiet || true
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "🏗️ Building project from HEAD of $BRANCH..."
npm ci
npm run build

echo "🚀 Deploying build to server..."
ssh -t "$SERVER_USER@$SERVER_IP" "sudo rm -rf $DEST_DIR/*"
scp -r "$BUILD_DIR"/* "$SERVER_USER@$SERVER_IP:$DEST_DIR/"
ssh -t "$SERVER_USER@$SERVER_IP" "sudo systemctl reload nginx"

echo "✅ Deployment complete!"
