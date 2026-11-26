<?php

namespace App\Http\Controllers\Admin;

use App\Enums\QuoteStatus;
use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Brand;
use App\Models\Equipment;
use App\Models\JobApplication;
use App\Models\JobOffer;
use App\Models\Partner;
use App\Models\Post;
use App\Models\Project;
use App\Models\QuoteRequest;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Overview of the site content.
     */
    public function __invoke(): Response
    {
        return Inertia::render('admin/dashboard', [
            'traffic' => $this->traffic(),
            'stats' => [
                'activities' => $this->count(Activity::class),
                'projects' => $this->count(Project::class),
                'equipment' => $this->count(Equipment::class),
                'partners' => $this->count(Partner::class),
                'brands' => $this->count(Brand::class),
                'testimonials' => $this->count(Testimonial::class),
                'posts' => [
                    'total' => Post::query()->count(),
                    'published' => Post::query()->published()->count(),
                ],
                'applications' => [
                    'total' => JobApplication::query()->count(),
                    'new' => JobApplication::query()->whereNull('viewed_at')->count(),
                    'openOffers' => JobOffer::query()->open()->count(),
                ],
                'quotes' => [
                    'total' => QuoteRequest::query()->count(),
                    'new' => QuoteRequest::query()->where('status', QuoteStatus::New)->count(),
                ],
                'users' => [
                    'total' => User::query()->count(),
                    'admins' => User::query()->where('is_admin', true)->count(),
                ],
            ],
            'latestPosts' => Post::query()->latest('updated_at')->limit(5)->get(),
            'latestApplications' => JobApplication::query()
                ->with(['candidate:id,name,email', 'jobOffer:id,title', 'stage:id,name,color'])
                ->latest()
                ->latest('id')
                ->limit(8)
                ->get()
                ->map(fn (JobApplication $application) => [
                    'id' => $application->id,
                    'name' => $application->candidate->display_name,
                    'offer' => $application->jobOffer?->title,
                    'stage' => $application->stage->only(['name', 'color']),
                    'score' => $application->score,
                    'viewed' => $application->viewed_at !== null,
                    'created_at' => $application->created_at,
                ]),
        ]);
    }

    /**
     * @return array{today: int, week: int, month: int, topSections: list<array{section: string, views: int}>}
     */
    private function traffic(): array
    {
        $today = today()->toImmutable();
        $rows = DB::table('site_page_views')
            ->whereBetween('viewed_on', [$today->subDays(29)->toDateString(), $today->toDateString()])
            ->get();

        return [
            'today' => $rows->where('viewed_on', $today->toDateString())->sum('views'),
            'week' => $rows->where('viewed_on', '>=', $today->subDays(6)->toDateString())->sum('views'),
            'month' => $rows->sum('views'),
            'topSections' => $rows->groupBy('section')
                ->map(fn ($views, string $section) => ['section' => $section, 'views' => $views->sum('views')])
                ->sortBy([['views', 'desc'], ['section', 'asc']])
                ->take(5)
                ->values()
                ->all(),
        ];
    }

    /**
     * Total and visible counts for an orderable content type.
     *
     * @param  class-string<Model>  $model
     * @return array{total: int, published: int}
     */
    private function count(string $model): array
    {
        return [
            'total' => $model::query()->count(),
            'published' => $model::query()->where('is_published', true)->count(),
        ];
    }
}
