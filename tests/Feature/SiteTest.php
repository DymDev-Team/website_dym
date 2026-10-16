<?php

use App\Models\Activity;
use App\Models\Post;
use Inertia\Testing\AssertableInertia as Assert;

test('the home page only shows published content', function () {
    Activity::query()->delete();
    Post::query()->delete();

    Activity::factory()->create(['title' => 'Visible']);
    Activity::factory()->create(['title' => 'Masquée', 'is_published' => false]);
    Post::factory()->create(['title' => 'En ligne']);
    Post::factory()->create(['title' => 'Brouillon', 'published_at' => null]);
    Post::factory()->create(['title' => 'Programmée', 'published_at' => now()->addWeek()]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->has('activities', 1)
            ->where('activities.0.title', 'Visible')
            ->has('posts', 1)
            ->where('posts.0.title', 'En ligne')
            ->has('site.email'),
        );
});

test('the initial content is imported by the migrations', function () {
    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('activities', 4)
            ->has('projects', 10)
            ->has('partners', 7),
        );
});

test('a published post has its own page', function () {
    $post = Post::factory()->create(['title' => 'Escalier hélicoïdal']);

    $this->get(route('posts.show', $post))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('post')
            ->where('post.title', 'Escalier hélicoïdal'),
        );
});

test('draft and scheduled posts are not public', function () {
    $draft = Post::factory()->create(['published_at' => null]);
    $scheduled = Post::factory()->create(['published_at' => now()->addDay()]);

    $this->get(route('posts.show', $draft))->assertNotFound();
    $this->get(route('posts.show', $scheduled))->assertNotFound();
});
