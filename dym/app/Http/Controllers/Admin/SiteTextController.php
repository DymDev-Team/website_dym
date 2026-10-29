<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\StoresUploads;
use App\Http\Controllers\Controller;
use App\Models\SiteText;
use App\Models\SiteTextColor;
use App\Rules\ExistingMedia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SiteTextController extends Controller
{
    use StoresUploads;

    /**
     * Show the editable texts, grouped by page and section.
     */
    public function edit(): Response
    {
        $values = SiteText::values();
        $colors = SiteTextColor::values();

        $pages = collect(config('site-texts'))->map(fn (array $page, string $pageKey) => [
            'key' => $pageKey,
            'label' => $page['label'],
            'sections' => collect($page['sections'])->map(fn (array $section, string $sectionKey) => [
                'key' => $sectionKey,
                'label' => $section['label'],
                'fields' => collect($section['fields'])->map(function (array $field, string $fieldKey) use ($pageKey, $sectionKey, $values, $colors) {
                    $key = "{$pageKey}.{$sectionKey}.{$fieldKey}";

                    return [
                        'key' => $key,
                        'label' => $field['label'],
                        'help' => $field['help'] ?? null,
                        'type' => $field['type'] ?? 'text',
                        'multiline' => $field['multiline'] ?? false,
                        'default' => $field['default'],
                        'value' => $values[$key],
                        'color' => $colors[$key] ?? null,
                    ];
                })->values(),
            ])->values(),
        ])->values();

        return Inertia::render('admin/texts', ['pages' => $pages]);
    }

    /**
     * Save the texts and photos of one page.
     */
    public function update(Request $request): RedirectResponse
    {
        $imageKeys = SiteText::imageKeys();

        // Listes de paires {key, value} : les clés contiennent des points, que la
        // validation interpréterait comme des tableaux imbriqués.
        $validated = $request->validate([
            'texts' => ['sometimes', 'array'],
            'texts.*.key' => ['required', 'string', 'max:120'],
            'texts.*.value' => ['nullable', 'string', 'max:2000'],
            'texts.*.color' => ['nullable', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'images' => ['sometimes', 'array'],
            'images.*.key' => ['required', 'string', Rule::in($imageKeys)],
            'images.*.file' => ['required', 'image', 'max:5120'],
            'media' => ['sometimes', 'array'],
            'media.*.key' => ['required', 'string', Rule::in($imageKeys)],
            'media.*.path' => ['required', 'string', new ExistingMedia],
            'reset_images' => ['sometimes', 'array'],
            'reset_images.*' => ['string', Rule::in($imageKeys)],
        ]);

        // Champs « couleur » : une couleur #rrggbb, ou vide pour la couleur d'origine.
        $colorKeys = SiteText::colorKeys();
        $urlKeys = SiteText::keysOfType('url');

        foreach ($validated['texts'] ?? [] as $index => $text) {
            if (in_array($text['key'], $urlKeys, true) && filled($text['value'])
                && ! preg_match('~^(?:https?://[^\s]+|/(?!/)[^\s]*|#[^\s]*)$~i', $text['value'])) {
                throw ValidationException::withMessages(["texts.{$index}.value" => 'Utilisez une adresse https://, un chemin /page ou une ancre #section.']);
            }
            if (in_array($text['key'], $colorKeys, true) && filled($text['value']) && ! preg_match('/^#[0-9a-fA-F]{6}$/', $text['value'])) {
                throw ValidationException::withMessages(["texts.{$index}.value" => 'Choisissez une couleur au format #rrggbb.']);
            }
        }

        SiteText::store(collect($validated['texts'] ?? [])->pluck('value', 'key')->all());
        SiteTextColor::store(collect($validated['texts'] ?? [])->filter(fn (array $text) => array_key_exists('color', $text))->pluck('color', 'key')->all());

        // Ancien fichier supprimé après la mise à jour, et seulement s'il ne sert plus.
        $replace = function (string $key, ?string $path): void {
            $current = SiteText::storedPath($key);
            SiteText::storeImage($key, $path);

            if ($current !== $path) {
                $this->deleteUpload($current);
            }
        };

        foreach ($validated['reset_images'] ?? [] as $key) {
            $replace($key, null);
        }

        foreach ($validated['media'] ?? [] as $media) {
            $replace($media['key'], $media['path']);
        }

        foreach ($validated['images'] ?? [] as $index => $image) {
            $replace($image['key'], $request->file("images.{$index}.file")->store('site-texts', 'public'));
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Textes enregistrés.']);

        return back();
    }
}
