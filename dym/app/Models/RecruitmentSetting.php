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
        // Accusé de réception envoyé au candidat qui postule sur le site.
        'acknowledgment_enabled' => '1',
        'acknowledgment_subject' => 'Nous avons bien reçu votre candidature',
        'acknowledgment_body' => <<<'TEXT'
            Bonjour {nom},

            Nous avons bien reçu votre candidature et nous vous remercions de l’intérêt que vous portez à DYM Manufacture.

            Poste : {poste}

            Notre équipe va étudier votre dossier avec attention. Si votre profil correspond à nos besoins, nous vous contacterons pour la suite du recrutement.

            Vos données sont conservées 2 ans à compter du dernier contact, puis supprimées. Vous pouvez à tout moment demander à les consulter ou à les faire supprimer en répondant à cet e-mail.

            Cordialement,
            L’équipe DYM Manufacture
            TEXT,
        // Vide : les réponses du candidat arrivent sur l'e-mail de contact du site.
        'acknowledgment_reply_to' => null,
        // Note IA à partir de laquelle une nouvelle candidature passe en étude.
        'auto_advance' => '1',
        'auto_advance_threshold' => '75',
        // Test psychotechnique : temps par question, validité du lien.
        'psychotest_question_seconds' => '60',
        'psychotest_validity_days' => '7',
        // Part de chaque volet dans la réserve de questions d'un poste (en %).
        'psychotest_mix_aptitude' => '40',
        'psychotest_mix_behaviour' => '60',
        'psychotest_mix_trade' => '0',
        // Grille de l'appréciation DG, un critère par ligne, chacun noté sur 5.
        'dg_criteria' => "Présentation et communication\nMotivation\nCompétences techniques\nPotentiel d’évolution\nAdéquation avec l’équipe",
        // Poids des notes IA, test et DG dans la note globale.
        'weight_ai' => '1',
        'weight_test' => '1',
        'weight_dg' => '1',
        // Base de connaissances transmise à l'IA quand elle rédige tests et offres.
        'ai_knowledge' => <<<'TEXT'
            Tous les montants sont exprimés en francs CFA (FCFA), jamais en euros ni en dollars.
            Ne cite aucune autre entreprise, aucun client, fournisseur ni sous-traitant : seule DYM Manufacture apparaît.
            Reste dans le cadre du poste : ses missions, ses outils, ses matériaux et les situations réellement rencontrées chez DYM Manufacture.
            TEXT,
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
     * @return array{ai_enabled: bool, auto_analyze: bool, api_key: string|null, model: string, effort: string, monthly_budget: float, custom_instructions: string|null, priority_threshold: int, consider_threshold: int, web_research: bool, acknowledgment_enabled: bool, acknowledgment_subject: string, acknowledgment_body: string, acknowledgment_reply_to: string|null, auto_advance: bool, auto_advance_threshold: int, psychotest_question_seconds: int, psychotest_validity_days: int, psychotest_mix_aptitude: int, psychotest_mix_behaviour: int, psychotest_mix_trade: int, dg_criteria: list<string>, ai_knowledge: string, weight_ai: int, weight_test: int, weight_dg: int}
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
            'acknowledgment_enabled' => $values['acknowledgment_enabled'] === '1',
            'acknowledgment_subject' => (string) ($values['acknowledgment_subject'] ?: self::DEFAULTS['acknowledgment_subject']),
            'acknowledgment_body' => (string) ($values['acknowledgment_body'] ?: self::DEFAULTS['acknowledgment_body']),
            'acknowledgment_reply_to' => $values['acknowledgment_reply_to'] ?: null,
            'auto_advance' => $values['auto_advance'] === '1',
            'auto_advance_threshold' => (int) $values['auto_advance_threshold'],
            'psychotest_question_seconds' => max(15, (int) $values['psychotest_question_seconds']),
            'psychotest_validity_days' => max(1, (int) $values['psychotest_validity_days']),
            'psychotest_mix_aptitude' => max(0, (int) $values['psychotest_mix_aptitude']),
            'psychotest_mix_behaviour' => max(0, (int) $values['psychotest_mix_behaviour']),
            'psychotest_mix_trade' => max(0, (int) $values['psychotest_mix_trade']),
            'dg_criteria' => self::lines((string) ($values['dg_criteria'] ?: self::DEFAULTS['dg_criteria'])),
            'ai_knowledge' => trim((string) $values['ai_knowledge']),
            'weight_ai' => max(0, (int) $values['weight_ai']),
            'weight_test' => max(0, (int) $values['weight_test']),
            'weight_dg' => max(0, (int) $values['weight_dg']),
        ];
    }

    /**
     * Weights of the AI, test and DG scores in the global score.
     *
     * @return array{ai: int, test: int, dg: int}
     */
    public static function weights(): array
    {
        $values = self::values();

        return ['ai' => $values['weight_ai'], 'test' => $values['weight_test'], 'dg' => $values['weight_dg']];
    }

    /**
     * Knowledge base added to the instructions of the AI, when filled.
     */
    public static function knowledge(): string
    {
        $knowledge = self::values()['ai_knowledge'];

        return $knowledge === '' ? '' : "\n\nBase de connaissances de DYM Manufacture, à respecter impérativement :\n{$knowledge}";
    }

    /**
     * Non-empty lines of a text, trimmed, without duplicates.
     *
     * @return list<string>
     */
    public static function lines(string $text): array
    {
        return array_values(array_unique(array_filter(array_map('trim', preg_split('/\R/', $text) ?: []), 'filled')));
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
