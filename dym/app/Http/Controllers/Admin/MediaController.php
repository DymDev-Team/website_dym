<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\MediaLibrary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    /**
     * Media library page: every image on the server.
     */
    public function index(): Response
    {
        return Inertia::render('admin/media', ['items' => MediaLibrary::all()]);
    }

    /**
     * Same list for the picker shown in the image fields.
     */
    public function browse(): JsonResponse
    {
        return response()->json(['items' => MediaLibrary::all()]);
    }

    /**
     * Upload one or several images.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'files' => ['required', 'array', 'max:20'],
            'files.*' => ['required', 'image', 'max:5120'],
        ]);

        foreach ($request->file('files') as $file) {
            $file->store(MediaLibrary::UPLOAD_DIRECTORY, 'public');
        }

        $count = count($request->file('files'));
        Inertia::flash('toast', ['type' => 'success', 'message' => $count > 1 ? "{$count} images ajoutées." : 'Image ajoutée.']);

        return back();
    }

    /**
     * Delete an uploaded image that nothing uses any more.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $path = $request->validate(['path' => ['required', 'string']])['path'];

        // Les images fournies avec le site font partie du code : non supprimables ici.
        if (Str::startsWith($path, ['/', 'http://', 'https://']) || ! MediaLibrary::exists($path)) {
            throw ValidationException::withMessages(['path' => 'Seules les images envoyées depuis l’administration peuvent être supprimées.']);
        }

        if (($uses = MediaLibrary::usageCount($path)) > 0) {
            throw ValidationException::withMessages(['path' => "Image utilisée à {$uses} endroit(s) : remplacez-la d’abord."]);
        }

        Storage::disk('public')->delete($path);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Image supprimée.']);

        return back();
    }
}
