# Docker en développement

Prérequis : Docker Desktop démarré avec le moteur Linux (WSL 2 sous Windows).
La configuration utilise Laravel Sail, PHP 8.5, Node 24 et la base SQLite du projet.
Les dépendances Node sont isolées dans un volume Docker pour éviter de réutiliser
les modules binaires installés sous Windows.

## Premier lancement (PowerShell)

Depuis la racine du projet, avec `vendor` installé :

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
if (!(Test-Path database/database.sqlite)) { New-Item database/database.sqlite -ItemType File }
docker compose build laravel.test
docker compose run --rm laravel.test composer install
docker compose run --rm -e SUPERVISOR_PHP_USER=root laravel.test npm ci
```

Si `APP_KEY` est vide dans `.env`, générer la clé une seule fois :

```powershell
docker compose run --rm laravel.test php artisan key:generate
```

Créer les tables puis démarrer les services :

```powershell
docker compose run --rm laravel.test php artisan migrate
docker compose up -d
```

Application : http://localhost:8000. Vite : http://localhost:5173.
Le service `queue` traite les tâches en base de données.
La base est MySQL 8.4 (service `mysql`, données dans le volume `mysql_data`).
Dans `.env` :

```dotenv
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=dym
DB_USERNAME=sail
DB_PASSWORD=password
FORWARD_DB_PORT=3307
```

Depuis Windows (HeidiSQL, DBeaver…), MySQL est accessible sur `127.0.0.1:3307`.
Les commandes `php artisan` doivent être lancées dans le conteneur
(`docker compose exec laravel.test php artisan …`), car l'hôte `mysql`
n'existe que sur le réseau Docker.

### Performances (code monté depuis Windows)

Le projet est monté depuis le disque Windows, où chaque accès fichier est lent.
OPcache ne revérifie donc pas les fichiers PHP (`docker/php/99-dev.ini`).
**Après modification d'un fichier PHP** (contrôleur, route, config…) :

```powershell
docker compose restart laravel.test
```

Les fichiers React/CSS ne sont pas concernés (Vite recharge à chaud).
Pour revenir au comportement standard, plus lent : `PHP_OPCACHE_VALIDATE_TIMESTAMPS=1` dans `.env`.

## Commandes courantes

```powershell
docker compose logs --tail=100 -f
docker compose exec laravel.test php artisan test
docker compose exec laravel.test php artisan migrate
docker compose exec vite npm run build
docker compose stop
docker compose start
docker compose down
```

Après une modification de `package-lock.json`, arrêter Vite, réinstaller les
dépendances, puis le redémarrer :

```powershell
docker compose stop vite
docker compose run --rm -e SUPERVISOR_PHP_USER=root laravel.test npm ci
docker compose up -d vite
```

Le port HTTP peut être changé avec `APP_PORT` dans `.env` ; adapter aussi
`APP_URL`. Le port Vite reste 5173.
Après l'arrêt de Docker, avant de revenir à un serveur PHP local, supprimer
`public/hot` si ce fichier existe afin que Laravel utilise les assets compilés.

Si le moteur Docker est inaccessible, ouvrir Docker Desktop, attendre son
démarrage et vérifier `docker info`. Sous Windows, sélectionner les conteneurs
Linux si Docker Desktop utilise actuellement les conteneurs Windows.

## Production

`Dockerfile` (multi-étapes) construit une image `serversideup/php` FPM + Nginx
avec les dépendances Composer sans dev et les assets Vite compilés.
`compose.prod.yaml` lance l'application (port 8080), un worker de queue et
MySQL 8.4. Les données MySQL et `storage/app` sont dans des volumes nommés ;
MySQL n'est pas exposé hors du réseau Docker.

```powershell
Copy-Item .env.example .env.production   # puis renseigner les valeurs ci-dessous
docker compose --env-file .env.production -f compose.prod.yaml build
docker compose --env-file .env.production -f compose.prod.yaml up -d
```

`--env-file .env.production` est obligatoire : il fournit aussi les identifiants
au conteneur MySQL (sinon la commande échoue avec « DB_… manquant »).

Dans `.env.production` :

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:...            # php artisan key:generate --show
APP_URL=https://dym.ci

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=dym
DB_USERNAME=dym
DB_PASSWORD=<mot de passe fort>
DB_ROOT_PASSWORD=<autre mot de passe fort>
```

Les migrations et la mise en cache s'exécutent au démarrage (`AUTORUN_*`),
une fois MySQL prêt. Placer un reverse proxy TLS (Caddy, Traefik, Nginx)
devant le port 8080. `.env.production` ne doit jamais être commité.

### Déploiement automatique (GitHub Actions + SSH)

Le workflow [`../.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)
se déclenche sur chaque push vers `main` qui modifie `dym/`, ou manuellement
depuis l'onglet Actions. Il se connecte au VPS, met le clone de
`/opt/website_dym` sur le commit poussé, puis lance `dym/docker/deploy.sh` avec
`sudo`. Le script reconstruit et redémarre les conteneurs Docker ; les
migrations et le cache Laravel sont appliqués au démarrage de l'application.
Le workflow vérifie ensuite `https://dym.ci/up`.

#### Secrets et variables GitHub

Dans **Settings > Secrets and variables > Actions**, ajouter les secrets
suivants dans l'environnement GitHub `production` (ou au niveau du dépôt) :

| Nom | Type | Valeur |
| --- | --- | --- |
| `VPS_HOST` | secret | Adresse IP ou nom DNS du VPS |
| `VPS_USER` | secret | Utilisateur SSH autorisé à lancer le déploiement |
| `VPS_SSH_KEY` | secret | Clé privée SSH correspondant à la clé publique installée sur le VPS |
| `VPS_PORT` | secret, facultatif | Port SSH ; `22` par défaut |
| `VPS_KNOWN_HOSTS` | secret, recommandé | Ligne `known_hosts` vérifiée pour le VPS |

Variable facultative : `VPS_APP_DIR`, chemin absolu du clone sur le VPS ; sa
valeur par défaut est `/opt/website_dym`.

La clé publique SSH doit être autorisée pour `VPS_USER`. Cet utilisateur doit
pouvoir lire le clone et exécuter `sudo -n bash /opt/website_dym/dym/docker/deploy.sh`
sans saisie de mot de passe. Le script crée `.env.production` au premier
lancement ; vérifier ensuite les paramètres de messagerie et conserver ce
fichier uniquement sur le VPS.

Si le job s'arrête pendant « Validate SSH deployment secrets », vérifier que
`VPS_HOST`, `VPS_USER` et `VPS_SSH_KEY` existent dans la portée utilisée par
l'environnement `production`. Le workflow échoue volontairement avant toute
connexion lorsque l'un d'eux manque.

Pour tester manuellement : **Actions > deploy > Run workflow**. Après le
premier déploiement, vérifier l'étape de santé et ouvrir <https://dym.ci/up>.

Sauvegarde de la base :

```powershell
docker compose --env-file .env.production -f compose.prod.yaml exec mysql sh -c 'mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" dym' > dym.sql
```
