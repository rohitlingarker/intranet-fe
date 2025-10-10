#!/bin/bash
set -e

APP_NAME="intranet-fe"
BUILD_DIR="./dist"
DEST_DIR="/var/www/$APP_NAME/html"
TMP_DIR="/tmp/${APP_NAME}_deploy"
SERVER_USER="pavesadmin"
SERVER_IP="192.168.2.120"
BRANCH="main"

echo "📥 Fetching latest code..."
git fetch origin
git stash --keep-index --quiet || true
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "🏗️ Building project..."
npm ci
npm run build

echo "🚀 Uploading build to temporary folder on server..."
ssh "$SERVER_USER@$SERVER_IP" "rm -rf $TMP_DIR && mkdir -p $TMP_DIR"
scp -r "$BUILD_DIR"/* "$SERVER_USER@$SERVER_IP:$TMP_DIR/"

echo "🔁 Moving build to production folder and reloading Nginx..."
ssh -t "$SERVER_USER@$SERVER_IP" "
    sudo rm -rf $DEST_DIR/* && \
    sudo cp -r $TMP_DIR/* $DEST_DIR/ && \
    sudo chown -R www-data:www-data $DEST_DIR && \
    rm -rf $TMP_DIR && \
    sudo systemctl reload nginx
"

echo "✅ Deployment complete!"
