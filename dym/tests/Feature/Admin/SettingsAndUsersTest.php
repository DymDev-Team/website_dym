<?php

use App\Models\Setting;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('site settings can be updated', function () {
    $this->actingAs($this->admin)
        ->put(route('admin.settings.update'), [
            // Le formulaire envoie toujours les couleurs de section, obligatoires.
            ...array_filter(Setting::DEFAULTS, fn (string $key) => str_starts_with($key, 'section_color_'), ARRAY_FILTER_USE_KEY),
            'phone' => '+225 07 00 00 00 00',
            'email' => 'info@dym.ci',
            'linkedin_url' => 'https://www.linkedin.com/company/dym',
        ])
        ->assertRedirect(route('admin.settings.edit'));

    expect(Setting::values())
        ->phone->toBe('+225 07 00 00 00 00')
        ->email->toBe('info@dym.ci')
        ->linkedin_url->toBe('https://www.linkedin.com/company/dym');
});

test('social links must be valid urls', function () {
    $this->actingAs($this->admin)
        ->put(route('admin.settings.update'), ['facebook_url' => 'pas une url'])
        ->assertSessionHasErrors('facebook_url');
});

test('label colors are saved independently for each section', function () {
    $colors = array_filter(Setting::DEFAULTS, fn (string $key) => str_starts_with($key, 'section_color_'), ARRAY_FILTER_USE_KEY);

    $this->actingAs($this->admin)->put(route('admin.settings.update'), [
        ...$colors,
        'section_label_color_intro' => '#990000',
        'section_label_color_activities' => '#123456',
    ])->assertSessionHasNoErrors();

    $this->actingAs($this->admin)->put(route('admin.settings.update'), [
        ...$colors,
        'section_label_color_intro' => '',
    ])->assertSessionHasNoErrors();

    expect(Setting::values()['section_label_colors'])
        ->intro->toBeNull()
        ->activities->toBe('#123456')
        ->projects->toBeNull();
});

test('section label colors must be valid hex colors', function () {
    $this->actingAs($this->admin)->put(route('admin.settings.update'), [
        ...array_filter(Setting::DEFAULTS, fn (string $key) => str_starts_with($key, 'section_color_'), ARRAY_FILTER_USE_KEY),
        'section_label_color_intro' => 'red',
    ])->assertSessionHasErrors('section_label_color_intro');
});

test('an admin can create a verified account', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.users.store'), [
            'name' => 'Nouvel Admin',
            'email' => 'nouvel@dym.ci',
            'password' => 'password',
            'password_confirmation' => 'password',
            'is_admin' => '1',
        ])
        ->assertRedirect(route('admin.users.index'));

    $user = User::query()->where('email', 'nouvel@dym.ci')->sole();

    expect($user->is_admin)->toBeTrue()
        ->and($user->email_verified_at)->not->toBeNull()
        ->and($user->currentTeam)->not->toBeNull();
});

test('admin access can be granted and revoked', function () {
    $user = User::factory()->create();

    $this->actingAs($this->admin)->patch(route('admin.users.update', $user), ['is_admin' => true]);
    expect($user->refresh()->is_admin)->toBeTrue();

    $this->actingAs($this->admin)->patch(route('admin.users.update', $user), ['is_admin' => false]);
    expect($user->refresh()->is_admin)->toBeFalse();
});

test('admins cannot revoke their own access', function () {
    $this->actingAs($this->admin)
        ->patch(route('admin.users.update', $this->admin), ['is_admin' => false])
        ->assertSessionHasErrors('is_admin');

    expect($this->admin->refresh()->is_admin)->toBeTrue();
});

test('admins cannot delete their own account from the panel', function () {
    $this->actingAs($this->admin)
        ->delete(route('admin.users.destroy', $this->admin))
        ->assertForbidden();
});

test('an admin can delete another account', function () {
    $user = User::factory()->create();

    $this->actingAs($this->admin)
        ->delete(route('admin.users.destroy', $user))
        ->assertRedirect(route('admin.users.index'));

    expect(User::query()->find($user->id))->toBeNull();
});
