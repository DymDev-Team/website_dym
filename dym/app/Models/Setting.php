<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

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
        // Boîte qui reçoit les demandes de devis, indépendante de l'e-mail affiché sur le site.
        'quote_email' => 'info@dym.ci',
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
        'section_color_intro' => '#e8e3e3',
        'section_color_activities' => '#141414',
        'section_color_projects' => '#141414',
        'section_color_equipment' => '#ffffff',
        'section_color_process' => '#ffffff',
        'section_color_testimonials' => '#ffffff',
        'section_color_news' => '#141414',
        'section_color_partners' => '#ffffff',
        'section_color_footer' => '#ffffff',
        // Couleurs propres aux pages internes (les couleurs d'accueil restent indépendantes).
        'section_color_activities_page_cards' => '#141414',
        'section_color_activities_page_products' => '#ffffff',
        'section_color_activities_page_cta' => '#141414',
        'section_color_activity_page_hero' => '#141414',
        'section_color_activity_page_details' => '#ffffff',
        'section_color_activity_page_related' => '#ffffff',
        'section_color_projects_page_list' => '#ffffff',
        'section_color_news_page_list' => '#ffffff',
        'section_color_post_page_content' => '#ffffff',
        'section_color_post_page_related' => '#ffffff',
        'section_color_brands_page_list' => '#ffffff',
        'section_color_career_page_intro' => '#ffffff',
        'section_color_career_page_values' => '#141414',
        'section_color_career_page_jobs' => '#ffffff',
        'section_color_career_page_application' => '#ffffff',
        'section_color_job_page_intro' => '#ffffff',
        'section_color_job_page_details' => '#ffffff',
        'section_color_quote_page_form' => '#ffffff',
        'section_color_legal_page_heading' => '#ffffff',
        'section_color_legal_page_content' => '#ffffff',
        'section_label_color_header' => null,
        'section_label_color_hero' => null,
        'section_label_color_intro' => null,
        'section_label_color_activities' => null,
        'section_label_color_projects' => null,
        'section_label_color_equipment' => null,
        'section_label_color_process' => null,
        'section_label_color_testimonials' => null,
        'section_label_color_news' => null,
        'section_label_color_partners' => null,
        'section_label_color_footer' => null,
        'section_label_color_activities_page_cards' => null,
        'section_label_color_activities_page_products' => null,
        'section_label_color_activities_page_cta' => null,
        'section_label_color_activity_page_hero' => null,
        'section_label_color_activity_page_details' => null,
        'section_label_color_activity_page_related' => null,
        'section_label_color_projects_page_list' => null,
        'section_label_color_news_page_list' => null,
        'section_label_color_post_page_content' => null,
        'section_label_color_post_page_related' => null,
        'section_label_color_brands_page_list' => null,
        'section_label_color_career_page_intro' => null,
        'section_label_color_career_page_values' => null,
        'section_label_color_career_page_jobs' => null,
        'section_label_color_career_page_application' => null,
        'section_label_color_job_page_intro' => null,
        'section_label_color_job_page_details' => null,
        'section_label_color_quote_page_form' => null,
        'section_label_color_legal_page_heading' => null,
        'section_label_color_legal_page_content' => null,
    ];

    protected $primaryKey = 'key';

    protected $keyType = 'string';

    public $incrementing = false;

    /**
     * Server-only keys, left out of the props sent to the pages.
     *
     * @var list<string>
     */
    public const PRIVATE = ['quote_email'];

    /**
     * Every setting, defaults included; private keys only on request.
     *
     * @return array<string, mixed>
     */
    public static function values(bool $withPrivate = false): array
    {
        // Only stored rows are cached, so changing a default in code applies at once.
        $stored = Cache::rememberForever(self::CACHE_KEY, fn () => static::query()->pluck('value', 'key')->all());

        $values = [...self::DEFAULTS, ...array_intersect_key($stored, self::DEFAULTS)];
        $path = $values['logo_path'];
        $values['logo_url'] = filled($path)
            ? (str_starts_with($path, '/') || str_starts_with($path, 'http') ? $path : Storage::disk('public')->url($path))
            : null;
        $values['section_colors'] = collect(self::DEFAULTS)
            ->filter(fn ($value, $key) => str_starts_with($key, 'section_color_'))
            ->mapWithKeys(fn ($value, $key) => [substr($key, 14) => $values[$key]])
            ->all();

        $values['section_label_colors'] = collect(self::DEFAULTS)
            ->filter(fn ($value, $key) => str_starts_with($key, 'section_label_color_'))
            ->mapWithKeys(fn ($value, $key) => [substr($key, 20) => $values[$key]])
            ->all();

        return $withPrivate ? $values : array_diff_key($values, array_flip(self::PRIVATE));
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
