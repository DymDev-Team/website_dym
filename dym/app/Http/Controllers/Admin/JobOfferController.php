<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveJobOfferRequest;
use App\Models\JobOffer;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class JobOfferController extends Controller
{
    /**
     * Display the list of job offers.
     */
    public function index(): Response
    {
        return Inertia::render('admin/job-offers/index', [
            'offers' => JobOffer::query()->withCount('applications')->latest()->get(),
        ]);
    }

    /**
     * Show the creation form.
     */
    public function create(): Response
    {
        return Inertia::render('admin/job-offers/form', [
            'offer' => null,
        ]);
    }

    /**
     * Store a new job offer.
     */
    public function store(SaveJobOfferRequest $request): RedirectResponse
    {
        JobOffer::query()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Offre créée.']);

        return to_route('admin.job-offers.index');
    }

    /**
     * Show the edit form.
     */
    public function edit(JobOffer $jobOffer): Response
    {
        return Inertia::render('admin/job-offers/form', [
            'offer' => $jobOffer,
        ]);
    }

    /**
     * Update the job offer.
     */
    public function update(SaveJobOfferRequest $request, JobOffer $jobOffer): RedirectResponse
    {
        $jobOffer->update([
            ...$request->validated(),
            'slug' => $request->validated('slug') ?? JobOffer::uniqueSlug($request->validated('title'), $jobOffer->id),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Offre mise à jour.']);

        return to_route('admin.job-offers.index');
    }

    /**
     * Delete the job offer (its applications are kept as spontaneous ones).
     */
    public function destroy(JobOffer $jobOffer): RedirectResponse
    {
        $jobOffer->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Offre supprimée.']);

        return to_route('admin.job-offers.index');
    }
}
