# Site web DYM

Site vitrine de DYM avec panneau d'administration.
En production : <https://dym.ci>

Le code de l'application se trouve dans le dossier [`dym/`](dym/).

## Fonctionnalités

**Site public**
- Accueil, activités, actualités
- Demande de devis, avec pièce jointe
- Carrières : offres d'emploi et candidature avec CV
- Pages légales

**Administration (`/admin`)**
- Contenu du site : activités, réalisations, actualités, équipements, partenaires, témoignages, textes, paramètres
- Recrutement : offres d'emploi et candidatures reçues
- Demandes de devis
- Pages légales
- Comptes utilisateurs

## Stack

- Laravel 13 (PHP 8.4), Inertia 3, React 19, Tailwind CSS 4, Vite
- MySQL 8.4
- Docker : Laravel Sail en développement, `serversideup/php` en production

## Développement

Prérequis : Docker Desktop, avec le moteur Linux (WSL 2 sous Windows).

```powershell
cd dym
docker compose up -d
```

- Site : <http://localhost:8000>
- Vite : <http://localhost:5173>
- MySQL : `127.0.0.1:3307`

Le premier lancement (dépendances, clé, migrations) est détaillé dans [`dym/DOCKER.md`](dym/DOCKER.md).

Commandes utiles :

```powershell
docker compose exec laravel.test php artisan migrate
docker compose exec laravel.test php artisan test
docker compose exec laravel.test php artisan app:make-admin vous@exemple.com
docker compose stop
```

`app:make-admin` donne l'accès à `/admin`, et crée le compte s'il n'existe pas. L'inscription publique est désactivée.

## Production

Le site est hébergé chez LWS. Le déploiement automatique utilise le miroir Git
sur la branche `deploy`, puis exécute les migrations via un webhook Laravel.
Le FTP reste disponible comme secours manuel. La procédure, les secrets GitHub,
le réglage PHP et l'installation initiale sont décrits dans
[`dym/DEPLOYMENT.md`](dym/DEPLOYMENT.md).

Sur LWS, l'application Laravel et le dépôt Git se trouvent dans
`public_html/dym-website/`. Le document root doit viser
`public_html/dym-website/public/`. La branche `deploy` place le contenu de
`dym/` à la racine de ce dossier. Ne jamais commiter le `.env` de production.
