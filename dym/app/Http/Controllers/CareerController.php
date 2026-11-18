<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreJobApplicationRequest;
use App\Models\Activity;
use App\Models\JobOffer;
use App\Models\RecruitmentSetting;
use App\Models\Setting;
use App\Notifications\ApplicationReceived;
use App\Notifications\NewJobApplication;
use App\Recruitment\ApplicationIntake;
use Illuminate\Http\RedirectResponse;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Notification as NotificationFacade;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class CareerController extends Controller
{
    /**
     * Careers page: open positions and spontaneous application form.
     */
    public function index(): Response
    {
        return Inertia::render('carriere', [
            'offers' => JobOffer::query()->open()->latest()->get(),
            ...$this->layoutProps(),
        ]);
    }

    /**
     * Details of an open position with its application form.
     */
    public function show(JobOffer $jobOffer): Response
    {
        abort_unless($jobOffer->isOpen(), 404);

        return Inertia::render('offre', [
            'offer' => $jobOffer,
            ...$this->layoutProps(),
        ]);
    }

    /**
     * Store an application, start its analysis, notify the company and
     * acknowledge receipt to the candidate.
     */
    public function apply(StoreJobApplicationRequest $request, ApplicationIntake $intake): RedirectResponse
    {
        $offer = $request->filled('job_offer_id') ? JobOffer::query()->find($request->integer('job_offer_id')) : null;

        if ($offer && ! $offer->isOpen()) {
            return back()->withErrors(['job_offer_id' => 'Cette offre n’est plus ouverte aux candidatures.']);
        }

        $application = $intake->fromWebsite(
            identity: $request->safe()->only(['name', 'email', 'phone']),
            offer: $offer,
            message: $request->validated('message'),
            cv: $request->file('cv'),
            answers: $request->answers(),
        );

        // Après la réponse : le candidat n'attend pas le serveur d'envoi.
        defer(function () use ($application) {
            $this->send(Setting::values()['email'], new NewJobApplication($application));

            if (RecruitmentSetting::values()['acknowledgment_enabled']) {
                $this->send($application->candidate->email, ApplicationReceived::for($application));
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Candidature envoyée. Merci !']);

        return back();
    }

    /**
     * Send an e-mail without failing the application if the mailer is down.
     */
    private function send(?string $email, Notification $notification): void
    {
        if (blank($email)) {
            return;
        }

        try {
            NotificationFacade::route('mail', $email)->notify($notification);
        } catch (Throwable $e) {
            report($e);
        }
    }

    /**
     * Data shared by the public header and footer.
     *
     * @return array<string, mixed>
     */
    private function layoutProps(): array
    {
        return [
            'activities' => Activity::query()->published()->ordered()->get(['id', 'title', 'image']),
            'site' => Setting::values(),
        ];
    }
}
