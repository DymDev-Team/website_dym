<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ApplicationEventType;
use App\Enums\StageKind;
use App\Enums\StageRole;
use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\Psychotest;
use App\Models\RecruitmentSetting;
use App\Models\RecruitmentStage;
use App\Notifications\CandidateMessage;
use App\Recruitment\Exceptions\PermanentAnalysisError;
use App\Recruitment\Exceptions\TransientAnalysisError;
use App\Recruitment\PsychotestDesigner;
use App\Recruitment\PsychotestInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Throwable;

/**
 * Psychotechnical test of an application: prepared with the AI, reviewed by
 * the team, then sent to the candidate, who answers on a private page.
 */
class PsychotestController extends Controller
{
    public function __construct(private PsychotestDesigner $designer) {}

    /**
     * Draft test: the base of the offer, written once and shared by its
     * candidates, plus new questions drawn from this candidate's analysis.
     */
    public function prepare(Request $request, JobApplication $application): RedirectResponse
    {
        $application->loadMissing(['jobOffer', 'candidate.jobFamily', 'latestCompletedAnalysis', 'psychotest']);

        if ($application->psychotest?->sent_at !== null) {
            return $this->toast('error', 'Ce test a déjà été envoyé : supprimez-le pour en préparer un autre.');
        }

        if (function_exists('set_time_limit')) {
            @set_time_limit((int) config('recruitment.timeout') * 2 + 60);
        }

        try {
            $offer = $application->jobOffer;
            $base = $offer?->psychotest_questions;

            if (blank($base) || $request->boolean('refresh_base')) {
                $base = $this->designer->forOffer($offer, $application->candidate->jobFamily?->label);
                $offer?->update(['psychotest_questions' => $base]);
            }

            // Tirage dans la réserve du poste, réponses et ordre mélangés pour
            // ce candidat ; chaque question a son propre identifiant ici.
            $drawn = collect($base)->shuffle()->take(PsychotestDesigner::OFFER_DRAWN)
                ->map(fn (array $question) => [...PsychotestDesigner::withShuffledOptions($question), 'id' => PsychotestDesigner::newId()]);
            $questions = $drawn->concat($this->designer->forCandidate($application))->shuffle()->values()->all();
        } catch (PermanentAnalysisError|TransientAnalysisError $e) {
            return $this->toast('error', $e->getMessage());
        }

        $seconds = RecruitmentSetting::values()['psychotest_question_seconds'];

        Psychotest::query()->updateOrCreate(['job_application_id' => $application->id], [
            'token' => $application->psychotest->token ?? Psychotest::newToken(),
            'questions' => $questions,
            'question_seconds' => $seconds,
            'duration_minutes' => (int) ceil(count($questions) * $seconds / 60),
        ]);

        return $this->toast('success', count($questions).' questions préparées : relisez-les avant d’envoyer le test.');
    }

    /**
     * Questions reviewed by the team, before the test is sent.
     */
    public function update(Request $request, JobApplication $application): RedirectResponse
    {
        $test = $this->draft($application);

        $validated = $request->validate([
            'questions' => ['required', 'array', 'min:1', 'max:40'],
            'questions.*.id' => ['nullable', 'string', 'max:20'],
            'questions.*.text' => ['required', 'string', 'max:600'],
            'questions.*.options' => ['required', 'array', 'size:4'],
            'questions.*.options.*' => ['required', 'string', 'max:200', 'distinct'],
            'questions.*.answer' => ['required', 'integer', 'between:0,3'],
            'questions.*.category' => ['nullable', 'string', 'max:60'],
            'questions.*.source' => ['nullable', Rule::in(['offer', 'candidate', 'manual'])],
        ], [
            'questions.required' => 'Le test doit contenir au moins une question.',
            'questions.*.text.required' => 'Chaque question doit avoir un énoncé.',
            'questions.*.options.*.required' => 'Chaque question doit avoir 4 réponses.',
            'questions.*.options.*.distinct' => 'Les 4 réponses d’une question doivent être différentes.',
        ]);

        $test->update([
            'questions' => array_values(array_map(fn (array $question) => [
                'id' => filled($question['id'] ?? null) ? $question['id'] : PsychotestDesigner::newId(),
                'text' => trim($question['text']),
                'options' => array_values(array_map(fn ($option) => trim((string) $option), $question['options'])),
                'answer' => (int) $question['answer'],
                'category' => trim((string) ($question['category'] ?? '')),
                'source' => $question['source'] ?? 'manual',
            ], $validated['questions'])),
            'duration_minutes' => (int) ceil(count($validated['questions']) * $test->question_seconds / 60),
        ]);

        return $this->toast('success', 'Questions du test enregistrées.');
    }

    /**
     * Open the test to the candidate. WhatsApp is opened by the browser with
     * the written message; by e-mail the server sends it.
     */
    public function send(Request $request, JobApplication $application): RedirectResponse
    {
        $channel = $request->validate([
            'channel' => ['required', Rule::in(['whatsapp', 'email', 'link'])],
        ])['channel'];

        $application->loadMissing(['candidate', 'jobOffer', 'stage', 'psychotest']);
        $test = $application->psychotest;

        if ($test === null || $test->completed_at !== null) {
            throw ValidationException::withMessages(['psychotest' => 'Préparez d’abord le test.']);
        }

        if ($channel === 'email' && blank($application->candidate->email)) {
            throw ValidationException::withMessages(['psychotest' => 'Ce candidat n’a pas d’adresse e-mail.']);
        }

        // Un nouvel envoi garde le délai du premier.
        if ($test->sent_at === null) {
            $test->update([
                'sent_at' => now(),
                'expires_at' => now()->addDays(RecruitmentSetting::values()['psychotest_validity_days']),
            ]);
        }

        if ($channel === 'email') {
            try {
                Notification::route('mail', $application->candidate->email)
                    ->notify(new CandidateMessage(PsychotestInvitation::SUBJECT, PsychotestInvitation::text($test)));
            } catch (Throwable $e) {
                report($e);

                return $this->toast('error', 'L’envoi a échoué : '.Str::limit($e->getMessage(), 300));
            }
        }

        $application->record(ApplicationEventType::PsychotestSent, ['channel' => $channel], $request->user());
        $this->moveToTestStage($application, $request);

        return $this->toast('success', match ($channel) {
            'whatsapp' => 'Test ouvert au candidat : envoyez le message préparé dans WhatsApp.',
            'email' => "Test envoyé à {$application->candidate->email}.",
            default => 'Test ouvert au candidat : transmettez-lui le lien.',
        });
    }

    /**
     * Remove the test, to prepare another one.
     */
    public function destroy(JobApplication $application): RedirectResponse
    {
        $application->psychotest()->delete();
        $application->update(['test_score' => null]);

        return $this->toast('success', 'Test supprimé.');
    }

    private function draft(JobApplication $application): Psychotest
    {
        $test = $application->psychotest;

        if ($test === null) {
            throw ValidationException::withMessages(['psychotest' => 'Préparez d’abord le test.']);
        }

        if ($test->started_at !== null) {
            throw ValidationException::withMessages(['psychotest' => 'Le candidat a commencé le test : ses questions ne peuvent plus changer.']);
        }

        return $test;
    }

    /**
     * A candidate still in an earlier open stage joins the test column.
     */
    private function moveToTestStage(JobApplication $application, Request $request): void
    {
        $stage = RecruitmentStage::withRole(StageRole::Psychotest);
        $current = $application->stage;

        if ($stage === null || $current->is($stage) || $current->kind !== StageKind::Open || $current->position > $stage->position) {
            return;
        }

        $application->update(['stage_id' => $stage->id]);
        $application->record(ApplicationEventType::StageChanged, ['from' => $current->name, 'to' => $stage->name], $request->user());
    }

    private function toast(string $type, string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => $type, 'message' => $message]);

        return back();
    }
}
