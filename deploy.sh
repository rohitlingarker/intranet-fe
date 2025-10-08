#!/bin/bash
set -e

APP_NAME="intranet-fe"
BUILD_DIR="./dist"
DEST_DIR="/var/www/$APP_NAME/html"
SERVER_USER="pavesadmin"
SERVER_IP="192.168.2.75"

echo "🏗️ Building project..."
npm run build

echo "🚀 Deploying build to server..."
rsync -avz --delete "$BUILD_DIR"/ "$SERVER_USER@$SERVER_IP:$DEST_DIR/"

echo "🔁 Restarting Nginx..."
ssh "$SERVER_USER@$SERVER_IP" "sudo systemctl reload nginx"

echo "✅ Deployment complete!"
