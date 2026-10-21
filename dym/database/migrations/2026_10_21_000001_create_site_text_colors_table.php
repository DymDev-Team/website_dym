<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Couleur choisie dans /admin/texts pour un texte du site ; sans ligne,
        // le texte garde la couleur prévue par le design.
        Schema::create('site_text_colors', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('color', 7);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_text_colors');
    }
};
