# syntax=docker/dockerfile:1

# --- 1. Dépendances PHP (prod) ---
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

# --- 2. Build des assets (Wayfinder a besoin de PHP + artisan) ---
FROM serversideup/php:8.4-cli AS assets
USER root
COPY --from=node:24-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:24-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm
WORKDIR /var/www/html
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY . .
COPY --from=vendor /app/vendor ./vendor
# Base SQLite en mémoire : le build n'a besoin d'aucune vraie base de données.
ENV APP_ENV=production \
    APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= \
    DB_CONNECTION=sqlite \
    DB_DATABASE=:memory:
RUN composer dump-autoload --optimize --no-dev \
    && npm ci \
    && npm run build

# --- 3. Image finale ---
FROM serversideup/php:8.4-fpm-nginx AS production
ENV APP_ENV=production \
    APP_DEBUG=false \
    DB_CONNECTION=mysql \
    DB_HOST=mysql \
    DB_PORT=3306 \
    AUTORUN_ENABLED=true \
    AUTORUN_LARAVEL_MIGRATION=true \
    AUTORUN_LARAVEL_OPTIMIZE=true \
    PHP_OPCACHE_ENABLE=1

WORKDIR /var/www/html
COPY --chown=www-data:www-data . .
# vendor/ avec l'autoloader optimisé généré à l'étape assets.
COPY --chown=www-data:www-data --from=assets /var/www/html/vendor ./vendor
COPY --chown=www-data:www-data --from=assets /var/www/html/public/build ./public/build

USER root
RUN chown -R www-data:www-data storage bootstrap/cache
USER www-data
