<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Brand;
use App\Models\Equipment;
use App\Models\Partner;
use App\Models\Post;
use App\Models\Project;
use App\Models\Setting;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SiteController extends Controller
{
    /**
     * Public home page.
     */
    public function home(): Response
    {
        return Inertia::render('welcome', [
            'activities' => Activity::query()->published()->ordered()->get(),
            'projects' => Project::query()->published()->ordered()->get(),
            'equipment' => Equipment::query()->published()->ordered()->get(),
            'partners' => Partner::query()->published()->ordered()->get(),
            'testimonials' => Testimonial::query()->published()->ordered()->get(),
            'posts' => Post::query()->published()->latest('published_at')->limit(8)->get(),
            'site' => Setting::values(),
        ]);
    }

    /**
     * Public page listing the activities and the products made by DYM.
     */
    public function activities(): Response
    {
        return Inertia::render('activites', [
            'activities' => Activity::query()->published()->ordered()->get(),
            'site' => Setting::values(),
        ]);
    }

    public function activity(Activity $activity): Response
    {
        abort_unless($activity->is_published, 404);

        return Inertia::render('activite', [
            'activity' => $activity,
            'activities' => Activity::query()->published()->ordered()->get(),
            'site' => Setting::values(),
        ]);
    }

    /**
     * Public page listing published projects.
     */
    public function projects(): Response
    {
        return Inertia::render('realisations', [
            'projects' => Project::query()->published()->ordered()->get(),
            'activities' => Activity::query()->published()->ordered()->get(),
            'site' => Setting::values(),
        ]);
    }

    /**
     * Public page listing the brands distributed or carried by DYM.
     */
    public function brands(): Response
    {
        return Inertia::render('marques', [
            'brands' => Brand::query()->published()->ordered()->get(),
            'activities' => Activity::query()->published()->ordered()->get(),
            'site' => Setting::values(),
        ]);
    }

    /**
     * Public list of news posts, optionally filtered by category.
     */
    public function posts(Request $request): Response
    {
        $category = $request->string('categorie')->trim()->value() ?: null;

        return Inertia::render('actualites', [
            'posts' => Post::query()
                ->published()
                ->when($category, fn ($query) => $query->where('category', $category))
                ->latest('published_at')
                ->paginate(9)
                ->withQueryString(),
            'categories' => Post::query()->published()->distinct()->orderBy('category')->pluck('category'),
            'category' => $category,
            'activities' => Activity::query()->published()->ordered()->get(['id', 'title', 'image']),
            'site' => Setting::values(),
        ]);
    }

    /**
     * Public page of a news post.
     */
    public function post(Post $post): Response
    {
        abort_unless($post->isPublished(), 404);

        return Inertia::render('post', [
            'post' => $post,
            'related' => Post::query()->published()->whereKeyNot($post->id)->latest('published_at')->limit(3)->get(),
            'activities' => Activity::query()->published()->ordered()->get(['id', 'title', 'image']),
            'site' => Setting::values(),
        ]);
    }
}
