<?php

namespace Database\Seeders;

use App\Models\LegalPage;
use Illuminate\Database\Seeder;

/**
 * Default legal pages. Texts to be reviewed (and the "[à compléter]" parts
 * filled in) from Admin › Pages légales before going live.
 *
 * Existing pages are never overwritten.
 */
class LegalPageSeeder extends Seeder
{
    /**
     * Seed the legal pages.
     */
    public function run(): void
    {
        foreach ($this->pages() as $slug => [$title, $body]) {
            LegalPage::query()->firstOrCreate(['slug' => $slug], ['title' => $title, 'body' => $body]);
        }
    }

    /**
     * @return array<string, array{0: string, 1: string}>
     */
    private function pages(): array
    {
        return [
            'mentions-legales' => ['Mentions légales', <<<'TEXT'
## Éditeur du site

Le site est édité par DYM Manufacture, entreprise de conception, d’usinage et de fabrication métallique.

- Forme juridique et capital : [à compléter]
- RCCM : [à compléter]
- Compte contribuable : [à compléter]
- Siège social : {{address}}
- Téléphone : {{phone}}
- E-mail : {{email}}

Directeur de la publication : [à compléter]

## Hébergement

Le site est hébergé par : [nom, adresse et contact de l’hébergeur — à compléter].

## Conception et réalisation

Site conçu et développé par DYM DEV.

## Propriété intellectuelle

L’ensemble des contenus de ce site (textes, photographies, plans, logos, vidéos) est la propriété de DYM Manufacture ou de ses partenaires, et est protégé par la législation ivoirienne et internationale relative à la propriété intellectuelle.

Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation écrite préalable de DYM Manufacture est interdite.

Les logos des partenaires et clients sont reproduits avec leur accord et restent la propriété de leurs détenteurs respectifs.

## Responsabilité

DYM Manufacture s’efforce de fournir des informations exactes et à jour, mais ne peut garantir l’absence d’erreur. Les photographies de réalisations sont présentées à titre d’illustration et ne constituent pas un engagement contractuel. Seuls les devis signés engagent DYM Manufacture.

## Données personnelles

Le traitement de vos données est décrit dans notre politique de confidentialité, accessible depuis le pied de page du site.

## Droit applicable

Le présent site et ses mentions légales sont soumis au droit ivoirien. Tout litige relève de la compétence des juridictions d’Abidjan.
TEXT],

            'politique-de-confidentialite' => ['Politique de confidentialité', <<<'TEXT'
DYM Manufacture attache une grande importance à la protection de vos données personnelles. Cette politique explique quelles données nous collectons, pourquoi, et quels sont vos droits, conformément à la loi n° 2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel.

## Responsable du traitement

DYM Manufacture — {{address}}
Contact : {{email}} — {{phone}}

## Données collectées

Nous collectons uniquement les données que vous nous transmettez volontairement :

- Candidatures (page Carrière) : nom, e-mail, téléphone, message et CV.
- Demandes de contact ou de devis par e-mail ou téléphone : coordonnées et contenu de votre demande.
- Comptes d’administration du site : nom, e-mail et mot de passe chiffré (personnel autorisé uniquement).

Le site n’utilise aucun outil de mesure d’audience ni de publicité, et ne revend aucune donnée.

## Finalités

- Étudier les candidatures et organiser le recrutement.
- Répondre à vos demandes et établir des devis.
- Assurer le fonctionnement et la sécurité du site.

## Base légale

Le traitement repose sur votre consentement (donné lors de l’envoi d’une candidature) et sur l’intérêt légitime de DYM Manufacture à répondre aux demandes qui lui sont adressées.

## Destinataires

Vos données sont accessibles uniquement aux personnes habilitées de DYM Manufacture (direction et responsables du recrutement) et à notre hébergeur, pour les seuls besoins techniques. Elles ne sont ni vendues ni cédées à des tiers.

Lors de votre visite, les services de polices de caractères Google Fonts et Bunny Fonts reçoivent techniquement votre adresse IP afin d’afficher le site.

## Durée de conservation

- Candidatures : 2 ans à compter du dernier contact, puis suppression.
- Demandes de contact : le temps nécessaire au traitement de la demande et à la relation commerciale.
- Comptes d’administration : jusqu’à leur suppression.

## Sécurité

Les CV sont stockés dans un espace privé, non accessible publiquement, et ne peuvent être consultés que par un administrateur authentifié. Les mots de passe sont chiffrés et les échanges avec le site sont sécurisés.

## Vos droits

Vous disposez d’un droit d’accès, de rectification, d’opposition et de suppression de vos données. Pour l’exercer, écrivez-nous à {{email}} en précisant votre demande. Nous vous répondrons dans les meilleurs délais.

Vous pouvez également saisir l’Autorité de Régulation des Télécommunications/TIC de Côte d’Ivoire (ARTCI), autorité de protection des données personnelles.

## Cookies

L’utilisation des cookies est détaillée dans notre politique de cookies.

## Modifications

Cette politique peut être mise à jour. La date de dernière mise à jour figure en haut de cette page.
TEXT],

            'cookies' => ['Politique de cookies', <<<'TEXT'
Un cookie est un petit fichier déposé sur votre appareil lors de la visite d’un site. Cette page indique les cookies utilisés par le site de DYM Manufacture.

## Notre engagement

Le site n’utilise que des cookies techniques, indispensables à son fonctionnement ou à la mémorisation de vos préférences d’affichage. Aucun cookie publicitaire, de mesure d’audience ou de réseau social n’est déposé. C’est pourquoi aucun bandeau de consentement ne vous est présenté.

## Cookies utilisés

- Cookie de session : maintient votre navigation (et votre connexion pour les administrateurs). Supprimé après 2 heures d’inactivité.
- XSRF-TOKEN : protège les formulaires (candidature, connexion) contre les envois frauduleux. Durée : celle de la session.
- appearance : mémorise le thème d’affichage (clair, sombre ou système). Durée : 1 an.
- sidebar_state : mémorise l’ouverture du menu de l’espace d’administration (administrateurs uniquement). Durée : 7 jours.

## Contenus tiers

Les polices de caractères sont chargées depuis Google Fonts et Bunny Fonts. Ces services ne déposent pas de cookie, mais reçoivent l’adresse IP de votre appareil pour pouvoir vous transmettre les fichiers. Les vidéos et images sont hébergées directement sur notre site.

## Gérer les cookies

Vous pouvez supprimer ou bloquer les cookies depuis les réglages de votre navigateur. Le blocage des cookies techniques peut toutefois empêcher l’envoi des formulaires ou la connexion à l’espace d’administration.

## Contact

Pour toute question : {{email}}.
TEXT],
        ];
    }
}
