<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\StoresUploads;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveProjectRequest;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    use StoresUploads;

    /**
     * Display the list of projects.
     */
    public function index(): Response
    {
        return Inertia::render('admin/projects/index', [
            'projects' => Project::query()->ordered()->get(),
        ]);
    }

    /**
     * Show the creation form.
     */
    public function create(): Response
    {
        return Inertia::render('admin/projects/form', [
            'project' => null,
            'nextPosition' => (int) Project::query()->max('position') + 1,
        ]);
    }

    /**
     * Store a new project.
     */
    public function store(SaveProjectRequest $request): RedirectResponse
    {
        Project::query()->create([
            ...$request->safe()->except(['image', 'image_media']),
            'position' => $request->integer('position', (int) Project::query()->max('position') + 1),
            'image' => $this->storeUpload($request, 'image', 'projects'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Réalisation créée.']);

        return to_route('admin.projects.index');
    }

    /**
     * Show the edit form.
     */
    public function edit(Project $project): Response
    {
        return Inertia::render('admin/projects/form', [
            'project' => $project,
        ]);
    }

    /**
     * Update the project.
     */
    public function update(SaveProjectRequest $request, Project $project): RedirectResponse
    {
        $project->update([
            ...$request->safe()->except(['image', 'image_media']),
            'position' => $request->integer('position', $project->position),
            'image' => $this->storeUpload($request, 'image', 'projects', $project->image),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Réalisation mise à jour.']);

        return to_route('admin.projects.index');
    }

    /**
     * Delete the project.
     */
    public function destroy(Project $project): RedirectResponse
    {
        $project->delete();
        $this->deleteUpload($project->image);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Réalisation supprimée.']);

        return to_route('admin.projects.index');
    }
}
