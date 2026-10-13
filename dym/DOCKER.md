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
Conserver `DB_CONNECTION=sqlite` et `APP_URL=http://localhost:8000` dans `.env`.
Si `DB_DATABASE` est défini, son chemin doit être valide dans le conteneur
(par exemple `/var/www/html/database/database.sqlite`).

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
