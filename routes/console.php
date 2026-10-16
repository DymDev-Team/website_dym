<?php

use App\Actions\Fortify\CreateNewUser;
use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    TeamInvitation::query()
        ->whereNotNull('expires_at')
        ->where('expires_at', '<', now())
        ->delete();
})->daily()->description('Delete expired team invitations');

Artisan::command('app:make-admin {email}', function (string $email) {
    $user = User::query()->where('email', $email)->first();

    if (! $user) {
        $this->info("Aucun compte avec l'adresse {$email} : création.");

        $password = $this->secret('Mot de passe');

        $user = app(CreateNewUser::class)->create([
            'name' => $this->ask('Nom', 'Administrateur'),
            'email' => $email,
            'password' => $password,
            'password_confirmation' => $password,
        ]);
    }

    $user->forceFill([
        'is_admin' => true,
        'email_verified_at' => $user->email_verified_at ?? now(),
    ])->save();

    $this->info("{$user->name} a maintenant accès à /admin.");

    return 0;
})->purpose('Donner l’accès au panneau d’administration à un compte');
