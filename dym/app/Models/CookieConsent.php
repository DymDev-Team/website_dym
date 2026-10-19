<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['consent_id', 'analytics', 'marketing', 'policy_version'])]
class CookieConsent extends Model
{
    /**
     * Version de la politique cookies : à incrémenter quand les catégories
     * changent, pour redemander le consentement (voir cookie-consent.tsx).
     */
    public const POLICY_VERSION = '1';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'analytics' => 'boolean',
            'marketing' => 'boolean',
        ];
    }
}
