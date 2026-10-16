<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Show the site details form.
     */
    public function edit(): Response
    {
        return Inertia::render('admin/settings', [
            'settings' => Setting::values(),
        ]);
    }

    /**
     * Update the site details.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tagline' => ['nullable', 'string', 'max:300'],
            'phone' => ['nullable', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
            'facebook_url' => ['nullable', 'url', 'max:255'],
            'whatsapp_url' => ['nullable', 'url', 'max:255'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'youtube_url' => ['nullable', 'url', 'max:255'],
        ]);

        Setting::store($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Paramètres enregistrés.']);

        return to_route('admin.settings.edit');
    }
}
