<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApplicationAnalysis;
use App\Recruitment\AnalysisRunner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Lets the open admin pages drive the analyses one by one, each request
 * staying well within the PHP execution time limit.
 */
class AnalysisQueueController extends Controller
{
    public function __construct(private AnalysisRunner $runner) {}

    /**
     * Run one waiting analysis (the given one first) and report what is left.
     */
    public function next(Request $request): JsonResponse
    {
        $request->validate(['analysis_id' => ['nullable', 'integer']]);

        $preferred = $request->filled('analysis_id')
            ? ApplicationAnalysis::query()->find($request->integer('analysis_id'))
            : null;

        $analysis = $this->runner->runNext($preferred);

        return response()->json([
            'processed' => $analysis === null ? null : [
                'id' => $analysis->id,
                'status' => $analysis->status->value,
                'error' => $analysis->error,
            ],
            'remaining' => $this->runner->remaining(),
            'active' => $this->runner->active(),
            'blocked' => $this->runner->blockedReason(),
        ]);
    }

    /**
     * Queue the CVs that were never analysed; the pipeline then runs them.
     */
    public function missing(Request $request): RedirectResponse
    {
        if ($reason = $this->runner->blockedReason()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $reason]);

            return back();
        }

        $count = $this->runner->requestMissing($request->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => $count === 0
            ? 'Tous les CV sont déjà analysés.'
            : "{$count} CV mis en analyse. Gardez le pipeline ouvert pendant le traitement."]);

        return back();
    }
}
