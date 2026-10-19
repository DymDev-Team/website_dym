<?php

use App\Models\Brand;
use App\Models\Partner;
use App\Models\SiteText;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Storage::fake('public');
    $this->admin = User::factory()->admin()->create();
});

test('the media library lists shipped and uploaded images with their usages', function () {
    $uploaded = UploadedFile::fake()->image('atelier.jpg')->store('media', 'public');
    Brand::factory()->create(['name' => 'NovaMec', 'logo' => $uploaded]);

    $this->actingAs($this->admin)
        ->get(route('admin.media.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/media')
            ->where('items', function ($items) use ($uploaded) {
                $items = collect($items);
                $upload = $items->firstWhere('path', $uploaded);

                return $upload['source'] === 'upload'
                    && $upload['used_by'] === ['Marque « NovaMec »']
                    && $items->contains(fn ($i) => $i['path'] === '/images/process/01-bureau-etudes.jpg'
                        && $i['source'] === 'site'
                        && $i['used_by'] !== []);
            }),
        );
});

test('the picker gets the same list as json', function () {
    $this->actingAs($this->admin)
        ->getJson(route('admin.media.browse'))
        ->assertOk()
        ->assertJsonStructure(['items' => [['path', 'url', 'name', 'folder', 'source', 'size', 'used_by']]]);
});

test('non admins cannot open the media library', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.media.index'))
        ->assertForbidden();
});

test('images can be uploaded to the library', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.media.store'), ['files' => [
            UploadedFile::fake()->image('a.jpg'),
            UploadedFile::fake()->image('b.png'),
        ]])
        ->assertSessionHasNoErrors();

    expect(Storage::disk('public')->files('media'))->toHaveCount(2);
});

test('only images are accepted', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.media.store'), ['files' => [UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf')]])
        ->assertSessionHasErrors('files.0');
});

test('an unused upload can be deleted, a used one or a shipped one cannot', function () {
    $unused = UploadedFile::fake()->image('libre.jpg')->store('media', 'public');
    $used = UploadedFile::fake()->image('logo.jpg')->store('media', 'public');
    Partner::factory()->create(['logo' => $used]);

    $this->actingAs($this->admin)->delete(route('admin.media.destroy'), ['path' => $unused])->assertSessionHasNoErrors();
    Storage::disk('public')->assertMissing($unused);

    $this->actingAs($this->admin)->delete(route('admin.media.destroy'), ['path' => $used])->assertSessionHasErrors('path');
    Storage::disk('public')->assertExists($used);

    $this->actingAs($this->admin)->delete(route('admin.media.destroy'), ['path' => '/images/process/01-bureau-etudes.jpg'])->assertSessionHasErrors('path');
    expect(file_exists(public_path('images/process/01-bureau-etudes.jpg')))->toBeTrue();
});

test('a form can use an image picked in the library instead of an upload', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.brands.store'), [
            'name' => 'Marque test',
            'logo_media' => '/images/marques/ivoircuisson.png',
            'is_published' => '1',
        ])
        ->assertSessionHasNoErrors();

    expect(Brand::query()->where('name', 'Marque test')->sole()->logo)->toBe('/images/marques/ivoircuisson.png');
});

test('a picked path must exist in the library', function (string $path) {
    $this->actingAs($this->admin)
        ->post(route('admin.brands.store'), ['name' => 'Marque test', 'logo_media' => $path, 'is_published' => '1'])
        ->assertSessionHasErrors('logo_media');

    expect(Brand::query()->where('name', 'Marque test')->exists())->toBeFalse();
})->with(['/images/../../.env', '/images/introuvable.jpg', 'media/absent.jpg', 'https://example.com/x.jpg']);

test('replacing an image keeps the file when another item still uses it', function () {
    $shared = UploadedFile::fake()->image('partage.jpg')->store('media', 'public');
    $brand = Brand::factory()->create(['logo' => $shared]);
    Partner::factory()->create(['logo' => $shared]);

    $this->actingAs($this->admin)
        ->put(route('admin.brands.update', $brand), [
            'name' => $brand->name,
            'logo' => UploadedFile::fake()->image('nouveau.jpg'),
            'is_published' => '1',
        ])
        ->assertSessionHasNoErrors();

    Storage::disk('public')->assertExists($shared);
});

test('a site text photo can be picked in the library', function () {
    $this->actingAs($this->admin)
        ->put(route('admin.texts.update'), ['media' => [
            ['key' => 'home.process.step_1_image', 'path' => '/images/realisations/pergola.jpg'],
        ]])
        ->assertSessionHasNoErrors();

    expect(SiteText::values()['home.process.step_1_image'])->toBe('/images/realisations/pergola.jpg');
});
