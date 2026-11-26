<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_page_views', function (Blueprint $table) {
            $table->date('viewed_on');
            $table->string('section', 64);
            $table->unsignedBigInteger('views');
            $table->primary(['viewed_on', 'section']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_page_views');
    }
};
