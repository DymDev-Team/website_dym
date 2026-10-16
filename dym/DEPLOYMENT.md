# Déploiement LWS

Le déploiement automatique est un miroir Git : GitHub Actions construit
`vendor/` et `public/build/`, pousse l'application construite sur la branche
`deploy`, puis appelle le webhook Laravel sur LWS. Le FTP reste un secours
manuel. Aucun accès SSH au serveur n'est requis.

Le dépôt Git est à la racine `website_dym/` ; l'application Laravel est dans
`website_dym/dym/`. Le document root de `dym.ci` doit pointer vers
`website_dym/dym/public/`. Le dossier `.git` est donc au-dessus du document
root.

## Prérequis LWS

- Sélectionner **PHP 8.4** pour le domaine. Le `composer.lock` contient des
  composants Symfony 8 qui exigent PHP 8.4.1 ou plus. LWS propose PHP 8.4 dans
  son sélecteur cPanel.
- Activer les extensions PHP `pdo_mysql`, `mbstring`, `fileinfo`, `openssl`,
  `curl`, `xml`, `zip`, `bcmath` et `intl`.
- Le miroir Git exige `git` et `proc_open` activés sur l'hébergement.
- Configurer la base MySQL LWS et les droits d'écriture sur `storage/` et
  `bootstrap/cache/`.
- Le serveur doit pouvoir joindre GitHub en HTTPS.

Le webhook de diagnostic, une fois configuré, confirme la version PHP,
`proc_open` et la présence de Git sans modifier les fichiers :
`https://dym.ci/api/deploy/probe?token=LE_DEPLOY_TOKEN`.

## 1. Préparer le `.env` de production

Créer `website_dym/dym/.env` sur LWS et y renseigner au minimum :

```dotenv
APP_NAME=DYM
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:...
APP_URL=https://dym.ci

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=COMPTE_BASE
DB_USERNAME=COMPTE_UTILISATEUR
DB_PASSWORD=mot-de-passe-fort

DEPLOY_TOKEN=jeton-aleatoire
```

Utiliser les valeurs de base de données affichées dans le panneau LWS. Générer
le jeton avec :

```bash
php -r 'echo bin2hex(random_bytes(32));'
```

Conserver la même valeur pour `DEPLOY_TOKEN` dans `.env` et le secret GitHub
`DEPLOY_WEBHOOK_TOKEN`. Ne jamais commiter `.env`.

## 2. Ajouter les secrets et variables GitHub

Dans **Settings > Secrets and variables > Actions**, ajouter :

| Nom | Type | Valeur |
| --- | --- | --- |
| `DEPLOY_WEBHOOK_URL` | secret | `https://dym.ci/api/deploy` |
| `DEPLOY_WEBHOOK_TOKEN` | secret | La même valeur que `DEPLOY_TOKEN` dans le `.env` LWS |
| `FTP_SERVER` | secret | Hôte FTP fourni par LWS, pour le secours manuel |
| `FTP_USERNAME` | secret | Identifiant FTP, pour le secours manuel |
| `FTP_PASSWORD` | secret | Mot de passe FTP, pour le secours manuel |
| `FTP_SERVER_DIR` | variable | Chemin FTP du dossier `website_dym/dym/` |

La clé `GITHUB_TOKEN` intégrée au workflow Git miroir doit conserver la
permission d'écriture du contenu du dépôt. Pour le clone LWS, créer un token
GitHub en lecture seule avec accès au dépôt `DymDev-Team/website_dym`.

## 3. Déployer le webhook une première fois par FTP

Depuis **Actions > Deploy via FTP (LWS) > Run workflow**, lancer le workflow
FTP manuel. Il copie l'application dans `website_dym/dym/` et appelle
`/api/deploy` pour lancer les migrations et nettoyer les caches. Cette étape
installe les routes du webhook sur LWS avant le premier miroir Git.

## 4. Initialiser le dépôt Git sur LWS

Dans le terminal LWS, se placer à la racine `website_dym/` (le parent de `dym/`)
et configurer le remote en lecture seule. Remplacer `LE_TOKEN` par le token
GitHub, sans l'enregistrer dans un historique partagé :

```bash
cd ~/public_html/website_dym
git init
git remote add origin https://github.com/DymDev-Team/website_dym.git
git config http.extraheader "Authorization: Basic $(printf 'x-access-token:%s' LE_TOKEN | base64 -w0)"
git fetch origin
```

Ne configurez pas le token dans l'URL du remote. Il est stocké dans
`.git/config`, hors du document root. Ne lancez pas `git clean` : il supprimerait
les fichiers ignorés, dont le `.env` et les fichiers de `storage/`.

## 5. Tester puis activer le miroir automatique

Lancer **Actions > Deploy Git Mirror (LWS) > Run workflow** sur `main`. Le
workflow construit l'application avec PHP 8.4 et Node 22, pousse les artefacts
sur `deploy`, puis appelle `POST /api/deploy/git`. Vérifier que le run est vert
et que `https://dym.ci/up` répond.

Après un premier run manuel réussi, les push sur `main` déclenchent le miroir
automatiquement. Le workflow `Deploy via FTP (LWS)` reste manuel comme secours.

Le webhook exécute `migrate --force`, `storage:link --force`, `optimize:clear`
et `queue:restart`. Le miroir remplace les fichiers suivis ; `.env` et
`storage/`, ignorés par Git, sont conservés. Il n'exécute aucun `git clean`.

## Dépannage

- **HTTP 403** : vérifier que `DEPLOY_TOKEN` sur LWS et
  `DEPLOY_WEBHOOK_TOKEN` dans GitHub sont identiques et que le cache de config
  Laravel a été vidé.
- **`proc_open` indisponible** : le miroir Git ne peut pas fonctionner sur ce
  plan LWS ; utiliser le workflow FTP manuel et lancer les commandes Artisan
  depuis le terminal LWS.
- **Git demande un identifiant GitHub** : vérifier le header `http.extraheader`
  et rechercher les éventuelles clés HTTP configurées plusieurs fois avec
  `git config --get-regexp "http\\..*\\.extraheader"`.
- **Première installation** : le webhook doit d'abord être transféré par FTP,
  et le remote Git doit être configuré avant le premier déploiement miroir.

Sauvegarder la base de données depuis le panneau LWS avant toute opération de
maintenance importante.
