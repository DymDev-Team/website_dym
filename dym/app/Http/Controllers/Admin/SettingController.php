<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Admin\Concerns\StoresUploads;
use App\Rules\ExistingMedia;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    use StoresUploads;
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
            'logo' => ['nullable', 'image', 'max:5120'],
            'logo_media' => ['nullable', 'string', new ExistingMedia],
            'tagline' => ['nullable', 'string', 'max:300'],
            'phone' => ['nullable', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
            'facebook_url' => ['nullable', 'url', 'max:255'],
            'whatsapp_url' => ['nullable', 'url', 'max:255'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'youtube_url' => ['nullable', 'url', 'max:255'],
            ...collect(Setting::DEFAULTS)->keys()->filter(fn (string $key) => str_starts_with($key, 'section_color_'))->mapWithKeys(fn (string $key) => [$key => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/']])->all(),
        ]);

        $logoPath = $this->storeUpload($request, 'logo', 'site', Setting::values()['logo_path']);
        unset($validated['logo'], $validated['logo_media']);
        Setting::store([...$validated, 'logo_path' => $logoPath]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Paramètres enregistrés.']);

        return to_route('admin.settings.edit');
    }
}
