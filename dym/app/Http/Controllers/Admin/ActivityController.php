<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\StoresUploads;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveActivityRequest;
use App\Models\Activity;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    use StoresUploads;

    /**
     * Display the list of activities.
     */
    public function index(): Response
    {
        return Inertia::render('admin/activities/index', [
            'activities' => Activity::query()->ordered()->get(),
        ]);
    }

    /**
     * Show the creation form.
     */
    public function create(): Response
    {
        return Inertia::render('admin/activities/form', [
            'activity' => null,
            'nextPosition' => (int) Activity::query()->max('position') + 1,
        ]);
    }

    /**
     * Store a new activity.
     */
    public function store(SaveActivityRequest $request): RedirectResponse
    {
        Activity::query()->create([
            ...$request->safe()->except('image'),
            'position' => $request->integer('position', (int) Activity::query()->max('position') + 1),
            'image' => $this->storeUpload($request, 'image', 'activities'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Activité créée.']);

        return to_route('admin.activities.index');
    }

    /**
     * Show the edit form.
     */
    public function edit(Activity $activity): Response
    {
        return Inertia::render('admin/activities/form', [
            'activity' => $activity,
        ]);
    }

    /**
     * Update the activity.
     */
    public function update(SaveActivityRequest $request, Activity $activity): RedirectResponse
    {
        $activity->update([
            ...$request->safe()->except('image'),
            'position' => $request->integer('position', $activity->position),
            'image' => $this->storeUpload($request, 'image', 'activities', $activity->image),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Activité mise à jour.']);

        return to_route('admin.activities.index');
    }

    /**
     * Delete the activity.
     */
    public function destroy(Activity $activity): RedirectResponse
    {
        $activity->delete();
        $this->deleteUpload($activity->image);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Activité supprimée.']);

        return to_route('admin.activities.index');
    }
}
