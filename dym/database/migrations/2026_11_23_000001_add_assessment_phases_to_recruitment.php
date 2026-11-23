<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Assessment phases of the pipeline: automatic move to review above an AI
 * score, psychotechnical test sent to the candidate, then the managing
 * director's appraisal.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Rôle d'une étape pour le code : son nom reste libre dans l'admin.
        Schema::table('recruitment_stages', function (Blueprint $table) {
            $table->string('role', 20)->nullable()->unique()->after('kind');
        });

        // Base commune du test, partagée par les candidats d'une même offre.
        Schema::table('job_offers', function (Blueprint $table) {
            $table->json('psychotest_questions')->nullable();
        });

        Schema::create('psychotests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_application_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('token', 64)->unique();
            $table->json('questions');
            $table->json('answers')->nullable();
            $table->unsignedTinyInteger('score')->nullable();
            $table->unsignedSmallInteger('duration_minutes');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::table('job_applications', function (Blueprint $table) {
            $table->unsignedTinyInteger('test_score')->nullable()->after('recommendation');
            $table->unsignedTinyInteger('dg_score')->nullable()->after('test_score');
            $table->json('dg_review')->nullable()->after('dg_score');
            $table->text('dg_comment')->nullable()->after('dg_review');
            $table->foreignId('dg_reviewed_by_id')->nullable()->after('dg_comment')->constrained('users')->nullOnDelete();
            $table->timestamp('dg_reviewed_at')->nullable()->after('dg_reviewed_by_id');
        });

        $this->addStages();
    }

    /**
     * Mark the review stage and insert the test and appraisal stages right
     * after it, the later stages moving down.
     */
    private function addStages(): void
    {
        $stages = DB::table('recruitment_stages')->orderBy('position')->orderBy('id')->get(['id', 'name', 'kind', 'position']);
        $review = $stages->firstWhere('name', 'En cours d’étude')
            ?? $stages->where('kind', 'open')->skip(1)->first();
        $after = $review !== null ? $review->position : $stages->max('position');

        if ($review !== null) {
            DB::table('recruitment_stages')->where('id', $review->id)->update(['role' => 'review']);
        }

        DB::table('recruitment_stages')->where('position', '>', $after)->increment('position', 2);

        $now = now();
        DB::table('recruitment_stages')->insert([
            ['name' => 'Test psychotechnique', 'color' => '#0891b2', 'kind' => 'open', 'role' => 'psychotest', 'position' => $after + 1, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Appréciation DG', 'color' => '#db2777', 'kind' => 'open', 'role' => 'dg_review', 'position' => $after + 2, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $added = DB::table('recruitment_stages')->whereIn('role', ['psychotest', 'dg_review'])->pluck('id');
        $fallback = DB::table('recruitment_stages')->where('role', 'review')->value('id')
            ?? DB::table('recruitment_stages')->whereNotIn('id', $added)->orderBy('position')->value('id');

        DB::table('job_applications')->whereIn('stage_id', $added)->update(['stage_id' => $fallback]);
        DB::table('recruitment_stages')->whereIn('id', $added)->delete();

        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropConstrainedForeignId('dg_reviewed_by_id');
            $table->dropColumn(['test_score', 'dg_score', 'dg_review', 'dg_comment', 'dg_reviewed_at']);
        });

        Schema::dropIfExists('psychotests');

        Schema::table('job_offers', function (Blueprint $table) {
            $table->dropColumn('psychotest_questions');
        });

        Schema::table('recruitment_stages', function (Blueprint $table) {
            $table->dropUnique(['role']);
            $table->dropColumn('role');
        });
    }
};
