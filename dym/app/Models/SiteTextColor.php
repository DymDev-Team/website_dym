<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

/**
 * Couleur personnalisée d'un texte du site (clé de config/site-texts.php).
 *
 * @property string $key
 * @property string $color
 */
#[Fillable(['key', 'color'])]
class SiteTextColor extends Model
{
    public const CACHE_KEY = 'site-text-colors';

    protected $primaryKey = 'key';

    protected $keyType = 'string';

    public $incrementing = false;

    /**
     * Custom colors keyed by text key ("#rrggbb"), only for known texts.
     *
     * @return array<string, string>
     */
    public static function values(): array
    {
        $stored = Cache::rememberForever(self::CACHE_KEY, fn () => static::query()->pluck('color', 'key')->all());

        return array_intersect_key($stored, SiteText::defaults());
    }

    /**
     * Save the given colors; a blank color restores the design's color.
     *
     * @param  array<string, string|null>  $colors
     */
    public static function store(array $colors): void
    {
        foreach (array_intersect_key($colors, SiteText::defaults()) as $key => $color) {
            if (blank($color)) {
                static::query()->whereKey($key)->delete();
            } else {
                static::query()->updateOrCreate(['key' => $key], ['color' => strtolower($color)]);
            }
        }

        Cache::forget(self::CACHE_KEY);
    }
}
