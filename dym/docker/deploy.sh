#!/usr/bin/env bash
# Installation / mise à jour en production sur un VPS Ubuntu (24.04).
# À lancer depuis la racine du dépôt cloné : sudo bash docker/deploy.sh
# Relancé à chaque push sur main par .github/workflows/deploy.yml (via SSH).
set -euo pipefail

cd "$(dirname "$0")/.."
COMPOSE=(docker compose --env-file .env.production -f compose.prod.yaml)
APP_URL=https://dym.ci

set_env() {
    if grep -qE "^#? *$1=" .env.production; then
        sed -i -E "s|^#? *$1=.*|$1=$2|" .env.production
    else
        echo "$1=$2" >> .env.production
    fi
}

# 1. Docker et Caddy
if ! command -v docker >/dev/null; then
    curl -fsSL https://get.docker.com | sh
fi
if ! command -v caddy >/dev/null; then
    apt-get update
    apt-get install -y caddy
fi

# 2. Pare-feu (penser aussi au pare-feu du panneau Contabo s'il est actif)
if command -v ufw >/dev/null; then
    ufw allow OpenSSH
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
fi

# 3. .env.production généré au premier lancement (mots de passe aléatoires)
if [ ! -f .env.production ]; then
    cp .env.example .env.production
    set_env APP_NAME DYM
    set_env APP_ENV production
    set_env APP_DEBUG false
    set_env APP_KEY "base64:$(openssl rand -base64 32)"
    set_env DB_CONNECTION mysql
    set_env DB_HOST mysql
    set_env DB_PORT 3306
    set_env DB_DATABASE dym
    set_env DB_USERNAME dym
    set_env DB_PASSWORD "$(openssl rand -hex 24)"
    set_env DB_ROOT_PASSWORD "$(openssl rand -hex 24)"
    chmod 600 .env.production
    echo ".env.production créé (vérifier la configuration mail avant la mise en ligne)."
fi

# Toujours aligné sur le domaine courant (y compris pour un .env.production existant).
set_env APP_URL "$APP_URL"

# 4. Build et démarrage (migrations et cache lancés au démarrage via AUTORUN_*)
"${COMPOSE[@]}" build
"${COMPOSE[@]}" up -d --remove-orphans
docker image prune -f >/dev/null

# 5. HTTPS
cp docker/Caddyfile /etc/caddy/Caddyfile
systemctl reload caddy || systemctl restart caddy

"${COMPOSE[@]}" ps
echo
echo "Site : $APP_URL"
echo "Compte admin : ${COMPOSE[*]} exec app php artisan app:make-admin vous@exemple.com"
