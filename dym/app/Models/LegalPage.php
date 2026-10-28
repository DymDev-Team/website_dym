<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Editable legal page (legal notice, privacy policy, cookies).
 *
 * The body uses a light syntax: "## " for headings, "- " for list items,
 * blank lines between paragraphs, and {{email}}-style placeholders filled
 * from the site settings.
 *
 * @property int $id
 * @property string $slug
 * @property string $title
 * @property string $body
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['slug', 'title', 'body'])]
class LegalPage extends Model
{
    /**
     * Public URLs of the legal pages, in footer order.
     *
     * @var list<string>
     */
    public const SLUGS = ['mentions-legales', 'politique-de-confidentialite', 'cookies'];

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Body with the {{placeholders}} replaced by the current site settings.
     */
    public function renderedBody(): string
    {
        // Seuls les réglages texte servent de {{variables}} : section_colors est un tableau.
        $replacements = collect(Setting::values())
            ->filter(fn (mixed $value) => $value === null || is_string($value))
            ->mapWithKeys(fn (?string $value, string $key) => ["{{{$key}}}" => $value ?: '[à compléter]'])
            ->all();

        return strtr($this->body, $replacements);
    }
}
