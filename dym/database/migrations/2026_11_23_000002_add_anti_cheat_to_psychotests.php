<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Anti-cheating: one question at a time with its own time limit, page exits
 * counted (a warning, then the test stops), test bound to the device where
 * it started.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('psychotests', function (Blueprint $table) {
            $table->string('device_hash', 64)->nullable()->after('token');
            $table->unsignedSmallInteger('question_seconds')->default(60)->after('duration_minutes');
            $table->unsignedSmallInteger('current_question')->default(0)->after('answers');
            $table->unsignedTinyInteger('exits')->default(0)->after('current_question');
            $table->unsignedInteger('away_seconds')->default(0)->after('exits');
            $table->string('stopped_reason', 20)->nullable()->after('away_seconds');
            $table->timestamp('question_started_at')->nullable()->after('started_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('psychotests', function (Blueprint $table) {
            $table->dropColumn(['device_hash', 'question_seconds', 'current_question', 'exits', 'away_seconds', 'stopped_reason', 'question_started_at']);
        });
    }
};
