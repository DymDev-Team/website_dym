<?php

namespace App\Http\Controllers\Admin\Concerns;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait StoresUploads
{
    /**
     * Store the uploaded file of a field on the public disk.
     *
     * Returns the current path untouched when nothing was uploaded, and
     * removes the replaced file otherwise.
     */
    protected function storeUpload(Request $request, string $field, string $directory, ?string $current = null): ?string
    {
        if (! $request->hasFile($field)) {
            return $current;
        }

        $path = $request->file($field)->store($directory, 'public');

        $this->deleteUpload($current);

        return $path ?: $current;
    }

    /**
     * Delete a previously uploaded file (files shipped in public/ are kept).
     */
    protected function deleteUpload(?string $path): void
    {
        if (blank($path) || Str::startsWith($path, ['/', 'http://', 'https://'])) {
            return;
        }

        Storage::disk('public')->delete($path);
    }
}
