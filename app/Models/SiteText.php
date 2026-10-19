<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

/**
 * Texte du site personnalisé depuis l'administration.
 *
 * Les textes disponibles et leur valeur par défaut sont déclarés dans
 * config/site-texts.php ; seule une valeur modifiée est enregistrée ici.
 *
 * @property string $key
 * @property string $value
 */
#[Fillable(['key', 'value'])]
class SiteText extends Model
{
    public const CACHE_KEY = 'site-texts';

    protected $primaryKey = 'key';

    protected $keyType = 'string';

    public $incrementing = false;

    /**
     * Default value of every editable text, keyed by "page.section.field".
     *
     * @return array<string, string>
     */
    public static function defaults(): array
    {
        $defaults = [];

        foreach (config('site-texts', []) as $pageKey => $page) {
            foreach ($page['sections'] as $sectionKey => $section) {
                foreach ($section['fields'] as $fieldKey => $field) {
                    $defaults["{$pageKey}.{$sectionKey}.{$fieldKey}"] = $field['default'];
                }
            }
        }

        return $defaults;
    }

    /**
     * Every text, customised values taking precedence over the defaults.
     *
     * @return array<string, string>
     */
    public static function values(): array
    {
        // Only stored rows are cached, so changing a default in code applies at once.
        $stored = Cache::rememberForever(self::CACHE_KEY, fn () => static::query()->pluck('value', 'key')->all());
        $defaults = self::defaults();

        return [...$defaults, ...array_intersect_key($stored, $defaults)];
    }

    /**
     * Save the given texts. A blank value, or one equal to the default,
     * removes the customisation so the default applies again.
     *
     * @param  array<string, string|null>  $values
     */
    public static function store(array $values): void
    {
        $defaults = self::defaults();

        foreach (array_intersect_key($values, $defaults) as $key => $value) {
            $value = is_string($value) ? str_replace("\r\n", "\n", trim($value)) : '';

            if ($value === '' || $value === $defaults[$key]) {
                static::query()->whereKey($key)->delete();
            } else {
                static::query()->updateOrCreate(['key' => $key], ['value' => $value]);
            }
        }

        Cache::forget(self::CACHE_KEY);
    }
}
