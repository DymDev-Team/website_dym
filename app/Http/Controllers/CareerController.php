<?php

namespace App\Http\Controllers;

use App\Enums\ApplicationStatus;
use App\Http\Requests\StoreJobApplicationRequest;
use App\Models\Activity;
use App\Models\JobApplication;
use App\Models\JobOffer;
use App\Models\Setting;
use App\Notifications\NewJobApplication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Notification;
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
     * Store an application and notify the company.
     */
    public function apply(StoreJobApplicationRequest $request): RedirectResponse
    {
        $offer = $request->filled('job_offer_id') ? JobOffer::query()->find($request->integer('job_offer_id')) : null;

        if ($offer && ! $offer->isOpen()) {
            return back()->withErrors(['job_offer_id' => 'Cette offre n’est plus ouverte aux candidatures.']);
        }

        $cv = $request->file('cv');

        $application = JobApplication::query()->create([
            ...$request->safe()->only(['name', 'email', 'phone', 'message']),
            'job_offer_id' => $offer?->id,
            'cv_path' => $cv->store('applications', JobApplication::CV_DISK),
            'cv_name' => $cv->getClientOriginalName(),
            'status' => ApplicationStatus::New,
        ]);

        $this->notify($application);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Candidature envoyée. Merci !']);

        return back();
    }

    /**
     * Send the notification without failing the application if the mailer is down.
     */
    private function notify(JobApplication $application): void
    {
        $email = Setting::values()['email'];

        if (blank($email)) {
            return;
        }

        try {
            Notification::route('mail', $email)->notify(new NewJobApplication($application));
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
