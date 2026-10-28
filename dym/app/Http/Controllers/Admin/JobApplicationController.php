<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AnalysisStatus;
use App\Enums\ApplicationEventType;
use App\Enums\Recommendation;
use App\Enums\RecruitmentOptionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreManualApplicationRequest;
use App\Http\Requests\Admin\UpdateJobApplicationRequest;
use App\Models\ApplicationEvent;
use App\Models\JobApplication;
use App\Models\JobOffer;
use App\Models\RecruitmentOption;
use App\Models\RecruitmentStage;
use App\Recruitment\AnalysisRunner;
use App\Recruitment\ApplicationIntake;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class JobApplicationController extends Controller
{
    // Cartes affichées par colonne du pipeline.
    private const PER_STAGE = 60;

    public function __construct(private AnalysisRunner $runner) {}

    /**
     * Recruitment pipeline: one column per stage, best scores first.
     */
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'offer' => ['nullable', 'string'],
            'search' => ['nullable', 'string', 'max:100'],
            'recommendation' => ['nullable', Rule::enum(Recommendation::class)],
        ]);

        $this->runner->resumeStale();

        $stages = RecruitmentStage::query()->ordered()->get();
        $query = fn () => $this->filtered($filters);

        return Inertia::render('admin/applications/index', [
            'stages' => $stages->map(fn (RecruitmentStage $stage) => [
                ...$stage->only(['id', 'name', 'color']),
                'kind' => $stage->kind->value,
                'total' => $query()->where('stage_id', $stage->id)->count(),
                'applications' => $query()
                    ->where('stage_id', $stage->id)
                    ->with(['candidate.jobFamily:id,label', 'jobOffer:id,title,slug', 'latestAnalysis:id,job_application_id,status'])
                    ->orderByRaw('score IS NULL')
                    ->orderByDesc('score')
                    ->latest()
                    ->limit(self::PER_STAGE)
                    ->get()
                    ->map(fn (JobApplication $application) => $this->card($application)),
            ]),
            'offers' => JobOffer::query()->latest()->get(['id', 'title', 'slug', 'is_published', 'closes_at']),
            'sources' => RecruitmentOption::query()->ofType(RecruitmentOptionType::Source)->get(['id', 'label']),
            'recommendations' => $this->recommendationOptions(),
            'filters' => [
                'offer' => $filters['offer'] ?? '',
                'search' => $filters['search'] ?? '',
                'recommendation' => $filters['recommendation'] ?? '',
            ],
            'activeAnalyses' => $this->runner->active(),
            'missingAnalyses' => JobApplication::query()->withoutAnalysis()->count(),
            'aiBlockedReason' => $this->runner->blockedReason(),
        ]);
    }

    /**
     * Full file of an application: AI analysis, candidate, history.
     */
    public function show(JobApplication $application): Response
    {
        if ($application->viewed_at === null) {
            $application->update(['viewed_at' => now()]);
        }

        $this->runner->resumeStale();

        $application->load([
            'candidate.jobFamily:id,label',
            'candidate.applications' => fn ($query) => $query->whereKeyNot($application->id)->with(['jobOffer:id,title', 'stage:id,name,color'])->latest(),
            'jobOffer:id,title,slug',
            'stage:id,name,color,kind',
            'source:id,label',
            'addedBy:id,name',
            'latestAnalysis',
            'latestCompletedAnalysis.jobOffer:id,title',
            'events' => fn ($query) => $query->with('user:id,name')->latest()->latest('id'),
        ]);

        $analysis = $application->latestCompletedAnalysis;
        $attempt = $application->latestAnalysis;
        $matchedOffers = JobOffer::query()
            ->whereIn('id', array_column($analysis?->result['offer_matches'] ?? [], 'offer_id'))
            ->get(['id', 'title', 'slug']);

        return Inertia::render('admin/applications/show', [
            'application' => [
                ...$application->only(['id', 'job_offer_id', 'stage_id', 'source_id', 'message', 'answers', 'cv_name', 'cv_mime', 'score', 'created_at']),
                'recommendation' => $application->recommendation?->value,
                'candidate' => [
                    ...$application->candidate->only(['id', 'name', 'email', 'phone', 'location', 'display_name', 'years_experience', 'skills', 'profile', 'summary']),
                    'seniority' => $application->candidate->seniority?->label(),
                    'job_family' => $application->candidate->jobFamily?->label,
                ],
                'job_offer' => $application->jobOffer?->only(['id', 'title', 'slug']),
                'source' => $application->source?->label,
                'added_by' => $application->addedBy?->name,
                // Dernier résultat, gardé à l'écran pendant une nouvelle analyse ou après son échec.
                'analysis' => $analysis === null ? null : [
                    ...$analysis->only(['id', 'result', 'model', 'job_offer_id', 'finished_at']),
                    'offer' => $analysis->jobOffer?->title,
                    'cost' => (float) $analysis->cost,
                ],
                'latest_attempt' => $attempt === null || $attempt->is($analysis) ? null : [
                    ...$attempt->only(['id', 'error', 'attempts']),
                    'status' => $attempt->status->value,
                    'status_label' => $attempt->status->label(),
                ],
                'other_applications' => $application->candidate->applications->map(fn (JobApplication $other) => [
                    'id' => $other->id,
                    'offer' => $other->jobOffer?->title,
                    'stage' => $other->stage->only(['name', 'color']),
                    'score' => $other->score,
                    'created_at' => $other->created_at,
                ]),
                'events' => $application->events->map(fn (ApplicationEvent $event) => [
                    'id' => $event->id,
                    'type' => $event->type->value,
                    'data' => $event->data,
                    'user' => $event->user?->name,
                    'created_at' => $event->created_at,
                ]),
            ],
            'matchedOffers' => $matchedOffers,
            'stages' => RecruitmentStage::query()->ordered()->get(['id', 'name', 'color', 'kind']),
            'offers' => JobOffer::query()->latest()->get(['id', 'title']),
            'sources' => RecruitmentOption::query()->ofType(RecruitmentOptionType::Source)->get(['id', 'label']),
            'recommendations' => $this->recommendationOptions(),
            'aiBlockedReason' => $this->runner->blockedReason(),
        ]);
    }

    /**
     * CV added from the admin, one file per request (the bulk import sends
     * them one after the other and then drives the analyses itself).
     */
    public function store(StoreManualApplicationRequest $request, ApplicationIntake $intake): JsonResponse|RedirectResponse
    {
        $application = $intake->fromAdmin(
            cv: $request->file('cv'),
            user: $request->user(),
            offer: $request->filled('job_offer_id') ? JobOffer::query()->find($request->integer('job_offer_id')) : null,
            source: $request->filled('source_id') ? RecruitmentOption::query()->find($request->integer('source_id')) : null,
            stage: $request->filled('stage_id') ? RecruitmentStage::query()->find($request->integer('stage_id')) : null,
            identity: $request->safe()->only(['name', 'email', 'phone']),
            runAfterResponse: ! $request->wantsJson(),
        );

        if ($request->wantsJson()) {
            return response()->json(['id' => $application->id], 201);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Candidat ajouté.']);

        return to_route('admin.applications.show', $application);
    }

    /**
     * Move the application to another stage, offer or source.
     */
    public function update(UpdateJobApplicationRequest $request, JobApplication $application): RedirectResponse
    {
        $user = $request->user();
        $id = fn (string $key) => $request->filled($key) ? $request->integer($key) : null;

        if ($request->has('stage_id') && $id('stage_id') !== $application->stage_id) {
            $from = $application->stage->name;
            $application->update(['stage_id' => $id('stage_id')]);
            $application->record(ApplicationEventType::StageChanged, ['from' => $from, 'to' => $application->refresh()->stage->name], $user);
        }

        if ($request->has('source_id')) {
            $application->update(['source_id' => $id('source_id')]);
        }

        // Un autre poste visé rend l'ancienne note caduque : nouvelle analyse.
        if ($request->has('job_offer_id') && $id('job_offer_id') !== $application->job_offer_id) {
            $application->update(['job_offer_id' => $id('job_offer_id'), 'score' => null, 'recommendation' => null]);
            $this->runner->request($application, $user);
        }

        return back();
    }

    /**
     * Run a new analysis of the CV (the previous ones are kept).
     */
    public function analyze(Request $request, JobApplication $application): RedirectResponse
    {
        if ($application->latestAnalysis?->status->isActive()) {
            Inertia::flash('toast', ['type' => 'info', 'message' => 'Une analyse est déjà en cours.']);

            return back();
        }

        $analysis = $this->runner->request($application, $request->user());

        Inertia::flash('toast', $analysis->status === AnalysisStatus::Skipped
            ? ['type' => 'error', 'message' => $analysis->error]
            : ['type' => 'success', 'message' => 'Analyse lancée. Le résultat s’affichera dans quelques instants.']);

        return back();
    }

    /**
     * Add an internal note to the history.
     */
    public function note(Request $request, JobApplication $application): RedirectResponse
    {
        $validated = $request->validate(['body' => ['required', 'string', 'max:5000']]);

        $application->record(ApplicationEventType::Note, ['body' => $validated['body']], $request->user());

        return back();
    }

    /**
     * Download the candidate's CV.
     */
    public function cv(JobApplication $application): StreamedResponse
    {
        return Storage::disk(JobApplication::CV_DISK)->download($application->cv_path, $application->cv_name);
    }

    /**
     * Delete an application and its CV; a candidate left without any
     * application is deleted too.
     */
    public function destroy(JobApplication $application): RedirectResponse
    {
        $candidate = $application->candidate;

        $application->delete();
        Storage::disk(JobApplication::CV_DISK)->delete($application->cv_path);

        if (! $candidate->applications()->exists()) {
            $candidate->delete();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Candidature supprimée.']);

        return to_route('admin.applications.index');
    }

    /**
     * @param  array<string, string|null>  $filters
     * @return Builder<JobApplication>
     */
    private function filtered(array $filters): Builder
    {
        $offer = $filters['offer'] ?? null;

        return JobApplication::query()
            ->when($offer === 'spontaneous', fn (Builder $query) => $query->whereNull('job_offer_id'))
            ->when(is_numeric($offer), fn (Builder $query) => $query->where('job_offer_id', $offer))
            ->when($filters['recommendation'] ?? null, fn (Builder $query, string $value) => $query->where('recommendation', $value))
            ->when($filters['search'] ?? null, fn (Builder $query, string $term) => $query->whereHas('candidate', fn (Builder $q) => $q->search($term)));
    }

    /**
     * Data of a pipeline card.
     *
     * @return array<string, mixed>
     */
    private function card(JobApplication $application): array
    {
        $candidate = $application->candidate;

        return [
            'id' => $application->id,
            'stage_id' => $application->stage_id,
            'score' => $application->score,
            'recommendation' => $application->recommendation?->value,
            'viewed' => $application->viewed_at !== null,
            'created_at' => $application->created_at,
            'analysis_status' => $application->latestAnalysis?->status->value,
            'offer' => $application->jobOffer?->title,
            'candidate' => [
                'name' => $candidate->display_name,
                'summary' => $candidate->summary,
                'job_family' => $candidate->jobFamily?->label,
                'seniority' => $candidate->seniority?->value,
                'years_experience' => $candidate->years_experience,
            ],
        ];
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function recommendationOptions(): array
    {
        return array_map(
            fn (Recommendation $recommendation) => ['value' => $recommendation->value, 'label' => $recommendation->label()],
            Recommendation::cases(),
        );
    }
}
