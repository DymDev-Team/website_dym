<?php

namespace App\Http\Controllers;

use App\Enums\ApplicationEventType;
use App\Models\Psychotest;
use App\Recruitment\CandidateMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Page where the candidate takes the test, reached by the personal link.
 * The candidate sees the questions only: never the right answers nor the
 * score, which is computed here.
 */
class PsychotestController extends Controller
{
    public function show(string $token): Response
    {
        $test = $this->find($token);
        $application = $test->application;
        $status = $test->status();

        return Inertia::render('test-psychotechnique', [
            'token' => $token,
            'status' => $status,
            'greeting' => CandidateMail::fill('{nom}', $application->candidate->name, null),
            'offer' => $application->jobOffer?->title,
            'count' => count($test->questions),
            'duration' => $test->duration_minutes,
            'expires_at' => $test->expires_at,
            'seconds_left' => $test->secondsLeft(),
            'questions' => $status === 'started' ? $test->publicQuestions() : [],
        ]);
    }

    public function start(string $token): RedirectResponse
    {
        $test = $this->find($token);

        if ($test->status() === 'sent') {
            $test->update(['started_at' => now()]);
        }

        return back();
    }

    /**
     * Answers sent by the candidate, or by the page when time runs out.
     */
    public function submit(Request $request, string $token): RedirectResponse
    {
        $test = $this->find($token);

        // Délai dépassé : la page affiche l'état du test, rien n'est enregistré.
        if ($test->status() !== 'started') {
            return back();
        }

        $ids = array_column($test->questions, 'id');
        $given = $request->validate([
            'answers' => ['nullable', 'array'],
            'answers.*' => ['nullable', 'integer', 'between:0,3'],
        ])['answers'] ?? [];

        $answers = [];
        foreach ($ids as $id) {
            $answers[$id] = isset($given[$id]) ? (int) $given[$id] : null;
        }

        $score = $test->grade($answers);

        DB::transaction(function () use ($test, $answers, $score) {
            $test->update(['answers' => $answers, 'score' => $score, 'completed_at' => now()]);
            $test->application->update(['test_score' => $score]);
            $test->application->record(ApplicationEventType::PsychotestCompleted, [
                'score' => $score,
                'minutes' => (int) ceil($test->started_at->diffInSeconds(now()) / 60),
            ]);
        });

        return back();
    }

    private function find(string $token): Psychotest
    {
        return Psychotest::query()
            ->where('token', $token)
            ->whereNotNull('sent_at')
            ->with(['application.candidate', 'application.jobOffer'])
            ->firstOrFail();
    }
}
