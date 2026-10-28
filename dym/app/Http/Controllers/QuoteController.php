<?php

namespace App\Http\Controllers;

use App\Enums\QuoteStatus;
use App\Http\Requests\StoreQuoteRequest;
use App\Models\Activity;
use App\Models\QuoteRequest;
use App\Models\Setting;
use App\Notifications\NewQuoteRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class QuoteController extends Controller
{
    /**
     * Quote request page; ?activite=… preselects the activity.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('devis', [
            'preset' => $request->string('activite')->limit(120, '')->toString() ?: null,
            'activities' => Activity::query()->published()->ordered()->get(['id', 'title', 'image']),
            'site' => Setting::values(),
        ]);
    }

    /**
     * Store a quote request and notify the company.
     */
    public function store(StoreQuoteRequest $request): RedirectResponse
    {
        $attachment = $request->file('attachment');

        $quote = QuoteRequest::query()->create([
            ...$request->safe()->only(['name', 'company', 'email', 'phone', 'activity', 'message', 'deadline']),
            'attachment_path' => $attachment?->store('quotes', QuoteRequest::ATTACHMENT_DISK),
            'attachment_name' => $attachment?->getClientOriginalName(),
            'status' => QuoteStatus::New,
        ]);

        $this->notify($quote);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Demande envoyée. Merci !']);

        return back();
    }

    /**
     * Send the notification to the quote mailbox (info@dym.ci when left blank)
     * without failing the request if the mailer is down.
     */
    private function notify(QuoteRequest $quote): void
    {
        $email = Setting::values(withPrivate: true)['quote_email'] ?: Setting::DEFAULTS['quote_email'];

        try {
            Notification::route('mail', $email)->notify(new NewQuoteRequest($quote));
        } catch (Throwable $e) {
            report($e);
        }
    }
}
