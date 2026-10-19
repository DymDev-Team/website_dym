<?php

use App\Models\CookieConsent;
use Illuminate\Support\Str;

test('a visitor cookie choice is recorded as proof of consent', function () {
    $id = (string) Str::uuid();

    $this->postJson(route('cookie-consent.store'), [
        'consent_id' => $id,
        'analytics' => true,
        'marketing' => false,
    ])->assertNoContent();

    $consent = CookieConsent::query()->sole();

    expect($consent->consent_id)->toBe($id)
        ->and($consent->analytics)->toBeTrue()
        ->and($consent->marketing)->toBeFalse()
        ->and($consent->policy_version)->toBe(CookieConsent::POLICY_VERSION);
});

test('each change of mind is kept in the history', function () {
    $id = (string) Str::uuid();

    $this->postJson(route('cookie-consent.store'), ['consent_id' => $id, 'analytics' => true, 'marketing' => true]);
    $this->postJson(route('cookie-consent.store'), ['consent_id' => $id, 'analytics' => false, 'marketing' => false]);

    expect(CookieConsent::query()->where('consent_id', $id)->count())->toBe(2);
});

test('invalid choices are rejected', function () {
    $this->postJson(route('cookie-consent.store'), ['consent_id' => 'not-a-uuid', 'analytics' => 'yes'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['consent_id', 'analytics', 'marketing']);

    expect(CookieConsent::query()->count())->toBe(0);
});
