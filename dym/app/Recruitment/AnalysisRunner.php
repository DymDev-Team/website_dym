<?php

namespace App\Recruitment;

use App\Enums\AnalysisStatus;
use App\Enums\ApplicationEventType;
use App\Enums\RecruitmentOptionType;
use App\Models\AiCall;
use App\Models\ApplicationAnalysis;
use App\Models\Candidate;
use App\Models\JobApplication;
use App\Models\JobOffer;
use App\Models\RecruitmentOption;
use App\Models\RecruitmentSetting;
use App\Models\User;
use App\Recruitment\Ai\AnalysisRequest;
use App\Recruitment\Ai\AnalysisSchema;
use App\Recruitment\Ai\CandidateAnalyzer;
use App\Recruitment\Ai\ModelReply;
use App\Recruitment\Exceptions\PermanentAnalysisError;
use App\Recruitment\Exceptions\TransientAnalysisError;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Throwable;

/**
 * Runs CV analyses without queue worker nor cron. Their state lives in the
 * database; they run after the HTTP response when PHP can send it first
 * (FPM, LiteSpeed), and otherwise one by one from the open admin pages,
 * which also resume analyses left behind by an interrupted process.
 */
class AnalysisRunner
{
    public function __construct(private CandidateAnalyzer $analyzer, private AiGuard $guard) {}

    /**
     * Queue an analysis of the application's CV and start it after the
     * response, unless the bulk import drives it itself.
     */
    public function request(JobApplication $application, ?User $user = null, bool $runAfterResponse = true): ApplicationAnalysis
    {
        $analysis = $application->analyses()->create([
            'status' => AnalysisStatus::Pending,
            'job_offer_id' => $application->job_offer_id,
        ]);
        $application->record(ApplicationEventType::AnalysisRequested, null, $user);

        if ($reason = $this->blockedReason()) {
            $this->skip($analysis, $reason);
        } elseif ($runAfterResponse) {
            $this->runAfterResponse($analysis);
        }

        return $analysis;
    }

    /**
     * Queue an analysis for every CV never analysed, or skipped because the
     * AI was off, had no key or was over budget when it arrived.
     */
    public function requestMissing(User $user): int
    {
        $applications = JobApplication::query()->withoutAnalysis()->get();

        $applications->each(fn (JobApplication $application) => $this->request($application, $user, runAfterResponse: false));

        return $applications->count();
    }

    /**
     * Resume a few analyses left pending or interrupted, after the response.
     */
    public function resumeStale(): void
    {
        $this->failInterrupted();

        if (! $this->runsAfterResponse() || $this->blockedReason() !== null) {
            return;
        }

        ApplicationAnalysis::query()
            ->runnable()
            // Les analyses toutes récentes ont déjà leur propre exécution prévue.
            ->where('updated_at', '<', now()->subMinute())
            ->oldest('id')
            ->limit((int) config('recruitment.resume_per_request'))
            ->get()
            ->each(fn (ApplicationAnalysis $analysis) => $this->runAfterResponse($analysis));
    }

    /**
     * Run a waiting analysis now, the preferred one if it can run: used by
     * the admin pages that drive the analyses.
     */
    public function runNext(?ApplicationAnalysis $preferred = null): ?ApplicationAnalysis
    {
        $this->failInterrupted();

        if ($reason = $this->blockedReason()) {
            ApplicationAnalysis::query()->where('status', AnalysisStatus::Pending)->get()
                ->each(fn (ApplicationAnalysis $analysis) => $this->skip($analysis, $reason));

            return null;
        }

        $runnable = ApplicationAnalysis::query()->runnable();
        $analysis = ($preferred ? (clone $runnable)->whereKey($preferred->id)->first() : null)
            ?? $runnable->oldest('id')->first();

        return $analysis === null ? null : $this->run($analysis);
    }

    /**
     * Analyses that can be started now (waiting, or interrupted).
     */
    public function remaining(): int
    {
        return ApplicationAnalysis::query()->runnable()->count();
    }

    /**
     * Analyses without result yet, including those running right now.
     */
    public function active(): int
    {
        return ApplicationAnalysis::query()
            ->whereIn('status', [AnalysisStatus::Pending, AnalysisStatus::Processing])
            ->count();
    }

    /**
     * Whether PHP can send the response before running the analysis. If not,
     * a candidate would wait for it: the admin pages drive it instead.
     */
    public function runsAfterResponse(): bool
    {
        return match (config('recruitment.background')) {
            'after_response' => true,
            'browser' => false,
            default => function_exists('fastcgi_finish_request') || function_exists('litespeed_finish_request'),
        };
    }

    /**
     * Claim the analysis and run it. Returns null when another process
     * already took it.
     */
    public function run(ApplicationAnalysis $analysis): ?ApplicationAnalysis
    {
        if (! $this->claim($analysis)) {
            return null;
        }

        $analysis->refresh();

        if ($reason = $this->blockedReason()) {
            return $this->skip($analysis, $reason);
        }

        if (function_exists('set_time_limit')) {
            @set_time_limit((int) config('recruitment.timeout') + 60);
        }

        $started = hrtime(true);

        try {
            $this->analyze($analysis);
        } catch (PermanentAnalysisError $e) {
            $this->fail($analysis, $e->getMessage(), retry: false);
        } catch (TransientAnalysisError $e) {
            $this->fail($analysis, $e->getMessage(), retry: true);
        } catch (Throwable $e) {
            report($e);
            $this->fail($analysis, 'Erreur inattendue pendant l’analyse : un nouvel essai sera fait automatiquement.', retry: true);
        }

        $analysis->update(['duration_ms' => intdiv(hrtime(true) - $started, 1_000_000)]);

        return $analysis;
    }

    /**
     * Why no analysis can run right now, if anything prevents it.
     */
    public function blockedReason(): ?string
    {
        return $this->guard->blockedReason();
    }

    /**
     * An analysis whose process died during its last attempt would stay
     * « running » forever: mark it as failed instead.
     */
    private function failInterrupted(): void
    {
        ApplicationAnalysis::query()
            ->where('status', AnalysisStatus::Processing)
            ->where('attempts', '>=', (int) config('recruitment.max_attempts'))
            ->where('started_at', '<', now()->subMinutes((int) config('recruitment.stale_after_minutes')))
            ->get()
            ->each(fn (ApplicationAnalysis $analysis) => $this->fail(
                $analysis,
                'Analyse interrompue à chaque tentative (délai d’exécution du serveur dépassé ?).',
                retry: false,
            ));
    }

    /**
     * Mark the analysis as running, atomically: only one process wins.
     */
    private function claim(ApplicationAnalysis $analysis): bool
    {
        return ApplicationAnalysis::query()
            ->whereKey($analysis->id)
            ->runnable()
            ->update([
                'status' => AnalysisStatus::Processing,
                'attempts' => DB::raw('attempts + 1'),
                'started_at' => now(),
                'error' => null,
                'updated_at' => now(),
            ]) === 1;
    }

    private function runAfterResponse(ApplicationAnalysis $analysis): void
    {
        if ($this->runsAfterResponse()) {
            defer(fn () => $this->run($analysis), 'recruitment-analysis-'.$analysis->id);
        }
    }

    private function analyze(ApplicationAnalysis $analysis): void
    {
        $application = $analysis->application()->with(['candidate', 'jobOffer'])->firstOrFail();
        $settings = RecruitmentSetting::values();
        $target = $application->jobOffer;

        $openOffers = JobOffer::query()->open()->latest()
            ->limit((int) config('recruitment.max_offers_compared'))
            ->get();

        $response = $this->analyzer->analyze(new AnalysisRequest(
            cv: CvDocument::fromStorage(JobApplication::CV_DISK, $application->cv_path),
            targetOffer: $target,
            openOffers: $openOffers,
            jobFamilies: array_keys($this->jobFamilies(lowercase: false)),
            message: $application->message,
            customInstructions: $settings['custom_instructions'],
            apiKey: (string) $settings['api_key'],
            model: $settings['model'],
            effort: $settings['effort'],
            webResearch: $settings['web_research'],
            answers: array_map(fn (array $answer) => ['label' => $answer['label'], 'answer' => $answer['answer']], $application->answers ?? []),
        ));

        $this->recordUsage($analysis, $response, $target);

        $offerIds = array_values(array_diff($openOffers->modelKeys(), [$target?->id]));
        $data = $this->validated(AnalysisSchema::normalize($response->data), $target !== null, $offerIds);

        DB::transaction(fn () => $this->store($analysis, $application, $data));
    }

    /**
     * Usage is saved before validation: a rejected answer was still billed.
     */
    private function recordUsage(ApplicationAnalysis $analysis, ModelReply $response, ?JobOffer $target): void
    {
        $analysis->update([
            // Le poste a pu changer entre la demande et l'exécution.
            'job_offer_id' => $target?->id,
            'model' => $response->model,
            'prompt_version' => config('recruitment.prompt_version'),
            'input_tokens' => $analysis->input_tokens + $response->inputTokens,
            'output_tokens' => $analysis->output_tokens + $response->outputTokens,
            'cache_read_tokens' => $analysis->cache_read_tokens + $response->cacheReadTokens,
            'cache_write_tokens' => $analysis->cache_write_tokens + $response->cacheWriteTokens,
            'cost' => (float) $analysis->cost + $response->cost(),
        ]);

        AiCall::record(AiCall::CV_ANALYSIS, $response, $target?->id);
    }

    /**
     * Check the model's answer against the analysis rules.
     *
     * @param  array<string, mixed>  $data
     * @param  list<int>  $offerIds
     * @return array<string, mixed>
     */
    private function validated(array $data, bool $withEvaluation, array $offerIds): array
    {
        // Une correspondance vers une offre inconnue est écartée, pas fatale.
        $matches = array_filter(
            is_array($data['offer_matches'] ?? null) ? $data['offer_matches'] : [],
            fn ($match) => is_array($match) && in_array($match['offer_id'] ?? null, $offerIds, true),
        );
        usort($matches, fn (array $a, array $b) => ($b['score'] ?? 0) <=> ($a['score'] ?? 0));
        $data['offer_matches'] = array_slice($matches, 0, 3);

        if (! $withEvaluation) {
            $data['evaluation'] = null;
        }

        try {
            return Validator::make($data, AnalysisSchema::rules($withEvaluation, $offerIds))->validate();
        } catch (ValidationException $e) {
            report($e);

            throw new TransientAnalysisError('Réponse de l’IA incomplète : un nouvel essai sera fait automatiquement.');
        }
    }

    /**
     * Save the analysis and copy its results to the application and candidate.
     *
     * @param  array<string, mixed>  $data
     */
    private function store(ApplicationAnalysis $analysis, JobApplication $application, array $data): void
    {
        $profile = $data['profile'];
        // La note finale vient de la grille de l'offre et des seuils, pas du modèle seul.
        $evaluation = isset($data['evaluation']) ? Scoring::apply($data['evaluation'], $application->jobOffer?->criteria) : null;
        $data['evaluation'] = $evaluation;

        $analysis->update([
            'status' => AnalysisStatus::Completed,
            'result' => Arr::only($data, ['profile', 'summary', 'evaluation', 'offer_matches', 'research', 'assessment', 'warnings']),
            'finished_at' => now(),
        ]);

        $application->update([
            'score' => $evaluation['score'] ?? null,
            'recommendation' => $evaluation['recommendation'] ?? null,
        ]);

        $candidate = $application->candidate;

        // L'identité saisie par le candidat ou l'équipe n'est jamais écrasée.
        foreach (['name', 'email', 'phone', 'location'] as $field) {
            if (blank($candidate->{$field}) && filled($profile[$field] ?? null)) {
                $candidate->{$field} = $field === 'email' && ! filter_var($profile[$field], FILTER_VALIDATE_EMAIL)
                    ? null
                    : $profile[$field];
            }
        }

        $candidate->fill([
            'job_family_id' => $this->jobFamilies()[mb_strtolower((string) ($profile['job_family'] ?? ''))] ?? null,
            'seniority' => $profile['seniority'] ?? null,
            'years_experience' => $profile['years_experience'] ?? null,
            'skills' => array_values(array_unique($profile['skills'])),
            'summary' => $data['summary'],
            'profile' => Arr::only($profile, ['headline', 'languages', 'certifications', 'education', 'experiences']),
        ])->save();

        $application->record(ApplicationEventType::AnalysisCompleted, [
            'score' => $evaluation['score'] ?? null,
            'recommendation' => $evaluation['recommendation'] ?? null,
        ]);

        $this->mergeDuplicate($candidate, $application);
    }

    /**
     * A CV added without e-mail may turn out to belong to a known candidate:
     * its applications then join that candidate's file.
     */
    private function mergeDuplicate(Candidate $candidate, JobApplication $application): void
    {
        if ($candidate->email === null) {
            return;
        }

        $existing = Candidate::query()
            ->where('email', $candidate->email)
            ->whereKeyNot($candidate->id)
            ->oldest('id')
            ->first();

        if ($existing === null) {
            return;
        }

        $candidate->applications()->update(['candidate_id' => $existing->id]);
        $candidate->delete();

        $application->record(ApplicationEventType::CandidateMerged, ['candidate_id' => $existing->id]);
    }

    private function fail(ApplicationAnalysis $analysis, string $error, bool $retry): void
    {
        $canRetry = $retry && $analysis->attempts < (int) config('recruitment.max_attempts');

        $analysis->update([
            'status' => $canRetry ? AnalysisStatus::Pending : AnalysisStatus::Failed,
            'error' => mb_substr($error, 0, 2000),
            'finished_at' => $canRetry ? null : now(),
        ]);

        if (! $canRetry) {
            $analysis->application->record(ApplicationEventType::AnalysisFailed, ['error' => $analysis->error]);
        }
    }

    private function skip(ApplicationAnalysis $analysis, string $reason): ApplicationAnalysis
    {
        $analysis->update([
            'status' => AnalysisStatus::Skipped,
            'error' => $reason,
            'finished_at' => now(),
        ]);

        return $analysis;
    }

    /**
     * Job family ids keyed by label, lowercased for matching the model's answer.
     *
     * @return array<string, int>
     */
    private function jobFamilies(bool $lowercase = true): array
    {
        return RecruitmentOption::query()
            ->ofType(RecruitmentOptionType::JobFamily)
            ->get(['id', 'label'])
            ->mapWithKeys(fn (RecruitmentOption $option) => [($lowercase ? mb_strtolower($option->label) : $option->label) => $option->id])
            ->all();
    }
}
