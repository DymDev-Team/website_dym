<?php

namespace App\Concerns;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait HasMediaUrls
{
    /**
     * Resolve a stored media path to a public URL.
     *
     * Paths starting with "/" or "http" point at files shipped in public/
     * (initial content); anything else was uploaded to the public disk.
     */
    protected function mediaUrl(?string $path): ?string
    {
        if (blank($path)) {
            return null;
        }

        if (Str::startsWith($path, ['/', 'http://', 'https://'])) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }
}
