<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
});

test('non admin users are forbidden', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('admin.dashboard'))->assertForbidden();
    $this->actingAs($user)->get(route('admin.activities.index'))->assertForbidden();
});

test('admins can visit every admin page', function (string $route) {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get(route($route))->assertOk();
})->with([
    'admin.dashboard',
    'admin.activities.index',
    'admin.activities.create',
    'admin.projects.index',
    'admin.projects.create',
    'admin.posts.index',
    'admin.posts.create',
    'admin.equipment.index',
    'admin.equipment.create',
    'admin.partners.index',
    'admin.partners.create',
    'admin.testimonials.index',
    'admin.testimonials.create',
    'admin.settings.edit',
    'admin.users.index',
    'admin.job-offers.index',
    'admin.job-offers.create',
    'admin.applications.index',
]);

test('is_admin cannot be mass assigned at registration', function () {
    $this->post(route('register.store'), [
        'name' => 'Intrus',
        'email' => 'intrus@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'is_admin' => true,
    ]);

    expect(User::query()->where('email', 'intrus@example.com')->first()?->is_admin)->toBeFalse();
});
