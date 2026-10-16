<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\LegalPage;
use App\Models\Setting;
use Inertia\Inertia;
use Inertia\Response;

class LegalPageController extends Controller
{
    /**
     * Public legal page (legal notice, privacy policy, cookies).
     */
    public function __invoke(LegalPage $legalPage): Response
    {
        return Inertia::render('legal', [
            'page' => [
                'title' => $legalPage->title,
                'body' => $legalPage->renderedBody(),
                'updated_at' => $legalPage->updated_at,
            ],
            'legalPages' => LegalPage::query()
                ->whereIn('slug', LegalPage::SLUGS)
                ->get(['slug', 'title'])
                ->sortBy(fn (LegalPage $page) => array_search($page->slug, LegalPage::SLUGS, true))
                ->values(),
            'current' => $legalPage->slug,
            'activities' => Activity::query()->published()->ordered()->get(['id', 'title', 'image']),
            'site' => Setting::values(),
        ]);
    }
}
