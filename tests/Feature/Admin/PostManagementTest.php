<?php

use App\Models\Post;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    // Les migrations importent le contenu initial du site : on repart de zéro.
    Post::query()->delete();

    Storage::fake('public');
    $this->admin = User::factory()->admin()->create();
});

test('a post gets a unique slug from its title', function () {
    Post::factory()->create(['title' => 'Nouveau chantier', 'slug' => 'nouveau-chantier']);

    $this->actingAs($this->admin)
        ->post(route('admin.posts.store'), [
            'title' => 'Nouveau chantier',
            'category' => 'Chantier',
            'image' => UploadedFile::fake()->image('chantier.jpg'),
            'published_at' => now()->toDateTimeString(),
        ])
        ->assertRedirect(route('admin.posts.index'));

    expect(Post::query()->latest('id')->first()->slug)->toBe('nouveau-chantier-2');
});

test('a post without publication date is a draft', function () {
    $this->actingAs($this->admin)->post(route('admin.posts.store'), [
        'title' => 'Brouillon',
        'category' => 'Entreprise',
        'image' => UploadedFile::fake()->image('draft.jpg'),
    ]);

    $post = Post::query()->sole();

    expect($post->published_at)->toBeNull()
        ->and($post->isPublished())->toBeFalse();
});

test('a post slug can be changed', function () {
    $post = Post::factory()->create(['title' => 'Titre', 'slug' => 'titre']);

    $this->actingAs($this->admin)
        ->put(route('admin.posts.update', $post), [
            'title' => 'Titre',
            'slug' => 'Nouvelle Adresse',
            'category' => 'Réalisation',
        ])
        ->assertRedirect(route('admin.posts.index'));

    expect($post->refresh()->slug)->toBe('nouvelle-adresse');
});

test('posts can be searched by title', function () {
    Post::factory()->create(['title' => 'Portail en fer forgé']);
    Post::factory()->create(['title' => 'Salon agricole']);

    $this->actingAs($this->admin)
        ->get(route('admin.posts.index', ['search' => 'portail']))
        ->assertInertia(fn ($page) => $page->has('posts.data', 1)->where('posts.data.0.title', 'Portail en fer forgé'));
});
