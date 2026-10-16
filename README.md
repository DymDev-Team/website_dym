# Site web DYM

Site vitrine de DYM avec panneau d'administration.
En production : <https://website.dym-manufacture.com>

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

Le site tourne sur un VPS Ubuntu, derrière Caddy, qui gère le HTTPS automatiquement avec Let's Encrypt.

Prérequis :
- DNS chez LWS : un enregistrement `A website` qui pointe vers l'IPv4 du VPS
- Ports 80 et 443 ouverts dans le pare-feu Contabo

**Première installation** :

```bash
git clone https://github.com/DymDev-Team/website_dym.git && cd website_dym/dym
sudo bash docker/deploy.sh
docker compose --env-file .env.production -f compose.prod.yaml exec app php artisan app:make-admin vous@exemple.com
```

Le script [`dym/docker/deploy.sh`](dym/docker/deploy.sh) fait tout :
- installe Docker et Caddy
- configure le pare-feu
- génère `.env.production` avec une clé et des mots de passe aléatoires
- construit et démarre les conteneurs
- active le HTTPS

**Mise à jour** :

```bash
git pull && sudo bash docker/deploy.sh
```

Les migrations s'exécutent au démarrage du conteneur.

Ne jamais commiter `.env.production`. Pour la sauvegarde de la base, voir [`dym/DOCKER.md`](dym/DOCKER.md).
