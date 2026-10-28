<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Étapes reprises des anciens statuts figés, dans l'ordre du pipeline.
     *
     * @var array<string, array{0: string, 1: string, 2: string}>
     */
    private const STAGES = [
        'new' => ['Nouvelle', '#2563eb', 'open'],
        'reviewing' => ['En cours d’étude', '#7c3aed', 'open'],
        'interview' => ['Entretien', '#d97706', 'open'],
        'hired' => ['Retenue', '#16a34a', 'hired'],
        'rejected' => ['Refusée', '#64748b', 'rejected'],
    ];

    private const JOB_FAMILIES = [
        'Soudure', 'Chaudronnerie', 'Usinage', 'Montage / Chantier', 'Bureau d’études',
        'Maintenance', 'Qualité / HSE', 'Commercial', 'Administratif / Finance', 'Logistique', 'Autre',
    ];

    private const SOURCES = [
        'Site web', 'Ajout manuel', 'Cooptation', 'Salon / Forum', 'LinkedIn', 'E-mail reçu', 'Autre',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('recruitment_stages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('color', 7);
            $table->string('kind')->default('open');
            $table->unsignedSmallInteger('position')->default(0)->index();
            $table->timestamps();
        });

        Schema::create('recruitment_options', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->string('label');
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->unique(['type', 'label']);
        });

        Schema::create('recruitment_settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        Schema::create('candidates', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('email')->nullable()->index();
            $table->string('phone')->nullable();
            $table->string('location')->nullable();
            $table->foreignId('job_family_id')->nullable()->constrained('recruitment_options')->nullOnDelete();
            $table->string('seniority')->nullable()->index();
            $table->unsignedTinyInteger('years_experience')->nullable();
            $table->json('skills')->nullable();
            $table->json('profile')->nullable();
            $table->text('summary')->nullable();
            // Identité, compétences et résumé en minuscules sans accents.
            $table->text('search_text')->nullable();
            $table->timestamps();
        });

        Schema::table('job_applications', function (Blueprint $table) {
            $table->foreignId('candidate_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->foreignId('stage_id')->nullable()->after('job_offer_id')->constrained('recruitment_stages')->restrictOnDelete();
            $table->foreignId('source_id')->nullable()->constrained('recruitment_options')->nullOnDelete();
            $table->foreignId('added_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('cv_mime')->nullable();
            $table->unsignedTinyInteger('score')->nullable()->index();
            $table->string('recommendation')->nullable();
            $table->timestamp('viewed_at')->nullable();
        });

        Schema::create('application_analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_application_id')->constrained()->cascadeOnDelete();
            // Poste pour lequel le CV a été noté (null : sans poste visé).
            $table->foreignId('job_offer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->index();
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->string('model')->nullable();
            $table->string('prompt_version')->nullable();
            $table->json('result')->nullable();
            $table->text('error')->nullable();
            $table->unsignedInteger('input_tokens')->default(0);
            $table->unsignedInteger('output_tokens')->default(0);
            $table->unsignedInteger('cache_read_tokens')->default(0);
            $table->unsignedInteger('cache_write_tokens')->default(0);
            $table->decimal('cost', 10, 6)->default(0);
            $table->unsignedInteger('duration_ms')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('application_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type');
            $table->json('data')->nullable();
            $table->timestamps();

            $table->index(['job_application_id', 'created_at']);
        });

        $this->seedDefaults();
        $this->migrateExistingApplications();

        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn(['name', 'email', 'phone', 'status']);
        });

        Schema::table('job_applications', function (Blueprint $table) {
            $table->foreignId('candidate_id')->nullable(false)->change();
            $table->foreignId('stage_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->string('name')->default('');
            $table->string('email')->default('');
            $table->string('phone')->nullable();
            $table->string('status')->default('new')->index();
        });

        $statuses = DB::table('recruitment_stages')->pluck('kind', 'id');

        DB::table('job_applications')->orderBy('id')->each(function (object $application) use ($statuses) {
            $candidate = DB::table('candidates')->find($application->candidate_id);

            DB::table('job_applications')->where('id', $application->id)->update([
                'name' => $candidate->name ?? '',
                'email' => $candidate->email ?? '',
                'phone' => $candidate->phone ?? null,
                'status' => match ($statuses[$application->stage_id] ?? 'open') {
                    'hired' => 'hired',
                    'rejected' => 'rejected',
                    default => 'reviewing',
                },
            ]);
        });

        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropConstrainedForeignId('candidate_id');
            $table->dropConstrainedForeignId('stage_id');
            $table->dropConstrainedForeignId('source_id');
            $table->dropConstrainedForeignId('added_by_id');
            $table->dropIndex(['score']);
            $table->dropColumn(['cv_mime', 'score', 'recommendation', 'viewed_at']);
        });

        Schema::dropIfExists('application_events');
        Schema::dropIfExists('application_analyses');
        Schema::dropIfExists('candidates');
        Schema::dropIfExists('recruitment_settings');
        Schema::dropIfExists('recruitment_options');
        Schema::dropIfExists('recruitment_stages');
    }

    /**
     * Default stages, job families and sources, all editable in the admin.
     */
    private function seedDefaults(): void
    {
        $now = now();

        // array_map sur deux tableaux renvoie une liste : les clés des statuts disparaissent.
        DB::table('recruitment_stages')->insert(array_map(
            fn (array $stage, int $position) => [
                'name' => $stage[0],
                'color' => $stage[1],
                'kind' => $stage[2],
                'position' => $position,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            self::STAGES,
            range(0, count(self::STAGES) - 1),
        ));

        foreach (['job_family' => self::JOB_FAMILIES, 'source' => self::SOURCES] as $type => $labels) {
            DB::table('recruitment_options')->insert(array_map(
                fn (string $label, int $position) => [
                    'type' => $type,
                    'label' => $label,
                    'position' => $position,
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                $labels,
                array_keys($labels),
            ));
        }
    }

    /**
     * Move the identity of existing applicants to candidates (one per e-mail)
     * and their fixed status to the matching stage.
     */
    private function migrateExistingApplications(): void
    {
        $stageIds = DB::table('recruitment_stages')->orderBy('position')->pluck('id')->combine(array_keys(self::STAGES))->flip();
        $websiteSource = DB::table('recruitment_options')->where('type', 'source')->where('label', 'Site web')->value('id');
        $candidateIds = [];

        DB::table('job_applications')->orderBy('id')->each(function (object $application) use ($stageIds, $websiteSource, &$candidateIds) {
            $email = mb_strtolower(trim($application->email));

            $candidateIds[$email] ??= DB::table('candidates')->insertGetId([
                'name' => $application->name,
                'email' => $email,
                'phone' => $application->phone,
                'search_text' => Str::lower(Str::ascii("{$application->name} {$email} {$application->phone}")),
                'created_at' => $application->created_at,
                'updated_at' => $application->updated_at,
            ]);

            DB::table('job_applications')->where('id', $application->id)->update([
                'candidate_id' => $candidateIds[$email],
                'stage_id' => $stageIds[$application->status] ?? $stageIds['new'],
                'source_id' => $websiteSource,
                'viewed_at' => $application->status === 'new' ? null : $application->updated_at,
            ]);
        });
    }
};
