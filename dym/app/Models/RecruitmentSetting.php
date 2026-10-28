<?php

namespace App\Models;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

/**
 * Key/value store for the recruitment module. Kept apart from Setting, whose
 * values are shared with the public pages: nothing here may leak to the site.
 *
 * @property string $key
 * @property string|null $value
 */
#[Fillable(['key', 'value'])]
class RecruitmentSetting extends Model
{
    public const CACHE_KEY = 'recruitment-settings';

    /**
     * Editable keys with their default value.
     *
     * @var array<string, string|null>
     */
    public const DEFAULTS = [
        'ai_enabled' => '1',
        'auto_analyze' => '1',
        'api_key' => null,
        'model' => 'claude-opus-5-5',
        'effort' => 'medium',
        // Dollars par mois ; une fois atteint, les nouvelles analyses sont suspendues.
        'monthly_budget' => '50',
        'custom_instructions' => null,
        // Notes sur 100 à partir desquelles l'avis devient « à rencontrer » ou « à étudier ».
        'priority_threshold' => '75',
        'consider_threshold' => '50',
        // Recherche web sur les écoles et entreprises citées dans les CV.
        'web_research' => '1',
    ];

    /**
     * Keys stored encrypted with the application key.
     */
    private const ENCRYPTED = ['api_key'];

    protected $primaryKey = 'key';

    protected $keyType = 'string';

    public $incrementing = false;

    /**
     * Every setting, defaults included, secrets decrypted.
     *
     * @return array{ai_enabled: bool, auto_analyze: bool, api_key: string|null, model: string, effort: string, monthly_budget: float, custom_instructions: string|null, priority_threshold: int, consider_threshold: int, web_research: bool}
     */
    public static function values(): array
    {
        $stored = Cache::rememberForever(self::CACHE_KEY, fn () => static::query()->pluck('value', 'key')->all());
        $values = [...self::DEFAULTS, ...array_intersect_key($stored, self::DEFAULTS)];

        foreach (self::ENCRYPTED as $key) {
            $values[$key] = self::decrypt($values[$key]);
        }

        return [
            'ai_enabled' => $values['ai_enabled'] === '1',
            'auto_analyze' => $values['auto_analyze'] === '1',
            // La variable d'environnement sert de repli quand aucune clé n'est saisie.
            'api_key' => $values['api_key'] ?: (config('services.anthropic.key') ?: null),
            'model' => array_key_exists((string) $values['model'], config('recruitment.models')) ? (string) $values['model'] : self::DEFAULTS['model'],
            'effort' => in_array($values['effort'], config('recruitment.efforts'), true) ? (string) $values['effort'] : self::DEFAULTS['effort'],
            'monthly_budget' => (float) $values['monthly_budget'],
            'custom_instructions' => $values['custom_instructions'],
            'priority_threshold' => (int) $values['priority_threshold'],
            'consider_threshold' => (int) $values['consider_threshold'],
            'web_research' => $values['web_research'] === '1',
        ];
    }

    /**
     * Persist several settings at once.
     *
     * @param  array<string, string|null>  $values
     */
    public static function store(array $values): void
    {
        foreach (array_intersect_key($values, self::DEFAULTS) as $key => $value) {
            if (in_array($key, self::ENCRYPTED, true) && filled($value)) {
                $value = Crypt::encryptString($value);
            }

            static::query()->updateOrCreate(['key' => $key], ['value' => $value]);
        }

        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Last characters of the API key, enough to recognise it in the admin.
     */
    public static function maskedApiKey(): ?string
    {
        $key = self::values()['api_key'];

        return $key === null ? null : '••••'.substr($key, -4);
    }

    /**
     * A value that cannot be decrypted (APP_KEY changed) counts as missing.
     */
    private static function decrypt(?string $value): ?string
    {
        if (blank($value)) {
            return null;
        }

        try {
            return Crypt::decryptString($value);
        } catch (DecryptException) {
            return null;
        }
    }
}
