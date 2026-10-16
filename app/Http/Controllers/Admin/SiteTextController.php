<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteText;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SiteTextController extends Controller
{
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
     * Save the texts of one page.
     */
    public function update(Request $request): RedirectResponse
    {
        // Liste de paires {key, value} : les clés contiennent des points, que la
        // validation interpréterait comme des tableaux imbriqués.
        $validated = $request->validate([
            'texts' => ['required', 'array'],
            'texts.*.key' => ['required', 'string', 'max:120'],
            'texts.*.value' => ['nullable', 'string', 'max:2000'],
        ]);

        SiteText::store(collect($validated['texts'])->pluck('value', 'key')->all());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Textes enregistrés.']);

        return back();
    }
}
