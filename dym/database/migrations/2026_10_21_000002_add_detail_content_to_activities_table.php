<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->longText('detail_content')->nullable();
            $table->string('detail_image')->nullable();
            $table->string('detail_image_alt')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->dropColumn(['detail_content', 'detail_image', 'detail_image_alt']);
        });
    }
};
