<?php

use App\Models\Setting;
use App\Models\SiteText;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

// Le 2ᵉ bandeau devient la section « À propos » (home.intro) : elle reprend le
// surtitre et le paragraphe affichés dans le bandeau principal depuis le 28/10,
// ainsi que la photo et la couleur de fond du 2ᵉ bandeau. Le bandeau principal
// retrouve ses textes par défaut.
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $texts = DB::table('site_texts')->pluck('value', 'key');

        // Une valeur vide (ou égale au défaut) supprime la personnalisation.
        SiteText::store([
            'home.intro.eyebrow' => $texts['home.hero.eyebrow'] ?? '',
            'home.intro.text' => $texts['home.hero.intro'] ?? '',
            'home.hero.eyebrow' => '',
            'home.hero.intro' => '',
        ]);

        SiteText::storeImage('home.intro.image', $texts['home.equipment_2.image'] ?? null);
        DB::table('site_texts')->where('key', 'home.equipment_2.image')->delete();

        $color = DB::table('settings')->where('key', 'section_color_equipment_2')->value('value');
        DB::table('settings')->whereIn('key', ['section_color_intro', 'section_color_equipment_2'])->delete();

        if ($color !== null) {
            Setting::query()->create(['key' => 'section_color_intro', 'value' => $color]);
        }

        Cache::forget(Setting::CACHE_KEY);
    }
};
