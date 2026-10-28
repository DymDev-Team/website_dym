<?php

use App\Enums\QuoteStatus;
use App\Models\Activity;
use App\Models\QuoteRequest;
use App\Models\Setting;
use App\Models\User;
use App\Notifications\NewQuoteRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Storage::fake('local');
    Notification::fake();
});

function quoteData(array $overrides = []): array
{
    return [
        'name' => 'Koffi Yao',
        'company' => 'Résidence Les Palmiers',
        'email' => 'koffi@example.com',
        'phone' => '+225 07 11 22 33 44',
        'activity' => 'Menuiserie métallique',
        'message' => 'Portail coulissant de 5 m en claustra découpé.',
        'deadline' => 'Sous 1 mois',
        'consent' => '1',
        ...$overrides,
    ];
}

test('the quote page lists published activities and preselects one', function () {
    Activity::factory()->create(['title' => 'Usinage métallique']);
    Activity::factory()->create(['title' => 'Activité masquée', 'is_published' => false]);

    $this->get(route('quotes.create', ['activite' => 'Usinage métallique']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('devis')
            ->where('preset', 'Usinage métallique')
            ->where('activities', fn ($activities) => collect($activities)->pluck('title')->contains('Usinage métallique')
                && ! collect($activities)->pluck('title')->contains('Activité masquée')),
        );
});

test('a visitor can request a quote with plans attached', function () {
    $this->post(route('quotes.store'), quoteData([
        'attachment' => UploadedFile::fake()->create('plan-portail.pdf', 300, 'application/pdf'),
    ]))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $quote = QuoteRequest::query()->sole();

    expect($quote->status)->toBe(QuoteStatus::New)
        ->and($quote->company)->toBe('Résidence Les Palmiers')
        ->and($quote->attachment_name)->toBe('plan-portail.pdf');

    Storage::disk('local')->assertExists($quote->attachment_path);

    Notification::assertSentTo(
        new AnonymousNotifiable,
        NewQuoteRequest::class,
        function (NewQuoteRequest $notification, $channels, $notifiable) {
            $mail = $notification->toMail($notifiable);

            return $notifiable->routes['mail'] === 'info@dym.ci'
                && in_array('Portail coulissant de 5 m en claustra découpé.', $mail->introLines, true)
                && $mail->rawAttachments[0]['name'] === 'plan-portail.pdf';
        },
    );
});

test('quote requests go to their own mailbox, not the public contact e-mail', function () {
    Setting::store(['email' => 'contact@example.com', 'quote_email' => 'devis@example.com']);

    $this->post(route('quotes.store'), quoteData())->assertSessionHasNoErrors();

    Notification::assertSentTo(
        new AnonymousNotifiable,
        NewQuoteRequest::class,
        fn ($notification, $channels, $notifiable) => $notifiable->routes['mail'] === 'devis@example.com',
    );
});

test('a blank quote mailbox falls back to info@dym.ci', function () {
    Setting::store(['quote_email' => null]);

    $this->post(route('quotes.store'), quoteData())->assertSessionHasNoErrors();

    Notification::assertSentTo(
        new AnonymousNotifiable,
        NewQuoteRequest::class,
        fn ($notification, $channels, $notifiable) => $notifiable->routes['mail'] === 'info@dym.ci',
    );
});

test('the quote mailbox is not exposed to public pages', function () {
    $this->get(route('quotes.create'))
        ->assertInertia(fn (Assert $page) => $page
            ->missing('site.quote_email')
            ->missing('siteSettings.quote_email'),
        );
});

test('the attachment is optional', function () {
    $this->post(route('quotes.store'), quoteData())->assertSessionHasNoErrors();

    expect(QuoteRequest::query()->sole()->attachment_path)->toBeNull();
});

test('name, contact details, project and consent are required', function () {
    $this->post(route('quotes.store'), quoteData(['name' => '', 'phone' => '', 'message' => '', 'consent' => null]))
        ->assertSessionHasErrors(['name', 'phone', 'message', 'consent']);

    expect(QuoteRequest::query()->count())->toBe(0);
});

test('executables are refused as attachment', function () {
    $this->post(route('quotes.store'), quoteData(['attachment' => UploadedFile::fake()->create('plan.exe', 10)]))
        ->assertSessionHasErrors('attachment');
});

test('bots filling the honeypot are rejected', function () {
    $this->post(route('quotes.store'), quoteData(['website' => 'http://spam.example']))
        ->assertSessionHasErrors('website');

    expect(QuoteRequest::query()->count())->toBe(0);
});

test('opening a new quote request marks it as in progress', function () {
    $quote = QuoteRequest::factory()->create();

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.quotes.show', $quote))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/quotes/show')->missing('quote.attachment_path'));

    expect($quote->refresh()->status)->toBe(QuoteStatus::InProgress);
});

test('quote requests can be filtered and their status changed', function () {
    $admin = User::factory()->admin()->create();
    QuoteRequest::factory()->create(['status' => QuoteStatus::Quoted]);
    $fresh = QuoteRequest::factory()->create();

    $this->actingAs($admin)
        ->get(route('admin.quotes.index', ['status' => 'new']))
        ->assertInertia(fn (Assert $page) => $page->has('quotes.data', 1)->where('quotes.data.0.id', $fresh->id));

    $this->actingAs($admin)
        ->patch(route('admin.quotes.update', $fresh), ['status' => 'won'])
        ->assertRedirect();

    expect($fresh->refresh()->status)->toBe(QuoteStatus::Won);
});

test('only admins can download a quote attachment', function () {
    Storage::disk('local')->put('quotes/plan.pdf', 'contenu');
    $quote = QuoteRequest::factory()->create(['attachment_path' => 'quotes/plan.pdf', 'attachment_name' => 'plan-portail.pdf']);

    $this->actingAs(User::factory()->create())
        ->get(route('admin.quotes.attachment', $quote))
        ->assertForbidden();

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.quotes.attachment', $quote))
        ->assertOk()
        ->assertDownload('plan-portail.pdf');
});

test('deleting a quote request removes its attachment', function () {
    Storage::disk('local')->put('quotes/plan.pdf', 'contenu');
    $quote = QuoteRequest::factory()->create(['attachment_path' => 'quotes/plan.pdf', 'attachment_name' => 'plan.pdf']);

    $this->actingAs(User::factory()->admin()->create())
        ->delete(route('admin.quotes.destroy', $quote))
        ->assertRedirect(route('admin.quotes.index'));

    Storage::disk('local')->assertMissing('quotes/plan.pdf');
    expect(QuoteRequest::query()->count())->toBe(0);
});
