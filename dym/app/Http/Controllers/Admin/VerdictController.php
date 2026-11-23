<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ApplicationEventType;
use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\RecruitmentSetting;
use App\Recruitment\Exceptions\PermanentAnalysisError;
use App\Recruitment\Exceptions\TransientAnalysisError;
use App\Recruitment\HiringAdvisor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Hiring advice of the AI, asked once the managing director has scored the
 * candidate, and again whenever a score changes.
 */
class VerdictController extends Controller
{
    public function store(Request $request, JobApplication $application, HiringAdvisor $advisor): RedirectResponse
    {
        if ($application->dg_score === null) {
            return $this->toast('error', 'Enregistrez d’abord l’appréciation DG.');
        }

        if (function_exists('set_time_limit')) {
            @set_time_limit((int) config('recruitment.timeout') + 60);
        }

        $application->loadMissing(['jobOffer', 'latestCompletedAnalysis', 'psychotest']);

        try {
            $advice = $advisor->advise($application, RecruitmentSetting::weights());
        } catch (PermanentAnalysisError|TransientAnalysisError $e) {
            return $this->toast('error', 'Avis de l’IA indisponible : '.$e->getMessage());
        }

        $application->update([
            'verdict' => $advice['verdict'],
            'verdict_comment' => $advice['comment'],
            'verdict_at' => now(),
        ]);
        $application->record(ApplicationEventType::Verdict, ['verdict' => $advice['verdict']->value, 'label' => $advice['verdict']->label()], $request->user());

        return $this->toast('success', 'Avis de l’IA : '.$advice['verdict']->label().'.');
    }

    private function toast(string $type, string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => $type, 'message' => $message]);

        return back();
    }
}
