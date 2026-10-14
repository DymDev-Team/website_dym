<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ApplicationStatus;
use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\JobOffer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class JobApplicationController extends Controller
{
    /**
     * Display the applications, newest first.
     */
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::enum(ApplicationStatus::class)],
            'offer' => ['nullable', 'string'],
        ]);

        $offerFilter = $filters['offer'] ?? null;

        return Inertia::render('admin/applications/index', [
            'applications' => JobApplication::query()
                ->with('jobOffer:id,title,slug')
                ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
                ->when($offerFilter === 'spontaneous', fn ($query) => $query->whereNull('job_offer_id'))
                ->when(is_numeric($offerFilter), fn ($query) => $query->where('job_offer_id', $offerFilter))
                ->latest()
                ->paginate(20)
                ->withQueryString(),
            'offers' => JobOffer::query()->latest()->get(['id', 'title']),
            'statuses' => ApplicationStatus::options(),
            'filters' => [
                'status' => $filters['status'] ?? '',
                'offer' => $offerFilter ?? '',
            ],
        ]);
    }

    /**
     * Show an application; opening a new one marks it as being reviewed.
     */
    public function show(JobApplication $application): Response
    {
        if ($application->status === ApplicationStatus::New) {
            $application->update(['status' => ApplicationStatus::Reviewing]);
        }

        return Inertia::render('admin/applications/show', [
            'application' => $application->load('jobOffer:id,title,slug'),
            'statuses' => ApplicationStatus::options(),
        ]);
    }

    /**
     * Change the status of an application.
     */
    public function update(Request $request, JobApplication $application): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(ApplicationStatus::class)],
        ]);

        $application->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Statut mis à jour.']);

        return back();
    }

    /**
     * Download the candidate's CV.
     */
    public function cv(JobApplication $application): StreamedResponse
    {
        return Storage::disk(JobApplication::CV_DISK)->download($application->cv_path, $application->cv_name);
    }

    /**
     * Delete an application and its CV.
     */
    public function destroy(JobApplication $application): RedirectResponse
    {
        $application->delete();
        Storage::disk(JobApplication::CV_DISK)->delete($application->cv_path);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Candidature supprimée.']);

        return to_route('admin.applications.index');
    }
}
