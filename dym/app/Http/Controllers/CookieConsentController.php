<?php

namespace App\Http\Controllers;

use App\Models\CookieConsent;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CookieConsentController extends Controller
{
    /**
     * Record a visitor's cookie choices (proof of consent).
     */
    public function store(Request $request): Response
    {
        $validated = $request->validate([
            'consent_id' => ['required', 'uuid'],
            'analytics' => ['required', 'boolean'],
            'marketing' => ['required', 'boolean'],
        ]);

        CookieConsent::query()->create([
            ...$validated,
            'policy_version' => CookieConsent::POLICY_VERSION,
        ]);

        return response()->noContent();
    }
}
