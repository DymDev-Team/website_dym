<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Hiring advice of the AI, written from the AI, test and DG scores: a
 * decision aid, the decision staying human.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->string('verdict', 20)->nullable()->after('dg_reviewed_at');
            $table->text('verdict_comment')->nullable()->after('verdict');
            $table->timestamp('verdict_at')->nullable()->after('verdict_comment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn(['verdict', 'verdict_comment', 'verdict_at']);
        });
    }
};
