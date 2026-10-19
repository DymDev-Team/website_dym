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
        // Preuve des choix de cookies : un identifiant aléatoire par navigateur,
        // sans adresse IP ni donnée personnelle.
        Schema::create('cookie_consents', function (Blueprint $table) {
            $table->id();
            $table->uuid('consent_id')->index();
            $table->boolean('analytics')->default(false);
            $table->boolean('marketing')->default(false);
            $table->string('policy_version', 20);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cookie_consents');
    }
};
