<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LegalPage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LegalPageController extends Controller
{
    /**
     * Display the legal pages.
     */
    public function index(): Response
    {
        return Inertia::render('admin/legal-pages/index', [
            'pages' => LegalPage::query()
                ->get()
                ->map(fn (LegalPage $page) => [
                    'slug' => $page->slug,
                    'title' => $page->title,
                    'updated_at' => $page->updated_at,
                    'incomplete' => str_contains($page->renderedBody(), '[à compléter]'),
                ])
                ->sortBy(fn (array $page) => array_search($page['slug'], LegalPage::SLUGS, true))
                ->values(),
        ]);
    }

    /**
     * Show the edit form.
     */
    public function edit(LegalPage $legalPage): Response
    {
        return Inertia::render('admin/legal-pages/form', [
            'page' => $legalPage,
        ]);
    }

    /**
     * Update the legal page.
     */
    public function update(Request $request, LegalPage $legalPage): RedirectResponse
    {
        $legalPage->update($request->validate([
            'title' => ['required', 'string', 'max:160'],
            'body' => ['required', 'string', 'max:100000'],
        ]));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Page mise à jour.']);

        return to_route('admin.legal-pages.index');
    }
}
