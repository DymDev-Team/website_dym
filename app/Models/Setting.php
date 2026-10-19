<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

/**
 * Key/value store for the editable site details (contact, social links...).
 *
 * @property string $key
 * @property string|null $value
 */
#[Fillable(['key', 'value'])]
class Setting extends Model
{
    public const CACHE_KEY = 'site-settings';

    /**
     * Editable keys with their default value.
     *
     * @var array<string, string|null>
     */
    public const DEFAULTS = [
        'tagline' => 'Conception, usinage et fabrication métallique sur mesure pour les entreprises et les particuliers.',
        'phone' => '+225 07 89 30 30 00',
        'email' => 'info@dym.ci',
        'address' => 'Abidjan, CHU Angré — 28 BP 1061 Abidjan 28',
        'linkedin_url' => null,
        'facebook_url' => null,
        // Numéro DYM : le bouton WhatsApp du hero et du pied de page fonctionne d'emblée.
        'whatsapp_url' => 'https://wa.me/2250789303000',
        'instagram_url' => null,
        'youtube_url' => null,
    ];

    protected $primaryKey = 'key';

    protected $keyType = 'string';

    public $incrementing = false;

    /**
     * Every setting, defaults included.
     *
     * @return array<string, string|null>
     */
    public static function values(): array
    {
        // Only stored rows are cached, so changing a default in code applies at once.
        $stored = Cache::rememberForever(self::CACHE_KEY, fn () => static::query()->pluck('value', 'key')->all());

        return [...self::DEFAULTS, ...array_intersect_key($stored, self::DEFAULTS)];
    }

    /**
     * Persist several settings at once.
     *
     * @param  array<string, string|null>  $values
     */
    public static function store(array $values): void
    {
        foreach (array_intersect_key($values, self::DEFAULTS) as $key => $value) {
            static::query()->updateOrCreate(['key' => $key], ['value' => $value]);
        }

        Cache::forget(self::CACHE_KEY);
    }
}
