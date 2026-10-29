<?php

use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

// La section « À propos » passe sur fond gris clair. Le formulaire des réglages
// enregistre toutes les couleurs : un blanc stocké est l'ancien défaut du
// 2ᵉ bandeau, pas un choix ; une autre couleur saisie dans le panel est gardée.
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('settings')->where('key', 'section_color_intro')->whereIn('value', ['#ffffff', '#FFFFFF'])->delete();

        Cache::forget(Setting::CACHE_KEY);
    }
};
