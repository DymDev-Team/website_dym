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
        'logo_path' => '/images/logo-dym-couleur.svg',
        'section_color_header' => '#ffffff',
        'section_color_hero' => '#ffffff',
        'section_color_intro' => '#ffffff',
        'section_color_activities' => '#141414',
        'section_color_projects' => '#141414',
        'section_color_equipment' => '#ffffff',
        'section_color_process' => '#ffffff',
        'section_color_testimonials' => '#ffffff',
        'section_color_news' => '#141414',
        'section_color_partners' => '#ffffff',
        'section_color_footer' => '#ffffff',
    ];

    protected $primaryKey = 'key';

    protected $keyType = 'string';

    public $incrementing = false;

    /**
     * Every setting, defaults included.
     *
     * @return array<string, mixed>
     */
    public static function values(): array
    {
        // Only stored rows are cached, so changing a default in code applies at once.
        $stored = Cache::rememberForever(self::CACHE_KEY, fn () => static::query()->pluck('value', 'key')->all());

        $values = [...self::DEFAULTS, ...array_intersect_key($stored, self::DEFAULTS)];
        $path = $values['logo_path'];
        $values['logo_url'] = filled($path)
            ? (str_starts_with($path, '/') || str_starts_with($path, 'http') ? $path : Cache::rememberForever("site-logo-url:{$path}", fn () => \Illuminate\Support\Facades\Storage::disk('public')->url($path)))
            : null;
        $values['section_colors'] = collect(self::DEFAULTS)
            ->filter(fn ($value, $key) => str_starts_with($key, 'section_color_'))
            ->mapWithKeys(fn ($value, $key) => [substr($key, 14) => $values[$key]])
            ->all();

        return $values;
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
