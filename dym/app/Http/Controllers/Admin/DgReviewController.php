<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ApplicationEventType;
use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\RecruitmentSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Managing director's appraisal: each criterion of the grid set in the
 * admin scored from 1 to 5, giving a mark out of 100.
 */
class DgReviewController extends Controller
{
    public function update(Request $request, JobApplication $application): RedirectResponse
    {
        $criteria = RecruitmentSetting::values()['dg_criteria'];

        $validated = $request->validate([
            'scores' => ['required', 'array', 'size:'.count($criteria)],
            'scores.*' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:5000'],
        ], [
            'scores.required' => 'Notez chaque critère.',
            'scores.size' => 'Notez chaque critère.',
            'scores.*.required' => 'Notez chaque critère.',
            'scores.*.between' => 'Chaque critère se note de 1 à 5.',
        ]);

        // Les critères sont recopiés : la grille peut changer ensuite.
        $review = array_map(
            fn (string $criterion, mixed $score) => ['criterion' => $criterion, 'score' => (int) $score],
            $criteria,
            array_values($validated['scores']),
        );
        $score = (int) round(collect($review)->avg('score') * 20);

        $application->update([
            'dg_review' => $review,
            'dg_score' => $score,
            'dg_comment' => filled($validated['comment'] ?? null) ? trim($validated['comment']) : null,
            'dg_reviewed_by_id' => $request->user()->id,
            'dg_reviewed_at' => now(),
        ]);
        $application->record(ApplicationEventType::DgReviewed, ['score' => $score], $request->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => "Appréciation DG enregistrée : {$score} / 100."]);

        return back();
    }
}
