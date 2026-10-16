<?php

use App\Models\Brand;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('the brands page only shows published brands in display order', function () {
    Brand::query()->delete();

    Brand::factory()->create(['name' => 'Seconde', 'position' => 2]);
    Brand::factory()->create(['name' => 'Première', 'position' => 1]);
    Brand::factory()->create(['name' => 'Masquée', 'is_published' => false]);

    $this->get(route('brands'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('marques')
            ->has('brands', 2)
            ->where('brands.0.name', 'Première')
            ->where('brands.1.name', 'Seconde'),
        );
});

test('an admin can create a brand with its logo', function () {
    Brand::query()->delete();
    Storage::fake('public');

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.brands.store'), [
            'name' => 'Linea Terra',
            'description' => 'Mobilier en métal.',
            'website_url' => 'https://example.com',
            'logo' => UploadedFile::fake()->image('logo.png'),
            'is_published' => '1',
        ])
        ->assertRedirect(route('admin.brands.index'));

    $brand = Brand::query()->sole();
    expect($brand->name)->toBe('Linea Terra')
        ->and($brand->description)->toBe('Mobilier en métal.');
    Storage::disk('public')->assertExists($brand->logo);
});

test('guests and non-admins cannot manage brands', function () {
    $this->get(route('admin.brands.index'))->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create())
        ->get(route('admin.brands.index'))
        ->assertForbidden();
});

test('the DYM brands are imported by the migrations', function () {
    $this->get(route('brands'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('brands', 2)
            ->where('brands.0.name', 'IvoirCuisson')
            ->where('brands.1.name', 'NovaMec'),
        );
});
