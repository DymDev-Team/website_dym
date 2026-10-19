# Déploiement LWS

Le déploiement automatique est un miroir Git : GitHub Actions construit
`vendor/` et `public/build/`, pousse l'application construite sur la branche
`deploy`, puis appelle le webhook Laravel sur LWS. Le FTP reste un secours
manuel. Aucun accès SSH au serveur n'est requis.

Sur LWS, le clone Git et l'application Laravel sont dans
`~/public_html/dym-website/`, et le document root de `dym.ci` pointe vers
`~/public_html/dym-website/public/`. La branche GitHub `deploy` contient
`dym/` aplati à sa racine (avec `vendor/` et `public/build/`) : le serveur n'a
besoin ni de Composer ni de Node.

## Prérequis LWS

- **PHP 8.4.1 ou plus récent** pour le domaine `dym.ci` (cPanel > *MultiPHP
  Manager*) : le `composer.lock` contient des composants Symfony 8. En PHP 8.2,
  Laravel s'arrête sur une erreur de `platform_check.php`.
- Extensions PHP `pdo_mysql`, `mbstring`, `fileinfo`, `openssl`, `curl`, `xml`,
  `zip`, `bcmath` et `intl`.
- `git` et `proc_open` disponibles (déjà vérifié sur ce compte LWS).

## 1. Bascule du dossier (une seule fois, depuis cPanel)

`~/public_html/dym-website/` contient encore l'ancienne application (dépôt
`DymDev-Team/dym-website`), sans le webhook du site : le premier envoi passe
par le workflow FTP, ensuite tout passe par le miroir Git.

1. **Sauvegarde** : cPanel > *phpMyAdmin* > Exporter la base actuelle, et
   *Gestionnaire de fichiers* > `public_html/dym-website` > *Compresser*.

2. **Nouvelle base** : cPanel > *Bases de données MySQL* > créer une base
   (ex. `c2586884c_vitrine`) et un utilisateur avec tous les privilèges. Ne pas
   réutiliser la base de l'ancienne application : ses tables (`users`,
   `migrations`…) entreraient en conflit avec les migrations du site.

3. **`.env`** : cPanel > *Gestionnaire de fichiers* > `public_html/dym-website/.env`
   (afficher les fichiers cachés) > *Modifier*, remplacer tout le contenu par :

   ```dotenv
   APP_NAME=DYM
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=base64:...
   APP_URL=https://dym.ci
   APP_LOCALE=fr

   LOG_CHANNEL=daily
   LOG_LEVEL=error

   DB_CONNECTION=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_DATABASE=c2586884c_vitrine
   DB_USERNAME=c2586884c_vitrine
   DB_PASSWORD=mot-de-passe-de-la-base

   SESSION_DRIVER=database
   CACHE_STORE=database
   QUEUE_CONNECTION=sync

   MAIL_MAILER=smtp
   MAIL_HOST=mail.dym.ci
   MAIL_PORT=465
   MAIL_SCHEME=smtps
   MAIL_USERNAME=info@dym.ci
   MAIL_PASSWORD=mot-de-passe-de-la-boite
   MAIL_FROM_ADDRESS=info@dym.ci
   MAIL_FROM_NAME=DYM

   DEPLOY_TOKEN=jeton-aleatoire
   ```

   `MAIL_HOST` : serveur SMTP affiché dans cPanel > *Comptes de messagerie*.
   `APP_KEY` et `DEPLOY_TOKEN` se génèrent ainsi (sur n'importe quel poste avec PHP) :

   ```bash
   php -r 'echo "base64:".base64_encode(random_bytes(32)), PHP_EOL;'   # APP_KEY
   php -r 'echo bin2hex(random_bytes(32)), PHP_EOL;'                   # DEPLOY_TOKEN
   ```

   Permissions du fichier : 600. `QUEUE_CONNECTION=sync` : pas de worker de queue sur
   l'hébergement mutualisé.

4. **PHP 8.4** : cPanel > *MultiPHP Manager* > `dym.ci` > PHP 8.4.
5. **Secrets GitHub** (section 2), puis **Actions > Deploy via FTP (LWS) >
   Run workflow**. Ce premier envoi (long : tout `vendor/`) supprime les caches
   de l'ancienne application dans `bootstrap/cache/`, copie le site, puis
   appelle `/api/deploy` qui crée les tables.
6. **Contrôle** : `https://dym.ci/api/deploy/probe?token=LE_DEPLOY_TOKEN` doit
   renvoyer `php_version` 8.4.x et `option1_git_reset_possible: true`.

Au premier appel du miroir Git (section 3), le webhook rebranche lui-même le
dépôt Git du dossier (`origin`) sur `DymDev-Team/website_dym` et retire les
en-têtes d'authentification de l'ancien dépôt : aucun terminal n'est nécessaire.

Le dépôt `DymDev-Team/dym-website` a son propre workflow qui appelle aussi
`dym.ci` : le désactiver (GitHub > Actions > workflow > *Disable workflow*)
pour qu'il ne tente plus de déployer ici.

## 2. Secrets GitHub

Dans **Settings > Secrets and variables > Actions** du dépôt `website_dym` :

| Nom | Type | Valeur |
| --- | --- | --- |
| `DEPLOY_WEBHOOK_URL` | secret | `https://dym.ci/api/deploy` (exactement) |
| `DEPLOY_WEBHOOK_TOKEN` | secret | la même valeur que `DEPLOY_TOKEN` dans le `.env` LWS |
| `FTP_SERVER` | secret | `ftp.dym-manufacture.com` |
| `FTP_USERNAME` | secret | `website@dym-manufacture.com` |
| `FTP_PASSWORD` | secret | mot de passe de ce compte FTP |

Ce compte FTP s'ouvre directement dans `public_html/dym-website` : le workflow
envoie donc à la racine du compte (`./`). Ne définir la variable
`FTP_SERVER_DIR` que pour un autre compte FTP (chemin relatif à sa racine).
Connexion en FTPS explicite (port 21), certificat non vérifié (celui du
serveur mutualisé ne porte pas le nom `ftp.dym-manufacture.com`).

## 3. Tester puis activer le miroir automatique

Lancer **Actions > Deploy Git Mirror (LWS) > Run workflow** sur `main`. Le
workflow construit l'application avec PHP 8.4 et Node 22, pousse les artefacts
sur `deploy`, puis appelle `POST /api/deploy/git`. Vérifier que le run est vert
et que `https://dym.ci/up` répond.

Les push sur `main` déploient automatiquement par FTP (`deploy.yml`). Le miroir
Git (`deploy-git-mirror.yml`) se lance à la main.

Le webhook exécute `migrate --force`, `storage:link --force`, `optimize:clear`
et `queue:restart`. Le miroir remplace les fichiers suivis ; `.env` et
`storage/`, ignorés par Git, sont conservés. Il n'exécute aucun `git clean`.

## Dépannage

- **HTTP 404 sur `/api/deploy/git`** : `dym.ci` sert encore l'ancienne
  application. Lancer le workflow FTP (étape 1.5).
- **HTTP 403** : `DEPLOY_TOKEN` (LWS) et `DEPLOY_WEBHOOK_TOKEN` (GitHub)
  diffèrent, ou un ancien cache de config est actif
  (`rm -f bootstrap/cache/config.php` dans le terminal).
- **HTTP 500 `git_fetch`** : le serveur ne joint pas GitHub ou le remote est
  faux ; `git -C ~/public_html/dym-website remote -v` doit afficher
  `https://github.com/DymDev-Team/website_dym.git`. La réponse du webhook
  contient `git_remote`.
- **Page blanche / erreur `platform_check`** : le domaine n'est pas en PHP 8.4.
- **`proc_open` indisponible** : utiliser le workflow FTP manuel.

Ne jamais lancer `git clean` dans le clone : il supprimerait `.env` et
`storage/`. Sauvegarder la base depuis le panneau LWS avant toute opération de
maintenance importante.
