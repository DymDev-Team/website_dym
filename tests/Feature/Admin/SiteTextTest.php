<?php

use App\Models\SiteText;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('the texts page lists every page of the registry', function () {
    $this->actingAs($this->admin)
        ->get(route('admin.texts.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/texts')
            ->has('pages', count(config('site-texts')))
            ->where('pages.0.key', 'home')
            ->where('pages.0.sections.1.fields.1.key', 'home.hero.title')
            ->where('pages.0.sections.1.fields.1.value', "Des hommes\net des machines."),
        );
});

test('non admins cannot edit the texts', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.texts.edit'))
        ->assertForbidden();
});

test('a text can be customised and reset to its default', function () {
    $this->actingAs($this->admin)
        ->put(route('admin.texts.update'), ['texts' => [
            ['key' => 'news.header.title', 'value' => "  Nos nouvelles.\r\n "],
        ]])
        ->assertRedirect();

    expect(SiteText::values()['news.header.title'])->toBe('Nos nouvelles.');

    // Champ vidé → retour au texte d'origine.
    $this->actingAs($this->admin)
        ->put(route('admin.texts.update'), ['texts' => [
            ['key' => 'news.header.title', 'value' => ''],
        ]]);

    expect(SiteText::values()['news.header.title'])->toBe('Le métal en mouvement.')
        ->and(SiteText::query()->count())->toBe(0);
});

test('a value equal to the default is not stored', function () {
    SiteText::store(['home.hero.cta' => 'DÉCOUVRIR NOS ACTIVITÉS']);

    expect(SiteText::query()->count())->toBe(0);
});

test('unknown keys are ignored', function () {
    $this->actingAs($this->admin)
        ->put(route('admin.texts.update'), ['texts' => [
            ['key' => 'home.hero.inexistant', 'value' => 'Pirate'],
        ]])
        ->assertRedirect();

    expect(SiteText::query()->count())->toBe(0);
});

test('texts longer than 2000 characters are rejected', function () {
    $this->actingAs($this->admin)
        ->put(route('admin.texts.update'), ['texts' => [
            ['key' => 'home.hero.intro', 'value' => str_repeat('a', 2001)],
        ]])
        ->assertSessionHasErrors('texts.0.value');
});

test('public pages receive the customised texts', function () {
    SiteText::store(['news.header.title' => 'Nos nouvelles.']);

    $this->get(route('posts.index'))
        ->assertOk()
        // Les clés contiennent des points : on lit le tableau directement.
        ->assertInertia(fn (Assert $page) => $page
            ->where('texts', fn ($texts) => $texts['news.header.title'] === 'Nos nouvelles.'
                && $texts['home.hero.cta'] === 'DÉCOUVRIR NOS ACTIVITÉS'),
        );
});
