<?php

use App\Models\LegalPage;
use App\Models\Setting;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('the three legal pages are public', function (string $slug) {
    $this->get(route('legal.show', $slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('legal')
            ->where('current', $slug)
            ->has('legalPages', 3),
        );
})->with(LegalPage::SLUGS);

test('placeholders are filled with the site settings', function () {
    Setting::store(['email' => 'rh@dym.ci']);

    $this->get(route('legal.show', 'politique-de-confidentialite'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('page.body', fn (string $body) => str_contains($body, 'rh@dym.ci') && ! str_contains($body, '{{email}}')),
        );
});

test('only known legal slugs are routed', function () {
    $this->get('/page-inconnue')->assertNotFound();
    $this->get(route('activities'))->assertOk()->assertInertia(fn (Assert $page) => $page->component('activites'));
});

test('admins can edit a legal page', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get(route('admin.legal-pages.index'))->assertOk();
    $this->actingAs($admin)->get(route('admin.legal-pages.edit', 'cookies'))->assertOk();

    $this->actingAs($admin)
        ->put(route('admin.legal-pages.update', 'cookies'), [
            'title' => 'Cookies',
            'body' => "## Nouveau\n\nTexte mis à jour.",
        ])
        ->assertRedirect(route('admin.legal-pages.index'));

    expect(LegalPage::query()->where('slug', 'cookies')->sole())
        ->title->toBe('Cookies')
        ->body->toContain('Texte mis à jour.');
});

test('non admins cannot edit legal pages', function () {
    $this->actingAs(User::factory()->create())
        ->put(route('admin.legal-pages.update', 'cookies'), ['title' => 'x', 'body' => 'y'])
        ->assertForbidden();
});
