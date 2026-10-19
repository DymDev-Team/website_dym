<?php

use App\Models\Activity;
use App\Models\Partner;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    // Les migrations importent le contenu initial du site : on repart de zéro.
    Activity::query()->delete();
    Partner::query()->delete();
    Testimonial::query()->delete();

    Storage::fake('public');
    $this->admin = User::factory()->admin()->create();
});

test('activities are listed in display order', function () {
    Activity::factory()->create(['title' => 'Second', 'position' => 2]);
    Activity::factory()->create(['title' => 'Premier', 'position' => 1]);

    $this->actingAs($this->admin)
        ->get(route('admin.activities.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/activities/index')
            ->where('activities.0.title', 'Premier')
            ->where('activities.1.title', 'Second'),
        );
});

test('an activity can be created with an image', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.activities.store'), [
            'title' => 'Soudure industrielle',
            'description' => 'Assemblages soudés.',
            'image' => UploadedFile::fake()->image('soudure.jpg'),
            'is_published' => '1',
        ])
        ->assertRedirect(route('admin.activities.index'));

    $activity = Activity::query()->sole();

    expect($activity->title)->toBe('Soudure industrielle')
        ->and($activity->is_published)->toBeTrue()
        ->and($activity->position)->toBe(1);

    Storage::disk('public')->assertExists($activity->image);
});

test('an image is required to create an activity', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.activities.store'), [
            'title' => 'Sans image',
            'description' => 'Description',
        ])
        ->assertSessionHasErrors('image');
});

test('updating without a new image keeps the current one', function () {
    $activity = Activity::factory()->create(['image' => '/images/activites/usinage.jpg']);

    $this->actingAs($this->admin)
        ->put(route('admin.activities.update', $activity), [
            'title' => 'Usinage CNC',
            'description' => 'Nouvelle description',
            'position' => 3,
        ])
        ->assertRedirect(route('admin.activities.index'));

    $activity->refresh();

    expect($activity->title)->toBe('Usinage CNC')
        ->and($activity->image)->toBe('/images/activites/usinage.jpg')
        ->and($activity->position)->toBe(3)
        ->and($activity->is_published)->toBeFalse();
});

test('replacing an uploaded image deletes the previous file', function () {
    $old = UploadedFile::fake()->image('old.jpg')->store('partners', 'public');
    $partner = Partner::factory()->create(['logo' => $old]);

    $this->actingAs($this->admin)
        ->put(route('admin.partners.update', $partner), [
            'name' => $partner->name,
            'logo' => UploadedFile::fake()->image('new.png'),
            'is_published' => '1',
        ])
        ->assertRedirect(route('admin.partners.index'));

    Storage::disk('public')->assertMissing($old);
    Storage::disk('public')->assertExists($partner->refresh()->logo);
});

test('deleting an item removes its uploaded image', function () {
    $path = UploadedFile::fake()->image('avis.jpg')->store('testimonials', 'public');
    $testimonial = Testimonial::factory()->create(['image' => $path]);

    $this->actingAs($this->admin)
        ->delete(route('admin.testimonials.destroy', $testimonial))
        ->assertRedirect(route('admin.testimonials.index'));

    expect(Testimonial::query()->count())->toBe(0);
    Storage::disk('public')->assertMissing($path);
});

test('a testimonial can be created without an image', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.testimonials.store'), [
            'quote' => 'Travail impeccable.',
            'author' => 'Client',
            'is_published' => '1',
        ])
        ->assertRedirect(route('admin.testimonials.index'));

    expect(Testimonial::query()->sole()->image)->toBeNull();
});
