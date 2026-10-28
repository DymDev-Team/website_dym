<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RecruitmentOptionType;
use App\Enums\Seniority;
use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\JobApplication;
use App\Models\RecruitmentOption;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CandidateController extends Controller
{
    /**
     * CV library: every candidate, searchable by skills and profile.
     */
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'job_family' => ['nullable', 'integer'],
            'seniority' => ['nullable', Rule::enum(Seniority::class)],
        ]);

        $candidates = Candidate::query()
            ->search($filters['search'] ?? null)
            ->when($filters['job_family'] ?? null, fn (Builder $query, int $id) => $query->where('job_family_id', $id))
            ->when($filters['seniority'] ?? null, fn (Builder $query, string $value) => $query->where('seniority', $value))
            ->with([
                'jobFamily:id,label',
                'applications' => fn ($query) => $query->with(['jobOffer:id,title', 'stage:id,name,color'])->latest(),
            ])
            ->latest('updated_at')
            ->paginate(25)
            ->withQueryString()
            ->through(fn (Candidate $candidate) => [
                ...$candidate->only(['id', 'display_name', 'email', 'phone', 'location', 'years_experience', 'summary']),
                'skills' => array_slice($candidate->skills ?? [], 0, 8),
                'seniority' => $candidate->seniority?->label(),
                'job_family' => $candidate->jobFamily?->label,
                'applications' => $candidate->applications->map(fn (JobApplication $application) => [
                    'id' => $application->id,
                    'offer' => $application->jobOffer?->title,
                    'stage' => $application->stage->only(['name', 'color']),
                    'score' => $application->score,
                ]),
            ]);

        return Inertia::render('admin/candidates/index', [
            'candidates' => $candidates,
            'jobFamilies' => RecruitmentOption::query()->ofType(RecruitmentOptionType::JobFamily)->get(['id', 'label']),
            'seniorities' => Seniority::options(),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'job_family' => isset($filters['job_family']) ? (string) $filters['job_family'] : '',
                'seniority' => $filters['seniority'] ?? '',
            ],
        ]);
    }

    /**
     * Correct the candidate's identity (never overwritten by the analysis).
     */
    public function update(Request $request, Candidate $candidate): RedirectResponse
    {
        $candidate->update($request->validate([
            'name' => ['nullable', 'string', 'max:160'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:60'],
            'location' => ['nullable', 'string', 'max:160'],
        ]));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Coordonnées enregistrées.']);

        return back();
    }

    /**
     * Delete the candidate with all their applications and CVs (right to
     * erasure).
     */
    public function destroy(Candidate $candidate): RedirectResponse
    {
        $candidate->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Candidat et CV supprimés.']);

        return to_route('admin.candidates.index');
    }
}
