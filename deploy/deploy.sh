#!/usr/bin/env bash
# One-shot deploy/update on the VPS. Run as the user that owns Docker.
#   curl -fsSL https://raw.githubusercontent.com/TaherSayed/-Claude/main/deploy/deploy.sh | bash
# or, once cloned:  ./deploy/deploy.sh
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/TaherSayed/-Claude.git}"
APP_DIR="${APP_DIR:-/opt/barber-ai-stylist}"
BRANCH="${BRANCH:-main}"

if ! command -v docker >/dev/null; then
  echo "Docker is not installed. Install it first: https://docs.docker.com/engine/install/" >&2
  exit 1
fi

if [ -d "$APP_DIR/.git" ]; then
  echo "▶ Updating $APP_DIR"
  git -C "$APP_DIR" fetch origin "$BRANCH"
  git -C "$APP_DIR" reset --hard "origin/$BRANCH"
else
  echo "▶ Cloning into $APP_DIR"
  sudo mkdir -p "$APP_DIR" && sudo chown "$(id -u):$(id -g)" "$APP_DIR"
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"
echo "▶ Building and starting container"
docker compose up -d --build --remove-orphans
docker image prune -f >/dev/null

echo
echo "✅ Barber AI Stylist is running on http://$(hostname -I | awk '{print $1}'):8088"
echo "   Put it behind HTTPS (see deploy/Caddyfile.example) - the camera only works over https://"
