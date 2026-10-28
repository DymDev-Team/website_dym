<?php

/*
|--------------------------------------------------------------------------
| Textes du site public
|--------------------------------------------------------------------------
|
| Chaque texte affiché sur le site public, modifiable dans /admin/texts.
| Clé complète : « page.section.champ » (ex. home.hero.title), lue côté React
| avec t('home.hero.title'). « default » est le texte affiché tant que
| l'administrateur ne l'a pas modifié ; « multiline » affiche une zone de
| texte (pour les titres, chaque ligne s'affiche sur une nouvelle ligne).
| « type » => 'image' : photo remplaçable par un envoi de fichier ; la valeur
| par défaut est un chemin dans public/, lue côté React comme une URL.
|
*/

$title = 'Une ligne par ligne affichée ; un point final s’affiche dans la couleur DYM.';

return [

    'home' => [
        'label' => 'Accueil',
        'sections' => [

            'meta' => [
                'label' => 'Référencement (onglet du navigateur, Google)',
                'fields' => [
                    'title' => ['label' => 'Titre de la page', 'default' => 'DYM Manufacture — Le métal, de l’idée à la matière'],
                    'description' => ['label' => 'Description', 'default' => 'DYM Manufacture, à Abidjan : conception, usinage et fabrication métallique sur mesure pour les entreprises et les particuliers.', 'multiline' => true],
                ],
            ],

            'hero' => [
                'label' => 'Bandeau principal',
                'fields' => [
                    'eyebrow' => ['label' => 'Surtitre', 'default' => 'FABRICATION MÉTALLIQUE & INDUSTRIELLE'],
                    'title' => ['label' => 'Titre', 'default' => "Des hommes\net des machines.", 'multiline' => true, 'help' => $title],
                    'intro' => ['label' => 'Paragraphe', 'default' => 'DYM Manufacture accompagne les entreprises et les particuliers dans la réalisation d’ouvrages métalliques robustes, esthétiques et de haute qualité — de l’étude à la pose.', 'multiline' => true],
                    'cta' => ['label' => 'Bouton', 'default' => 'Demander un devis par WhatsApp'],
                    'benefit_1' => ['label' => 'Engagement 1', 'default' => "Bureau d’études\n& plans", 'multiline' => true],
                    'benefit_2' => ['label' => 'Engagement 2', 'default' => "Devis & suivi\ntransparents", 'multiline' => true],
                    'benefit_3' => ['label' => 'Engagement 3', 'default' => "Fabrication\nsur mesure", 'multiline' => true],
                    'caption' => ['label' => 'Légende de la vidéo', 'default' => 'ATELIER DYM — ABIDJAN'],
                    'video_alt' => ['label' => 'Description de la vidéo (accessibilité)', 'default' => 'Équipes DYM au travail dans l’atelier : découpe laser, usinage, assemblage et ouvrages posés'],
                    'top_left' => ['label' => 'Mention en haut à gauche', 'default' => 'DYM / FABRICATION MÉTALLIQUE'],
                    'top_right' => ['label' => 'Mention en haut à droite', 'default' => 'ÉTUDE TECHNIQUE — 001'],
                    'step' => ['label' => 'Repère de section', 'default' => 'ACCUEIL'],
                    'mobile_tagline' => ['label' => 'Slogan (mobile)', 'default' => 'CONCEPTION • USINAGE • FABRICATION'],
                    'bottom_left' => ['label' => 'Mention en bas à gauche', 'default' => 'DYM MANUFACTURE — ABIDJAN'],
                    'scroll' => ['label' => 'Invitation à défiler', 'default' => 'FAIRE DÉFILER'],
                    'bottom_right' => ['label' => 'Mention en bas à droite', 'default' => '© DYM MANUFACTURE'],
                ],
            ],

            'intro' => [
                'label' => 'À propos (présentation)',
                'fields' => [
                    'eyebrow' => ['label' => 'Surtitre', 'default' => 'DYM MANUFACTURE'],
                    'title' => ['label' => 'Titre', 'default' => "Nous donnons\nforme à vos idées.", 'multiline' => true, 'help' => $title],
                    'text' => ['label' => 'Paragraphe', 'default' => 'Depuis 2016, DYM Manufacture, basée à Abidjan, met son expertise au service de vos projets métalliques avec rigueur, précision et passion.', 'multiline' => true],
                    'values' => ['label' => 'Valeurs (une par ligne)', 'default' => "Précision\nQualité\nInnovation\nAccompagnement", 'multiline' => true],
                    'image' => ['label' => 'Photo de fond', 'type' => 'image', 'default' => '/images/images/16.jpg'],
                ],
            ],

            'activities' => [
                'label' => 'Nos activités',
                'fields' => [
                    'eyebrow' => ['label' => 'Surtitre', 'default' => 'NOS ACTIVITÉS'],
                    'title' => ['label' => 'Titre', 'default' => "Quatre métiers,\nune même exigence.", 'multiline' => true, 'help' => $title],
                    'text' => ['label' => 'Paragraphe', 'default' => 'De la chaudronnerie industrielle aux ouvrages décoratifs, DYM Manufacture maîtrise l’ensemble de la chaîne de valeur métallique pour répondre à tous vos besoins.', 'multiline' => true],
                    'link' => ['label' => 'Lien des cartes', 'default' => 'En savoir plus'],
                ],
            ],

            'process' => [
                'label' => 'Notre approche',
                'fields' => [
                    'eyebrow' => ['label' => 'Surtitre', 'default' => 'NOTRE APPROCHE'],
                    'title' => ['label' => 'Titre', 'default' => "Du plan\nà la réalité.", 'multiline' => true, 'help' => $title],
                    'text' => ['label' => 'Paragraphe', 'default' => 'Nous vous accompagnons à chaque étape, de l’étude technique à la fabrication, jusqu’à l’installation finale, avec un suivi rigoureux et une qualité constante.', 'multiline' => true],
                    'step_label' => ['label' => 'Mot « étape »', 'default' => 'ÉTAPE'],
                    'step_1_title' => ['label' => 'Étape 1 — titre', 'default' => "Étudier\net concevoir", 'multiline' => true],
                    'step_1_text' => ['label' => 'Étape 1 — texte', 'default' => 'Relevés, plans 2D/3D et chiffrage par notre bureau d’études.', 'multiline' => true],
                    'step_1_alt' => ['label' => 'Étape 1 — description de la photo', 'default' => 'Ingénieurs du bureau d’études DYM travaillant sur leurs plans'],
                    'step_1_image' => ['label' => 'Étape 1 — photo', 'type' => 'image', 'default' => '/images/process/01-bureau-etudes.jpg'],
                    'step_2_title' => ['label' => 'Étape 2 — titre', 'default' => "Fabriquer dans\nnos ateliers", 'multiline' => true],
                    'step_2_text' => ['label' => 'Étape 2 — texte', 'default' => 'Découpe laser, pliage, usinage, soudure et contrôle qualité.', 'multiline' => true],
                    'step_2_alt' => ['label' => 'Étape 2 — description de la photo', 'default' => 'Opérateur DYM sur une plieuse dans l’atelier'],
                    'step_2_image' => ['label' => 'Étape 2 — photo', 'type' => 'image', 'default' => '/images/process/02-atelier.jpg'],
                    'step_3_title' => ['label' => 'Étape 3 — titre', 'default' => "Réaliser\nsur site", 'multiline' => true],
                    'step_3_text' => ['label' => 'Étape 3 — texte', 'default' => 'Livraison, pose et mise en service par nos équipes.', 'multiline' => true],
                    'step_3_alt' => ['label' => 'Étape 3 — description de la photo', 'default' => 'Pergola en métal découpé au laser posée sur une maison'],
                    'step_3_image' => ['label' => 'Étape 3 — photo', 'type' => 'image', 'default' => '/images/process/03-realisation.jpg'],
                ],
            ],

            'projects' => [
                'label' => 'Nos réalisations',
                'fields' => [
                    'eyebrow' => ['label' => 'Surtitre', 'default' => 'NOS RÉALISATIONS'],
                    'title' => ['label' => 'Titre', 'default' => "Des projets concrets,\ndes clients satisfaits.", 'multiline' => true, 'help' => $title],
                    'link' => ['label' => 'Lien', 'default' => 'Voir toutes les réalisations'],
                ],
            ],

            'equipment' => [
                'label' => 'Nos équipements',
                'fields' => [
                    'eyebrow' => ['label' => 'Surtitre', 'default' => 'NOS ÉQUIPEMENTS'],
                    'title' => ['label' => 'Titre', 'default' => "Une technologie\nau service de la qualité.", 'multiline' => true, 'help' => $title],
                    'text' => ['label' => 'Paragraphe', 'default' => 'Des machines performantes et des équipes qualifiées pour garantir précision, productivité et fiabilité.', 'multiline' => true],
                    'cta' => ['label' => 'Bouton', 'default' => 'Découvrir nos équipements'],
                ],
            ],

            'partners' => [
                'label' => 'Nos partenaires',
                'fields' => [
                    'title' => ['label' => 'Titre', 'default' => 'Nos partenaires'],
                ],
            ],

            'testimonials' => [
                'label' => 'Témoignages',
                'fields' => [
                    'eyebrow' => ['label' => 'Surtitre', 'default' => 'TÉMOIGNAGES'],
                    'title' => ['label' => 'Titre', 'default' => 'Ils parlent de nous.', 'help' => 'Un point final s’affiche dans la couleur DYM.'],
                ],
            ],

            'news' => [
                'label' => 'Actualités',
                'fields' => [
                    'eyebrow' => ['label' => 'Surtitre', 'default' => 'NOS ACTUALITÉS'],
                    'title' => ['label' => 'Titre', 'default' => 'Le métal en mouvement.', 'help' => 'Un point final s’affiche dans la couleur DYM.'],
                    'link' => ['label' => 'Lien', 'default' => 'Voir toutes les actualités'],
                    'read_more' => ['label' => 'Lien des articles', 'default' => 'Lire la suite'],
                ],
            ],

            'loader' => [
                'label' => 'Écran de chargement',
                'fields' => [
                    'signature' => ['label' => 'Signature', 'default' => 'DES HOMMES ET DES MACHINES'],
                    'loading' => ['label' => 'Mot « chargement »', 'default' => 'CHARGEMENT'],
                    'label' => ['label' => 'Annonce (accessibilité)', 'default' => 'Chargement du site DYM Manufacture'],
                ],
            ],
        ],
    ],

    'layout' => [
        'label' => 'En-tête et pied de page',
        'sections' => [

            'header' => [
                'label' => 'Menu (en-tête)',
                'fields' => [
                    'nav_home' => ['label' => 'Menu — Accueil', 'default' => 'Accueil'],
                    'nav_activities' => ['label' => 'Menu — Activités', 'default' => 'Nos activités'],
                    'nav_projects' => ['label' => 'Menu — Réalisations', 'default' => 'Nos réalisations'],
                    'nav_brands' => ['label' => 'Menu — Marques', 'default' => 'Nos marques'],
                    'nav_news' => ['label' => 'Menu — Actualités', 'default' => 'Actualités'],
                    'nav_careers' => ['label' => 'Menu — Carrière', 'default' => 'Carrière'],
                    'cta' => ['label' => 'Bouton', 'default' => 'Demander un devis'],
                ],
            ],

            'footer' => [
                'label' => 'Pied de page',
                'fields' => [
                    'nav_title' => ['label' => 'Titre de colonne — navigation', 'default' => 'Navigation'],
                    'activities_title' => ['label' => 'Titre de colonne — activités', 'default' => 'Nos activités'],
                    'contact_title' => ['label' => 'Titre de colonne — contact', 'default' => 'Contact'],
                    'copyright' => ['label' => 'Copyright', 'default' => '© {année} DYM Manufacture. Tous droits réservés.', 'help' => '{année} est remplacé par l’année en cours.'],
                    'credit' => ['label' => 'Crédit', 'default' => 'Fait par'],
                    'legal_notice' => ['label' => 'Lien — mentions légales', 'default' => 'Mentions légales'],
                    'privacy' => ['label' => 'Lien — confidentialité', 'default' => 'Confidentialité'],
                    'cookies' => ['label' => 'Lien — cookies', 'default' => 'Cookies'],
                    'cookie_settings' => ['label' => 'Lien — gérer les cookies', 'default' => 'Gérer les cookies'],
                ],
            ],

            'cookies' => [
                'label' => 'Fenêtre de consentement aux cookies',
                'fields' => [
                    'title' => ['label' => 'Titre', 'default' => 'Vos choix en matière de cookies'],
                    'text' => ['label' => 'Texte', 'default' => 'Nous utilisons des cookies nécessaires au fonctionnement du site et, avec votre accord, des cookies de mesure d’audience et de marketing. Vous pouvez modifier vos choix à tout moment.', 'multiline' => true],
                    'policy_link' => ['label' => 'Lien vers la politique', 'default' => 'En savoir plus'],
                    'accept' => ['label' => 'Bouton — tout accepter', 'default' => 'Tout accepter'],
                    'reject' => ['label' => 'Bouton — tout refuser', 'default' => 'Tout refuser'],
                    'customize' => ['label' => 'Bouton — personnaliser', 'default' => 'Personnaliser'],
                    'save' => ['label' => 'Bouton — enregistrer', 'default' => 'Enregistrer mes choix'],
                    'necessary_title' => ['label' => 'Catégorie — nécessaires', 'default' => 'Nécessaires'],
                    'necessary_text' => ['label' => 'Description — nécessaires', 'default' => 'Session, sécurité des formulaires et mémorisation de vos choix. Toujours actifs.', 'multiline' => true],
                    'analytics_title' => ['label' => 'Catégorie — mesure d’audience', 'default' => 'Mesure d’audience'],
                    'analytics_text' => ['label' => 'Description — mesure d’audience', 'default' => 'Statistiques de fréquentation anonymes pour améliorer le site.', 'multiline' => true],
                    'marketing_title' => ['label' => 'Catégorie — marketing', 'default' => 'Marketing'],
                    'marketing_text' => ['label' => 'Description — marketing', 'default' => 'Contenus des réseaux sociaux et mesure de nos campagnes.', 'multiline' => true],
                ],
            ],
        ],
    ],

    'activities' => [
        'label' => 'Page Activités',
        'sections' => [

            'meta' => [
                'label' => 'Référencement (onglet du navigateur, Google)',
                'fields' => [
                    'title' => ['label' => 'Titre de la page', 'default' => 'Activités — DYM Manufacture'],
                    'description' => ['label' => 'Description', 'default' => 'Pergolas, marquises, portails, garde-corps, grilles et charpentes métalliques fabriqués sur mesure par DYM Manufacture.', 'multiline' => true],
                ],
            ],

            'products' => [
                'label' => 'Nos ouvrages',
                'fields' => [
                    'eyebrow' => ['label' => 'Surtitre', 'default' => 'NOS OUVRAGES'],
                    'title' => ['label' => 'Titre', 'default' => 'Fabriqués dans nos ateliers.', 'help' => 'Un point final s’affiche dans la couleur DYM.'],
                    'text' => ['label' => 'Paragraphe', 'default' => 'Pergolas, portails, garde-corps, grilles… Chaque ouvrage est dessiné, découpé et assemblé sur mesure, avec des motifs personnalisables.', 'multiline' => true],
                    'product_1' => ['label' => 'Ouvrage 1', 'default' => 'Pergola'],
                    'product_2' => ['label' => 'Ouvrage 2', 'default' => 'Marquise'],
                    'product_3' => ['label' => 'Ouvrage 3', 'default' => 'Portail'],
                    'product_4' => ['label' => 'Ouvrage 4', 'default' => 'Garde-corps'],
                    'product_5' => ['label' => 'Ouvrage 5', 'default' => 'Grille de défense'],
                    'product_6' => ['label' => 'Ouvrage 6', 'default' => 'Charpente métallique'],
                    'product_7' => ['label' => 'Ouvrage 7', 'default' => 'Rampe d’escalier'],
                    'signature' => ['label' => 'Signature sous les ouvrages', 'default' => 'DYM'],
                ],
            ],

            'cta' => [
                'label' => 'Bandeau devis',
                'fields' => [
                    'title' => ['label' => 'Titre', 'default' => 'Un projet sur mesure ?', 'help' => 'Un « ? » ou un point final s’affiche dans la couleur DYM.'],
                    'button' => ['label' => 'Bouton', 'default' => 'Demander un devis'],
                ],
            ],
        ],
    ],

    'brands' => [
        'label' => 'Page Nos marques',
        'sections' => [

            'meta' => [
                'label' => 'Référencement (onglet du navigateur, Google)',
                'fields' => [
                    'title' => ['label' => 'Titre de la page', 'default' => 'Nos marques — DYM Manufacture'],
                    'description' => ['label' => 'Description', 'default' => 'Les marques de DYM Manufacture.', 'multiline' => true],
                ],
            ],

            'header' => [
                'label' => 'En-tête',
                'fields' => [
                    'eyebrow' => ['label' => 'Surtitre', 'default' => 'NOS MARQUES'],
                    'title' => ['label' => 'Titre', 'default' => 'Nos marques.', 'help' => 'Un point final s’affiche dans la couleur DYM.'],
                    'text' => ['label' => 'Paragraphe', 'default' => 'Découvrez les marques portées par DYM Manufacture.', 'multiline' => true],
                    'empty' => ['label' => 'Message si aucune marque', 'default' => 'Aucune marque à afficher pour le moment.'],
                    'link' => ['label' => 'Lien vers le site d’une marque', 'default' => 'Visiter le site'],
                ],
            ],
        ],
    ],

    'news' => [
        'label' => 'Page Actualités',
        'sections' => [

            'meta' => [
                'label' => 'Référencement (onglet du navigateur, Google)',
                'fields' => [
                    'title' => ['label' => 'Titre de la page', 'default' => 'Actualités — DYM Manufacture'],
                    'description' => ['label' => 'Description', 'default' => 'Projets livrés, nouveaux équipements et vie de l’atelier : toutes les actualités de DYM Manufacture.', 'multiline' => true],
                ],
            ],

            'header' => [
                'label' => 'En-tête',
                'fields' => [
                    'eyebrow' => ['label' => 'Surtitre', 'default' => 'NOS ACTUALITÉS'],
                    'title' => ['label' => 'Titre', 'default' => 'Le métal en mouvement.', 'help' => 'Un point final s’affiche dans la couleur DYM.'],
                    'text' => ['label' => 'Paragraphe', 'default' => 'Projets livrés, nouveaux équipements, vie de l’atelier : suivez ce qui se fabrique chez DYM Manufacture.', 'multiline' => true],
                ],
            ],

            'list' => [
                'label' => 'Liste des articles',
                'fields' => [
                    'all' => ['label' => 'Filtre « toutes »', 'default' => 'Toutes'],
                    'featured' => ['label' => 'Étiquette de l’article à la une', 'default' => '[ À LA UNE ]'],
                    'read_article' => ['label' => 'Lien de l’article à la une', 'default' => 'Lire l’article'],
                    'read_more' => ['label' => 'Lien des autres articles', 'default' => 'Lire la suite'],
                    'empty' => ['label' => 'Message si aucun article', 'default' => 'Aucune actualité pour le moment.'],
                    'previous' => ['label' => 'Pagination — précédent', 'default' => 'Précédent'],
                    'next' => ['label' => 'Pagination — suivant', 'default' => 'Suivant'],
                    'page' => ['label' => 'Pagination — mot « page »', 'default' => 'Page'],
                ],
            ],

            'post' => [
                'label' => 'Page d’un article',
                'fields' => [
                    'meta_title' => ['label' => 'Titre de la page', 'default' => '{titre} — DYM Manufacture', 'help' => '{titre} est remplacé par le titre de l’article.'],
                    'back' => ['label' => 'Lien de retour', 'default' => 'Toutes les actualités'],
                    'related' => ['label' => 'Titre « à lire aussi »', 'default' => 'À lire aussi.', 'help' => 'Un point final s’affiche dans la couleur DYM.'],
                    'read_more' => ['label' => 'Lien des articles liés', 'default' => 'Lire la suite'],
                ],
            ],
        ],
    ],

    'careers' => [
        'label' => 'Page Carrière',
        'sections' => [

            'meta' => [
                'label' => 'Référencement (onglet du navigateur, Google)',
                'fields' => [
                    'title' => ['label' => 'Titre de la page', 'default' => 'Carrière — DYM Manufacture'],
                    'description' => ['label' => 'Description', 'default' => 'Rejoignez DYM Manufacture à Abidjan : offres d’emploi en chaudronnerie, usinage, menuiserie métallique et candidatures spontanées.', 'multiline' => true],
                ],
            ],

            'header' => [
                'label' => 'En-tête',
                'fields' => [
                    'eyebrow' => ['label' => 'Surtitre', 'default' => 'CARRIÈRE'],
                    'title' => ['label' => 'Titre', 'default' => "Façonnons le métal\nensemble.", 'multiline' => true, 'help' => $title],
                    'text' => ['label' => 'Paragraphe', 'default' => 'Soudeurs, chaudronniers, usineurs, dessinateurs… DYM Manufacture recrute des talents passionnés par le travail bien fait. Consultez nos offres ou envoyez-nous une candidature spontanée.', 'multiline' => true],
                    'offers_button' => ['label' => 'Bouton — offres', 'default' => 'Voir les offres'],
                    'application_button' => ['label' => 'Bouton — candidature', 'default' => 'Candidature spontanée'],
                ],
            ],

            'reasons' => [
                'label' => 'Pourquoi nous rejoindre (bandeau noir)',
                'fields' => [
                    'reason_1_title' => ['label' => 'Argument 1 — titre', 'default' => 'Une équipe soudée'],
                    'reason_1_text' => ['label' => 'Argument 1 — texte', 'default' => 'Bureau d’études, atelier et chantier travaillent main dans la main, du plan à la pose.', 'multiline' => true],
                    'reason_2_title' => ['label' => 'Argument 2 — titre', 'default' => 'Apprendre et progresser'],
                    'reason_2_text' => ['label' => 'Argument 2 — texte', 'default' => 'Découpe laser, pliage CNC, usinage : nos équipes se forment sur des machines modernes.', 'multiline' => true],
                    'reason_3_title' => ['label' => 'Argument 3 — titre', 'default' => 'Sécurité et exigence'],
                    'reason_3_text' => ['label' => 'Argument 3 — texte', 'default' => 'Des procédures claires et un contrôle qualité à chaque étape de la fabrication.', 'multiline' => true],
                ],
            ],

            'offers' => [
                'label' => 'Offres d’emploi',
                'fields' => [
                    'eyebrow' => ['label' => 'Surtitre', 'default' => 'OFFRES OUVERTES', 'help' => 'Suivi automatiquement du nombre d’offres.'],
                    'title' => ['label' => 'Titre', 'default' => 'Nos postes à pourvoir.', 'multiline' => true, 'help' => $title],
                    'until' => ['label' => 'Date limite (« jusqu’au »)', 'default' => 'Jusqu’au'],
                    'view' => ['label' => 'Lien des offres', 'default' => 'Voir l’offre'],
                    'empty' => ['label' => 'Message si aucune offre', 'default' => 'Aucune offre n’est ouverte pour le moment. Vous pouvez néanmoins nous adresser une', 'multiline' => true],
                    'empty_link' => ['label' => 'Lien du message si aucune offre', 'default' => 'candidature spontanée'],
                ],
            ],

            'application' => [
                'label' => 'Candidature spontanée',
                'fields' => [
                    'eyebrow' => ['label' => 'Surtitre', 'default' => 'CANDIDATURE SPONTANÉE'],
                    'title' => ['label' => 'Titre', 'default' => "Votre profil\nnous intéresse.", 'multiline' => true, 'help' => $title],
                    'text' => ['label' => 'Paragraphe', 'default' => 'Vous ne trouvez pas le poste qui vous correspond ? Envoyez-nous votre CV : nous le conservons et vous contactons dès qu’une opportunité se présente.', 'multiline' => true],
                ],
            ],

            'offer' => [
                'label' => 'Page d’une offre',
                'fields' => [
                    'meta_title' => ['label' => 'Titre de la page', 'default' => '{titre} — Carrière DYM Manufacture', 'help' => '{titre} est remplacé par l’intitulé du poste.'],
                    'back' => ['label' => 'Lien de retour', 'default' => 'Toutes les offres'],
                    'closes' => ['label' => 'Date limite', 'default' => 'Candidatures ouvertes jusqu’au {date}.', 'help' => '{date} est remplacé par la date limite.'],
                    'missions' => ['label' => 'Titre — missions', 'default' => 'Missions'],
                    'requirements' => ['label' => 'Titre — profil', 'default' => 'Profil recherché'],
                    'apply' => ['label' => 'Titre du formulaire', 'default' => 'Postuler.', 'help' => 'Un point final s’affiche dans la couleur DYM.'],
                ],
            ],

            'form' => [
                'label' => 'Formulaire de candidature',
                'fields' => [
                    'name' => ['label' => 'Champ — nom', 'default' => 'Nom et prénom *'],
                    'email' => ['label' => 'Champ — e-mail', 'default' => 'E-mail *'],
                    'phone' => ['label' => 'Champ — téléphone', 'default' => 'Téléphone'],
                    'message' => ['label' => 'Champ — message', 'default' => 'Message'],
                    'message_placeholder' => ['label' => 'Exemple dans le message', 'default' => 'Parlez-nous de votre parcours et de ce qui vous motive.'],
                    'cv' => ['label' => 'Champ — CV', 'default' => 'CV (PDF ou Word, 5 Mo max) *'],
                    'cv_placeholder' => ['label' => 'Texte du sélecteur de fichier', 'default' => 'Choisir un fichier…'],
                    'yes' => ['label' => 'Questions de l’offre — réponse « oui »', 'default' => 'Oui'],
                    'no' => ['label' => 'Questions de l’offre — réponse « non »', 'default' => 'Non'],
                    'choose' => ['label' => 'Questions de l’offre — liste non choisie', 'default' => 'Choisir…'],
                    'consent' => ['label' => 'Consentement', 'default' => 'J’accepte que DYM Manufacture conserve mes données pour traiter ma candidature, y compris une première lecture de mon CV par un outil d’intelligence artificielle, la décision restant humaine', 'multiline' => true],
                    'consent_link' => ['label' => 'Lien du consentement', 'default' => 'voir la politique de confidentialité'],
                    'submit' => ['label' => 'Bouton d’envoi', 'default' => 'Envoyer ma candidature'],
                    'sending' => ['label' => 'Bouton pendant l’envoi', 'default' => 'Envoi en cours…'],
                    'success_title' => ['label' => 'Confirmation — titre', 'default' => 'Merci, votre candidature est bien arrivée.'],
                    'success_text' => ['label' => 'Confirmation — texte', 'default' => 'Notre équipe l’étudie et revient vers vous si votre profil correspond à nos besoins.', 'multiline' => true],
                    'success_again' => ['label' => 'Confirmation — lien', 'default' => 'Envoyer une autre candidature'],
                ],
            ],
        ],
    ],

    'quote' => [
        'label' => 'Page Devis',
        'sections' => [

            'meta' => [
                'label' => 'Référencement (onglet du navigateur, Google)',
                'fields' => [
                    'title' => ['label' => 'Titre de la page', 'default' => 'Demander un devis — DYM Manufacture'],
                    'description' => ['label' => 'Description', 'default' => 'Demandez un devis gratuit à DYM Manufacture : chaudronnerie, usinage, menuiserie métallique et décoration métallique sur mesure à Abidjan.', 'multiline' => true],
                ],
            ],

            'header' => [
                'label' => 'Introduction',
                'fields' => [
                    'eyebrow' => ['label' => 'Surtitre', 'default' => 'DEMANDE DE DEVIS'],
                    'title' => ['label' => 'Titre', 'default' => "Parlons de\nvotre projet.", 'multiline' => true, 'help' => $title],
                    'text' => ['label' => 'Paragraphe', 'default' => 'Décrivez-nous votre besoin : notre bureau d’études vous répond avec une proposition adaptée, de la conception à la pose.', 'multiline' => true],
                    'call' => ['label' => 'Titre des coordonnées', 'default' => 'Vous préférez nous appeler ?'],
                ],
            ],

            'steps' => [
                'label' => 'Étapes',
                'fields' => [
                    'step_1_title' => ['label' => 'Étape 1 — titre', 'default' => 'Votre demande'],
                    'step_1_text' => ['label' => 'Étape 1 — texte', 'default' => 'Décrivez votre projet et joignez vos plans ou photos.', 'multiline' => true],
                    'step_2_title' => ['label' => 'Étape 2 — titre', 'default' => 'Étude technique'],
                    'step_2_text' => ['label' => 'Étape 2 — texte', 'default' => 'Notre bureau d’études analyse le besoin et vous rappelle si nécessaire.', 'multiline' => true],
                    'step_3_title' => ['label' => 'Étape 3 — titre', 'default' => 'Votre devis'],
                    'step_3_text' => ['label' => 'Étape 3 — texte', 'default' => 'Vous recevez une proposition chiffrée et détaillée.', 'multiline' => true],
                ],
            ],

            'form' => [
                'label' => 'Formulaire de devis',
                'fields' => [
                    'name' => ['label' => 'Champ — nom', 'default' => 'Nom et prénom *'],
                    'company' => ['label' => 'Champ — entreprise', 'default' => 'Entreprise'],
                    'email' => ['label' => 'Champ — e-mail', 'default' => 'E-mail *'],
                    'phone' => ['label' => 'Champ — téléphone', 'default' => 'Téléphone *'],
                    'phone_placeholder' => ['label' => 'Exemple de téléphone', 'default' => '+225 …'],
                    'activity' => ['label' => 'Champ — activité', 'default' => 'Activité concernée'],
                    'other' => ['label' => 'Choix « autre » des activités', 'default' => 'Autre'],
                    'deadline' => ['label' => 'Champ — délai', 'default' => 'Délai souhaité'],
                    'deadlines' => ['label' => 'Délais proposés (un par ligne)', 'default' => "Dès que possible\nSous 1 mois\nSous 3 mois\nPlus de 3 mois\nPas encore défini", 'multiline' => true],
                    'choose' => ['label' => 'Choix vide des listes', 'default' => 'Choisir…'],
                    'message' => ['label' => 'Champ — projet', 'default' => 'Votre projet *'],
                    'message_placeholder' => ['label' => 'Exemple dans le projet', 'default' => 'Type d’ouvrage, dimensions, matériaux, quantités, lieu de pose…'],
                    'attachment' => ['label' => 'Champ — fichier', 'default' => 'Plans ou photos (PDF, image, DWG/DXF — 10 Mo max)'],
                    'attachment_placeholder' => ['label' => 'Texte du sélecteur de fichier', 'default' => 'Joindre un fichier (facultatif)…'],
                    'consent' => ['label' => 'Consentement', 'default' => 'J’accepte que DYM Manufacture utilise ces informations pour établir mon devis', 'multiline' => true],
                    'consent_link' => ['label' => 'Lien du consentement', 'default' => 'voir la politique de confidentialité'],
                    'submit' => ['label' => 'Bouton d’envoi', 'default' => 'Envoyer ma demande'],
                    'sending' => ['label' => 'Bouton pendant l’envoi', 'default' => 'Envoi en cours…'],
                    'success_title' => ['label' => 'Confirmation — titre', 'default' => 'Merci, votre demande de devis est bien arrivée.'],
                    'success_text' => ['label' => 'Confirmation — texte', 'default' => 'Notre bureau d’études l’examine et vous recontacte rapidement pour préciser votre projet.', 'multiline' => true],
                    'success_again' => ['label' => 'Confirmation — lien', 'default' => 'Envoyer une autre demande'],
                ],
            ],
        ],
    ],

    'legal' => [
        'label' => 'Pages légales',
        'sections' => [
            'page' => [
                'label' => 'Mise en page',
                'fields' => [
                    'meta_title' => ['label' => 'Titre de la page', 'default' => '{titre} — DYM Manufacture', 'help' => '{titre} est remplacé par le titre de la page légale. Le contenu se modifie dans Configuration › Pages légales.'],
                    'eyebrow' => ['label' => 'Surtitre', 'default' => 'INFORMATIONS LÉGALES'],
                    'updated' => ['label' => 'Date de mise à jour', 'default' => 'Dernière mise à jour : {date}', 'help' => '{date} est remplacé par la date.'],
                ],
            ],
        ],
    ],
];
