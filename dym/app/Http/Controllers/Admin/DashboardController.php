<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ApplicationStatus;
use App\Enums\QuoteStatus;
use App\Http\Controllers\Controller;
use App\Models\Activity;
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
            'stats' => [
                'activities' => $this->count(Activity::class),
                'projects' => $this->count(Project::class),
                'equipment' => $this->count(Equipment::class),
                'partners' => $this->count(Partner::class),
                'testimonials' => $this->count(Testimonial::class),
                'posts' => [
                    'total' => Post::query()->count(),
                    'published' => Post::query()->published()->count(),
                ],
                'applications' => [
                    'total' => JobApplication::query()->count(),
                    'new' => JobApplication::query()->where('status', ApplicationStatus::New)->count(),
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
        ]);
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
