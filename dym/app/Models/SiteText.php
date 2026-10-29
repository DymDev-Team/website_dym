<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
     * Keys of the fields declared with « 'type' => 'image' ».
     *
     * @return list<string>
     */
    public static function imageKeys(): array
    {
        return self::keysOfType('image');
    }

    /**
     * Keys of the fields declared with « 'type' => 'color' » (value "#rrggbb").
     *
     * @return list<string>
     */
    public static function colorKeys(): array
    {
        return self::keysOfType('color');
    }

    /**
     * @return list<string>
     */
    private static function keysOfType(string $type): array
    {
        $keys = [];

        foreach (config('site-texts', []) as $pageKey => $page) {
            foreach ($page['sections'] as $sectionKey => $section) {
                foreach ($section['fields'] as $fieldKey => $field) {
                    if (($field['type'] ?? null) === $type) {
                        $keys[] = "{$pageKey}.{$sectionKey}.{$fieldKey}";
                    }
                }
            }
        }

        return $keys;
    }

    /**
     * Every text, customised values taking precedence over the defaults.
     * Image fields are returned as public URLs.
     *
     * @return array<string, string>
     */
    public static function values(): array
    {
        // Only stored rows are cached, so changing a default in code applies at once.
        $stored = Cache::rememberForever(self::CACHE_KEY, fn () => static::query()->pluck('value', 'key')->all());
        $defaults = self::defaults();
        $values = [...$defaults, ...array_intersect_key($stored, $defaults)];

        foreach (self::imageKeys() as $key) {
            $values[$key] = self::mediaUrlOf($values[$key]);
        }

        return $values;
    }

    /**
     * Stored path of an uploaded image field, null while the default applies.
     */
    public static function storedPath(string $key): ?string
    {
        return static::query()->find($key)?->value;
    }

    /**
     * Save the uploaded image of a field (path on the public disk), or
     * restore its default with null.
     */
    public static function storeImage(string $key, ?string $path): void
    {
        if ($path === null) {
            static::query()->whereKey($key)->delete();
        } else {
            static::query()->updateOrCreate(['key' => $key], ['value' => $path]);
        }

        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Save the given texts. A blank value, or one equal to the default,
     * removes the customisation so the default applies again.
     * Image fields are ignored: see storeImage().
     *
     * @param  array<string, string|null>  $values
     */
    public static function store(array $values): void
    {
        $defaults = array_diff_key(self::defaults(), array_flip(self::imageKeys()));

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

    /**
     * Same rule as HasMediaUrls: a path starting with "/" or "http" is a file
     * shipped in public/, anything else was uploaded to the public disk.
     */
    private static function mediaUrlOf(string $path): string
    {
        return Str::startsWith($path, ['/', 'http://', 'https://']) ? $path : Storage::disk('public')->url($path);
    }
}
