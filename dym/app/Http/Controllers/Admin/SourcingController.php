<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\CandidateMatch;
use App\Models\JobOffer;
use App\Recruitment\AiGuard;
use App\Recruitment\ApplicationIntake;
use App\Recruitment\CandidateSourcing;
use App\Recruitment\Exceptions\PermanentAnalysisError;
use App\Recruitment\Exceptions\TransientAnalysisError;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Search of the CV library for candidates matching an offer.
 */
class SourcingController extends Controller
{
    // En dessous, une correspondance n'est montrée que sur demande.
    public const MIN_SCORE = 50;

    public function __construct(private CandidateSourcing $sourcing) {}

    /**
     * Candidates of the CV library, best matches first.
     */
    public function show(Request $request, JobOffer $jobOffer, AiGuard $guard): Response
    {
        $showAll = $request->boolean('all');

        $matches = $jobOffer->matches()
            ->with(['candidate.jobFamily:id,label', 'candidate.applications' => fn ($query) => $query->where('job_offer_id', $jobOffer->id)->select(['id', 'candidate_id', 'job_offer_id'])])
            ->when(! $showAll, fn ($query) => $query->where('score', '>=', self::MIN_SCORE))
            ->orderByDesc('score')
            ->limit(200)
            ->get();

        return Inertia::render('admin/job-offers/sourcing', [
            'offer' => [
                ...$jobOffer->only(['id', 'slug', 'title', 'location', 'contract_type']),
                'has_criteria' => filled($jobOffer->criteria),
                'sourcing_started_at' => $jobOffer->sourcing_started_at,
            ],
            'matches' => $matches->map(fn (CandidateMatch $match) => [
                'id' => $match->id,
                'score' => $match->score,
                'reason' => $match->reason,
                'updated_at' => $match->updated_at,
                'candidate' => [
                    ...$match->candidate->only(['id', 'display_name', 'location', 'years_experience', 'summary']),
                    'skills' => array_slice($match->candidate->skills ?? [], 0, 8),
                    'job_family' => $match->candidate->jobFamily?->label,
                    'seniority' => $match->candidate->seniority?->label(),
                    'application_id' => $match->candidate->applications->first()?->id,
                ],
            ]),
            'showAll' => $showAll,
            'minScore' => self::MIN_SCORE,
            'eligible' => $this->sourcing->eligible($jobOffer)->count(),
            'remaining' => $jobOffer->sourcing_started_at ? $this->sourcing->pending($jobOffer)->count() : 0,
            'aiBlockedReason' => $guard->blockedReason(),
        ]);
    }

    /**
     * Start a new search; the page then scores the library chunk by chunk.
     */
    public function start(JobOffer $jobOffer): RedirectResponse
    {
        $this->sourcing->start($jobOffer);

        return back();
    }

    /**
     * Score the next chunk of candidates.
     */
    public function next(JobOffer $jobOffer): JsonResponse
    {
        try {
            return response()->json($this->sourcing->next($jobOffer));
        } catch (PermanentAnalysisError|TransientAnalysisError $e) {
            return response()->json(['message' => $e->getMessage(), 'retry' => $e instanceof TransientAnalysisError], 422);
        }
    }

    /**
     * Add a library candidate to the offer's pipeline.
     */
    public function add(Request $request, JobOffer $jobOffer, Candidate $candidate, ApplicationIntake $intake): RedirectResponse
    {
        $score = $jobOffer->matches()->where('candidate_id', $candidate->id)->value('score');

        $intake->fromCandidate($candidate, $jobOffer, $request->user(), $score === null ? null : (int) $score);

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$candidate->display_name} ajouté au pipeline : son CV est analysé pour ce poste."]);

        return back();
    }
}
