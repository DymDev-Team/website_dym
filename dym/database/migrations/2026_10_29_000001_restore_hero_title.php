<?php

use App\Models\SiteText;
use Illuminate\Database\Migrations\Migration;

// Le bandeau principal retrouve son titre « Des hommes et des machines. » : le
// titre « À propos » copié par la migration du 28/10 est effacé, le défaut
// s'applique de nouveau. Surtitre et paragraphe restent ceux d'« À propos ».
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        SiteText::store(['home.hero.title' => '']);
    }
};
