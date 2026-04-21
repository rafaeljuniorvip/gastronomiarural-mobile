#!/bin/bash
# Deploy gastronomiarural-mobile para o servidor
# Sincroniza src/ e config, reinicia o Expo via systemd

SERVER="root@ptbd01.viptecnologia.com.br"
REMOTE_DIR="/opt/gastronomiarural-mobile"
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Sincronizando arquivos para $SERVER:$REMOTE_DIR..."

rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.expo' \
  --exclude '.git' \
  "$LOCAL_DIR/" "$SERVER:$REMOTE_DIR/"

echo "==> Instalando dependencias no servidor..."
ssh "$SERVER" "cd $REMOTE_DIR && npm install --legacy-peer-deps 2>&1 | tail -3"

echo "==> Reiniciando Expo (systemd)..."
ssh "$SERVER" "systemctl restart gastronomiarural-expo"

sleep 10
echo "==> Verificando status..."
ssh "$SERVER" "systemctl status gastronomiarural-expo --no-pager | head -8"

echo "==> Deploy concluido!"
echo ""
echo "URL Expo Go: exp://expo.gastronomiarural.viptecnologia.com.br"
