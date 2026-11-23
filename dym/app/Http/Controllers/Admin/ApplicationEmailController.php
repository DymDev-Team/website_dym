<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ApplicationEventType;
use App\Http\Controllers\Controller;
use App\Models\ApplicationEvent;
use App\Models\JobApplication;
use App\Models\RecruitmentSetting;
use App\Models\RecruitmentStage;
use App\Models\Setting;
use App\Notifications\CandidateMessage;
use App\Recruitment\CandidateMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Throwable;

/**
 * E-mails to a candidate from the pipeline: always prepared, read and sent
 * by someone of the team, never automatically.
 */
class ApplicationEmailController extends Controller
{
    /**
     * Text without a stage model: greeting and signature around a blank.
     */
    private const BLANK = "Bonjour {nom},\n\n\n\nCordialement,\nL’équipe DYM Manufacture";

    /**
     * Draft of the e-mail of a stage, or of a free message, with the date it
     * was last sent to this candidate.
     */
    public function draft(Request $request, JobApplication $application): JsonResponse
    {
        $stage = $this->stage($request->validate([
            'stage_id' => ['nullable', 'integer', Rule::exists(RecruitmentStage::class, 'id')],
        ])['stage_id'] ?? null);

        $application->loadMissing(['candidate', 'jobOffer']);
        $fill = fn (string $text) => CandidateMail::fill($text, $application->candidate->name, $application->jobOffer?->title);
        $template = $stage?->hasEmail() === true;

        return response()->json([
            'name' => $application->candidate->display_name,
            'to' => $application->candidate->email,
            'reply_to' => RecruitmentSetting::values()['acknowledgment_reply_to'] ?: Setting::values()['email'],
            'stage' => $template ? $stage->name : null,
            'subject' => $template ? $fill((string) $stage->email_subject) : '',
            'body' => $fill($template ? (string) $stage->email_body : self::BLANK),
            'sent_at' => $template ? $this->lastSent($application, $stage)?->created_at : null,
        ]);
    }

    /**
     * Send the e-mail as written by the team and keep it in the history.
     */
    public function send(Request $request, JobApplication $application): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:150'],
            'body' => ['required', 'string', 'max:5000'],
            'stage_id' => ['nullable', 'integer', Rule::exists(RecruitmentStage::class, 'id')],
        ], [
            'subject.required' => 'Indiquez l’objet de l’e-mail.',
            'body.required' => 'Indiquez le texte de l’e-mail.',
        ]);

        $application->loadMissing(['candidate', 'jobOffer']);
        $email = $application->candidate->email;

        if (blank($email)) {
            throw ValidationException::withMessages(['to' => 'Ce candidat n’a pas d’adresse e-mail : complétez sa fiche.']);
        }

        // {nom} et {poste} restent utilisables dans un message libre.
        $fill = fn (string $text) => CandidateMail::fill(trim($text), $application->candidate->name, $application->jobOffer?->title);
        $subject = $fill($validated['subject']);
        $body = $fill($validated['body']);
        $stage = $this->stage($validated['stage_id'] ?? null);

        try {
            Notification::route('mail', $email)->notify(new CandidateMessage($subject, $body));
        } catch (Throwable $e) {
            report($e);

            // Erreur de validation : la fenêtre reste ouverte avec le texte écrit.
            throw ValidationException::withMessages(['send' => 'L’envoi a échoué : '.Str::limit($e->getMessage(), 300)]);
        }

        $application->record(ApplicationEventType::EmailSent, [
            'to' => $email,
            'subject' => $subject,
            'body' => $body,
            'stage_id' => $stage?->id,
            'stage' => $stage?->name,
        ], $request->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => "E-mail envoyé à {$email}."]);

        return back();
    }

    private function stage(int|string|null $id): ?RecruitmentStage
    {
        return $id === null ? null : RecruitmentStage::query()->whereKey($id)->first();
    }

    private function lastSent(JobApplication $application, RecruitmentStage $stage): ?ApplicationEvent
    {
        return $application->events()
            ->where('type', ApplicationEventType::EmailSent)
            ->latest()
            ->latest('id')
            ->get()
            ->first(fn (ApplicationEvent $event) => ($event->data['stage_id'] ?? null) === $stage->id);
    }
}
