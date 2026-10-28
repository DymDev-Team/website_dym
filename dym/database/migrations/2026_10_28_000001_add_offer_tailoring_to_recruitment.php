<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('job_offers', function (Blueprint $table) {
            // Grille d'évaluation : [{name, weight 1-5, essential}], jamais publiée sur le site.
            $table->json('criteria')->nullable()->after('requirements');
            // Questions du formulaire : [{id, label, type, options, required}].
            $table->json('questions')->nullable()->after('criteria');
            // Début de la dernière recherche dans la base de CV pour cette offre.
            $table->timestamp('sourcing_started_at')->nullable();
        });

        Schema::table('job_applications', function (Blueprint $table) {
            // Réponses aux questions de l'offre, avec l'intitulé tel qu'il était posé.
            $table->json('answers')->nullable()->after('message');
        });

        Schema::create('candidate_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_offer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('candidate_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('score')->index();
            $table->text('reason');
            $table->string('model')->nullable();
            $table->string('prompt_version')->nullable();
            $table->timestamps();

            $table->unique(['job_offer_id', 'candidate_id']);
        });

        Schema::create('recruitment_ai_calls', function (Blueprint $table) {
            $table->id();
            $table->string('task')->index();
            $table->string('model')->nullable();
            $table->unsignedInteger('input_tokens')->default(0);
            $table->unsignedInteger('output_tokens')->default(0);
            $table->unsignedInteger('cache_read_tokens')->default(0);
            $table->unsignedInteger('cache_write_tokens')->default(0);
            $table->decimal('cost', 10, 6)->default(0);
            $table->foreignId('job_offer_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->index('created_at');
        });

        // Le plafond mensuel se calcule désormais sur ce journal : on y reprend les analyses déjà facturées.
        DB::table('application_analyses')->where('cost', '>', 0)->orderBy('id')->each(function (object $analysis) {
            DB::table('recruitment_ai_calls')->insert([
                'task' => 'cv_analysis',
                'model' => $analysis->model,
                'input_tokens' => $analysis->input_tokens,
                'output_tokens' => $analysis->output_tokens,
                'cache_read_tokens' => $analysis->cache_read_tokens,
                'cache_write_tokens' => $analysis->cache_write_tokens,
                'cost' => $analysis->cost,
                'job_offer_id' => $analysis->job_offer_id,
                'created_at' => $analysis->created_at,
                'updated_at' => $analysis->updated_at,
            ]);
        });

        if (! DB::table('recruitment_options')->where('type', 'source')->where('label', 'Base de CV')->exists()) {
            DB::table('recruitment_options')->insert([
                'type' => 'source',
                'label' => 'Base de CV',
                'position' => (int) DB::table('recruitment_options')->where('type', 'source')->max('position') + 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recruitment_ai_calls');
        Schema::dropIfExists('candidate_matches');

        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn('answers');
        });

        Schema::table('job_offers', function (Blueprint $table) {
            $table->dropColumn(['criteria', 'questions', 'sourcing_started_at']);
        });
    }
};
