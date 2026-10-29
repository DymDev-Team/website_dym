<?php

use App\Models\SiteText;
use App\Models\SiteTextColor;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
    SiteText::store(['home.hero.cta' => SiteText::defaults()['home.hero.cta']]);

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
                && $texts['home.hero.cta'] === SiteText::defaults()['home.hero.cta']),
        );
});

test('a process photo can be replaced, replaced again and reset to its default', function () {
    Storage::fake('public');
    $key = 'home.process.step_2_image';

    expect(SiteText::values()[$key])->toBe('/images/process/02-atelier.jpg');

    $this->actingAs($this->admin)
        ->put(route('admin.texts.update'), ['images' => [
            ['key' => $key, 'file' => UploadedFile::fake()->image('atelier.jpg')],
        ]])
        ->assertSessionHasNoErrors();

    $first = SiteText::storedPath($key);
    Storage::disk('public')->assertExists($first);
    expect(SiteText::values()[$key])->toBe(Storage::disk('public')->url($first));

    // Nouvelle photo : l'ancien fichier est supprimé.
    $this->actingAs($this->admin)
        ->put(route('admin.texts.update'), ['images' => [
            ['key' => $key, 'file' => UploadedFile::fake()->image('atelier-2.jpg')],
        ]]);

    $second = SiteText::storedPath($key);
    Storage::disk('public')->assertMissing($first);
    Storage::disk('public')->assertExists($second);

    // Photo d'origine : fichier supprimé, chemin par défaut rétabli.
    $this->actingAs($this->admin)
        ->put(route('admin.texts.update'), ['reset_images' => [$key]]);

    Storage::disk('public')->assertMissing($second);
    expect(SiteText::storedPath($key))->toBeNull()
        ->and(SiteText::values()[$key])->toBe('/images/process/02-atelier.jpg');
});

test('only declared image fields accept a photo, and only images', function () {
    Storage::fake('public');

    $this->actingAs($this->admin)
        ->put(route('admin.texts.update'), ['images' => [
            ['key' => 'home.hero.title', 'file' => UploadedFile::fake()->image('x.jpg')],
            ['key' => 'home.process.step_1_image', 'file' => UploadedFile::fake()->create('x.pdf', 10, 'application/pdf')],
        ]])
        ->assertSessionHasErrors(['images.0.key', 'images.1.file']);

    expect(SiteText::query()->count())->toBe(0);
});

test('an image field cannot be overwritten through the texts list', function () {
    $this->actingAs($this->admin)
        ->put(route('admin.texts.update'), ['texts' => [
            ['key' => 'home.process.step_1_image', 'value' => 'https://example.com/x.jpg'],
        ]]);

    expect(SiteText::values()['home.process.step_1_image'])->toBe('/images/process/01-bureau-etudes.jpg');
});

test('a text color can be chosen and reset', function () {
    $this->actingAs($this->admin)
        ->put(route('admin.texts.update'), ['texts' => [
            ['key' => 'news.header.title', 'value' => 'Le métal en mouvement.', 'color' => '#766F65'],
        ]])
        ->assertRedirect();

    expect(SiteTextColor::values())->toBe(['news.header.title' => '#766f65'])
        ->and(SiteText::query()->count())->toBe(0);

    $this->actingAs($this->admin)
        ->put(route('admin.texts.update'), ['texts' => [
            ['key' => 'news.header.title', 'value' => 'Le métal en mouvement.', 'color' => null],
        ]]);

    expect(SiteTextColor::values())->toBe([]);
});

test('an invalid text color is rejected', function () {
    $this->actingAs($this->admin)
        ->put(route('admin.texts.update'), ['texts' => [
            ['key' => 'news.header.title', 'value' => 'Titre', 'color' => 'red; background:url(x)'],
        ]])
        ->assertSessionHasErrors('texts.0.color');
});

test('public pages receive the text colors', function () {
    SiteTextColor::store(['news.header.title' => '#141414', 'home.hero.inexistant' => '#ffffff']);

    $this->get(route('posts.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('textColors', ['news.header.title' => '#141414']),
        );
});

test('the banner takes over the texts of the former about section', function () {
    SiteText::query()->insert([
        ['key' => 'home.intro.title', 'value' => "À propos de\nDYM", 'created_at' => now(), 'updated_at' => now()],
        ['key' => 'home.hero.eyebrow', 'value' => 'Ancien surtitre', 'created_at' => now(), 'updated_at' => now()],
    ]);

    (require database_path('migrations/2026_10_28_100000_use_about_texts_in_hero.php'))->up();

    $texts = SiteText::values();

    expect($texts['home.hero.title'])->toBe("À propos de\nDYM")
        ->and($texts['home.hero.eyebrow'])->toBe(SiteText::defaults()['home.hero.eyebrow'])
        ->and($texts['home.hero.intro'])->toBe(SiteText::defaults()['home.hero.intro']);
});

test('the banner gets its own title back', function () {
    SiteText::query()->insert([
        ['key' => 'home.hero.title', 'value' => "À propos de\nDYM", 'created_at' => now(), 'updated_at' => now()],
        ['key' => 'home.hero.intro', 'value' => 'Paragraphe « À propos »', 'created_at' => now(), 'updated_at' => now()],
    ]);

    (require database_path('migrations/2026_10_29_000001_restore_hero_title.php'))->up();

    $texts = SiteText::values();

    expect($texts['home.hero.title'])->toBe("Des hommes\net des machines.")
        ->and($texts['home.hero.intro'])->toBe('Paragraphe « À propos »');
});
