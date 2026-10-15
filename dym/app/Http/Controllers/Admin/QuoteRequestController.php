<?php

namespace App\Http\Controllers\Admin;

use App\Enums\QuoteStatus;
use App\Http\Controllers\Controller;
use App\Models\QuoteRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class QuoteRequestController extends Controller
{
    /**
     * Display the quote requests, newest first.
     */
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::enum(QuoteStatus::class)],
        ]);

        return Inertia::render('admin/quotes/index', [
            'quotes' => QuoteRequest::query()
                ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
                ->latest()
                ->paginate(20)
                ->withQueryString(),
            'statuses' => QuoteStatus::options(),
            'filters' => [
                'status' => $filters['status'] ?? '',
            ],
        ]);
    }

    /**
     * Show a quote request; opening a new one marks it as being studied.
     */
    public function show(QuoteRequest $quote): Response
    {
        if ($quote->status === QuoteStatus::New) {
            $quote->update(['status' => QuoteStatus::InProgress]);
        }

        return Inertia::render('admin/quotes/show', [
            'quote' => $quote,
            'statuses' => QuoteStatus::options(),
        ]);
    }

    /**
     * Change the status of a quote request.
     */
    public function update(Request $request, QuoteRequest $quote): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(QuoteStatus::class)],
        ]);

        $quote->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Statut mis à jour.']);

        return back();
    }

    /**
     * Download the attachment (plans, photos) sent with the request.
     */
    public function attachment(QuoteRequest $quote): StreamedResponse
    {
        abort_if($quote->attachment_path === null, 404);

        return Storage::disk(QuoteRequest::ATTACHMENT_DISK)->download($quote->attachment_path, $quote->attachment_name);
    }

    /**
     * Delete a quote request and its attachment.
     */
    public function destroy(QuoteRequest $quote): RedirectResponse
    {
        $quote->delete();

        if ($quote->attachment_path !== null) {
            Storage::disk(QuoteRequest::ATTACHMENT_DISK)->delete($quote->attachment_path);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Demande supprimée.']);

        return to_route('admin.quotes.index');
    }
}
