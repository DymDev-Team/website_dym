<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

test('public page loads are counted once per request and grouped by day', function () {
    $this->get(route('home'))->assertOk();
    $this->get(route('home', ['campaign' => 'test']))->assertOk();
    $this->get(route('home'), ['Purpose' => 'prefetch'])->assertOk();
    $this->call('HEAD', route('home'))->assertOk();
    $this->get(route('realisations.show', 'unknown'))->assertNotFound();
    $this->actingAs(User::factory()->admin()->create())
        ->get(route('home'))->assertOk();

    $this->assertDatabaseCount('site_page_views', 1);
    $this->assertDatabaseHas('site_page_views', [
        'viewed_on' => today()->toDateString(),
        'section' => 'home',
        'views' => 2,
    ]);
});

test('the admin dashboard shows page views within each period', function () {
    $today = today()->toImmutable();

    DB::table('site_page_views')->insert([
        ['viewed_on' => $today->toDateString(), 'section' => 'home', 'views' => 3],
        ['viewed_on' => $today->subDays(6)->toDateString(), 'section' => 'home', 'views' => 4],
        ['viewed_on' => $today->subDays(7)->toDateString(), 'section' => 'brands', 'views' => 6],
        ['viewed_on' => $today->subDays(29)->toDateString(), 'section' => 'home', 'views' => 2],
        ['viewed_on' => $today->subDays(30)->toDateString(), 'section' => 'brands', 'views' => 20],
    ]);

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->where('traffic.today', 3)
            ->where('traffic.week', 7)
            ->where('traffic.month', 15)
            ->where('traffic.topSections', [
                ['section' => 'home', 'views' => 9],
                ['section' => 'brands', 'views' => 6],
            ]));
});
