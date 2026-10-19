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
        // Textes du site modifiés depuis l'administration. Seules les valeurs
        // personnalisées sont stockées ; les autres viennent de config/site-texts.php.
        Schema::create('site_texts', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->text('value');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_texts');
    }
};
