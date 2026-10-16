<?php

use Database\Seeders\SiteContentSeeder;
use Illuminate\Database\Migrations\Migration;

// Le conteneur de prod lance les migrations mais pas les seeders : le contenu
// actuel du site est donc importé ici pour que la page d'accueil ne soit
// jamais vide après déploiement.
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        (new SiteContentSeeder)->run();
    }
};
