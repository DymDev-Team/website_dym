<?php

use App\Models\User;

test('make-admin promotes an existing user', function () {
    $user = User::factory()->unverified()->create(['email' => 'chef@dym.test']);

    $this->artisan('app:make-admin', ['email' => 'chef@dym.test'])->assertSuccessful();

    $user->refresh();
    expect($user->is_admin)->toBeTrue()
        ->and($user->email_verified_at)->not->toBeNull();
});

test('make-admin creates the account when it does not exist', function () {
    $this->artisan('app:make-admin', ['email' => 'nouveau@dym.test'])
        ->expectsQuestion('Mot de passe', 'Motdepasse-Solide-2026')
        ->expectsQuestion('Nom', 'Admin DYM')
        ->assertSuccessful();

    $user = User::query()->where('email', 'nouveau@dym.test')->firstOrFail();
    expect($user->is_admin)->toBeTrue()
        ->and($user->name)->toBe('Admin DYM')
        ->and($user->currentTeam)->not->toBeNull();
});
