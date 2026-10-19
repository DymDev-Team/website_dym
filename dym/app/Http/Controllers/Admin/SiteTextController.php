<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\StoresUploads;
use App\Http\Controllers\Controller;
use App\Models\SiteText;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
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

        $pages = collect(config('site-texts'))->map(fn (array $page, string $pageKey) => [
            'key' => $pageKey,
            'label' => $page['label'],
            'sections' => collect($page['sections'])->map(fn (array $section, string $sectionKey) => [
                'key' => $sectionKey,
                'label' => $section['label'],
                'fields' => collect($section['fields'])->map(function (array $field, string $fieldKey) use ($pageKey, $sectionKey, $values) {
                    $key = "{$pageKey}.{$sectionKey}.{$fieldKey}";

                    return [
                        'key' => $key,
                        'label' => $field['label'],
                        'help' => $field['help'] ?? null,
                        'type' => $field['type'] ?? 'text',
                        'multiline' => $field['multiline'] ?? false,
                        'default' => $field['default'],
                        'value' => $values[$key],
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
            'images' => ['sometimes', 'array'],
            'images.*.key' => ['required', 'string', Rule::in($imageKeys)],
            'images.*.file' => ['required', 'image', 'max:5120'],
            'reset_images' => ['sometimes', 'array'],
            'reset_images.*' => ['string', Rule::in($imageKeys)],
        ]);

        SiteText::store(collect($validated['texts'] ?? [])->pluck('value', 'key')->all());

        foreach ($validated['reset_images'] ?? [] as $key) {
            $this->deleteUpload(SiteText::storedPath($key));
            SiteText::storeImage($key, null);
        }

        foreach ($validated['images'] ?? [] as $index => $image) {
            $current = SiteText::storedPath($image['key']);
            $path = $request->file("images.{$index}.file")->store('site-texts', 'public');

            SiteText::storeImage($image['key'], $path);
            $this->deleteUpload($current);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Textes enregistrés.']);

        return back();
    }
}
