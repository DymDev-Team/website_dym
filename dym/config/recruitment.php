<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Modèles Claude proposés dans l'admin
    |--------------------------------------------------------------------------
    |
    | Tarifs en dollars par million de tokens. Ils servent à calculer le coût
    | de chaque analyse et à faire respecter le plafond mensuel.
    |
    */

    'models' => [
        'claude-opus-5-5' => [
            'label' => 'Claude Opus 5.5 (recommandé)',
            'input' => 4.00,
            'output' => 20.00,
            'cache_read' => 0.20,
            'cache_write' => 5.00,
        ],
        'claude-sonnet-5-5' => [
            'label' => 'Claude Sonnet 5.5',
            'input' => 2.00,
            'output' => 10.00,
            'cache_read' => 0.20,
            'cache_write' => 2.50,
        ],
        'claude-haiku-5-5' => [
            'label' => 'Claude Haiku 5.5',
            'input' => 0.10,
            'output' => 0.50,
            'cache_read' => 0.01,
            'cache_write' => 0.125,
        ],
    ],

    'efforts' => ['low', 'medium', 'high'],

    // Prix d'une recherche web lancée par le modèle (10 $ les 1 000).
    'web_search_price' => 0.01,

    // Recherches web au plus par CV (écoles et entreprises citées).
    'web_searches_per_cv' => 5,

    /*
    |--------------------------------------------------------------------------
    | Analyse des CV
    |--------------------------------------------------------------------------
    */

    // À incrémenter à chaque changement des consignes : chaque analyse garde
    // la version qui l'a produite.
    'prompt_version' => '2026-10-28.3',

    // Où tournent les analyses, sans cron ni worker :
    // - « auto » : après l'envoi de la réponse HTTP si PHP tourne sous FPM ou
    //   LiteSpeed, sinon pilotées par les pages de l'admin ouvertes ;
    // - « after_response » : toujours après la réponse (defer) ;
    // - « browser » : uniquement pilotées par les pages de l'admin.
    'background' => env('RECRUITMENT_BACKGROUND', 'auto'),

    'max_attempts' => 3,

    // Une analyse « en cours » depuis plus longtemps est considérée comme
    // interrompue (processus PHP coupé) et peut être relancée.
    'stale_after_minutes' => 10,

    // Délai d'attente d'un appel à Claude, en secondes.
    'timeout' => 240,

    'max_output_tokens' => 16000,

    // Analyses relancées en arrière-plan à chaque ouverture de l'admin.
    'resume_per_request' => 2,

    // Nombre maximal d'offres ouvertes comparées à un CV.
    'max_offers_compared' => 30,

    'cv_disk' => 'local',

    'cv_mimes' => ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp'],

];
