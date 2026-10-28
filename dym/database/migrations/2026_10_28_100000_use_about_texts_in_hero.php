<?php

use App\Models\SiteText;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Le bandeau principal reprend les textes de la section « À propos », retirée de
// l'accueil : surtitre, titre et paragraphe saisis dans /admin/texts, copiés tels
// quels. Sans texte saisi, le bandeau affiche ses nouveaux textes par défaut.
return new class extends Migration
{
    /**
     * Banner key => former « À propos » key.
     */
    private const KEYS = [
        'home.hero.eyebrow' => 'home.intro.eyebrow',
        'home.hero.title' => 'home.intro.title',
        'home.hero.intro' => 'home.intro.text',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $about = DB::table('site_texts')->whereIn('key', self::KEYS)->pluck('value', 'key');

        // Une valeur vide (ou égale au défaut) supprime la personnalisation du bandeau.
        SiteText::store(collect(self::KEYS)->map(fn (string $from) => $about[$from] ?? '')->all());
    }
};
