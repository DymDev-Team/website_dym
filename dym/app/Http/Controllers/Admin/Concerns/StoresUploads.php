<?php

namespace App\Http\Controllers\Admin\Concerns;

use App\Support\MediaLibrary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait StoresUploads
{
    /**
     * Store the uploaded file of a field on the public disk, or use the
     * image picked in the media library (« {field}_media »).
     *
     * Returns the current path untouched when nothing was chosen, and
     * removes the replaced file when nothing else uses it.
     */
    protected function storeUpload(Request $request, string $field, string $directory, ?string $current = null): ?string
    {
        if ($request->hasFile($field)) {
            $path = $request->file($field)->store($directory, 'public') ?: $current;
        } elseif ($request->filled("{$field}_media") && MediaLibrary::exists($request->string("{$field}_media")->toString())) {
            $path = $request->string("{$field}_media")->toString();
        } else {
            return $current;
        }

        if ($path !== $current) {
            // La fiche en cours de modification référence encore l'ancien fichier.
            $this->deleteUpload($current, allowedUses: 1);
        }

        return $path;
    }

    /**
     * Delete a previously uploaded file (files shipped in public/ are kept),
     * unless it is still used elsewhere: the media library lets the same
     * image be picked by several items.
     */
    protected function deleteUpload(?string $path, int $allowedUses = 0): void
    {
        if (blank($path) || Str::startsWith($path, ['/', 'http://', 'https://'])) {
            return;
        }

        if (MediaLibrary::usageCount($path) > $allowedUses) {
            return;
        }

        Storage::disk('public')->delete($path);
    }
}
