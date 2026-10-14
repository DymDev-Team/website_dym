<?php

use App\Enums\ApplicationStatus;
use App\Models\JobApplication;
use App\Models\JobOffer;
use App\Models\Setting;
use App\Models\User;
use App\Notifications\NewJobApplication;
use Illuminate\Http\UploadedFile;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Storage::fake('local');
    Notification::fake();
});

function applicationData(array $overrides = []): array
{
    return [
        'name' => 'Awa Koné',
        'email' => 'awa@example.com',
        'phone' => '+225 07 00 00 00 00',
        'message' => 'Soudeuse TIG depuis 5 ans.',
        'cv' => UploadedFile::fake()->create('cv-awa.pdf', 200, 'application/pdf'),
        'consent' => '1',
        ...$overrides,
    ];
}

test('the careers page lists only open offers', function () {
    JobOffer::factory()->create(['title' => 'Soudeur TIG']);
    JobOffer::factory()->closed()->create(['title' => 'Offre clôturée']);
    JobOffer::factory()->create(['title' => 'Offre masquée', 'is_published' => false]);

    $this->get(route('careers.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('carriere')
            ->has('offers', 1)
            ->where('offers.0.title', 'Soudeur TIG'),
        );
});

test('an open offer has its own page, a closed one does not', function () {
    $open = JobOffer::factory()->create();
    $closed = JobOffer::factory()->closed()->create();

    $this->get(route('careers.show', $open))->assertOk()->assertInertia(fn (Assert $page) => $page->component('offre'));
    $this->get(route('careers.show', $closed))->assertNotFound();
});

test('a candidate can apply to an offer', function () {
    $offer = JobOffer::factory()->create();

    $this->post(route('careers.apply'), applicationData(['job_offer_id' => $offer->id]))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $application = JobApplication::query()->sole();

    expect($application->job_offer_id)->toBe($offer->id)
        ->and($application->status)->toBe(ApplicationStatus::New)
        ->and($application->cv_name)->toBe('cv-awa.pdf');

    Storage::disk('local')->assertExists($application->cv_path);

    Notification::assertSentTo(
        new AnonymousNotifiable,
        NewJobApplication::class,
        fn ($notification, $channels, $notifiable) => $notifiable->routes['mail'] === Setting::values()['email'],
    );
});

test('a spontaneous application has no offer', function () {
    $this->post(route('careers.apply'), applicationData())->assertSessionHasNoErrors();

    expect(JobApplication::query()->sole()->job_offer_id)->toBeNull();
});

test('a cv and consent are required', function () {
    $this->post(route('careers.apply'), applicationData(['cv' => null, 'consent' => null]))
        ->assertSessionHasErrors(['cv', 'consent']);
});

test('executables are refused as cv', function () {
    $this->post(route('careers.apply'), applicationData(['cv' => UploadedFile::fake()->create('cv.exe', 10)]))
        ->assertSessionHasErrors('cv');
});

test('bots filling the honeypot are rejected', function () {
    $this->post(route('careers.apply'), applicationData(['website' => 'http://spam.example']))
        ->assertSessionHasErrors('website');

    expect(JobApplication::query()->count())->toBe(0);
});

test('applying to a closed offer is refused', function () {
    $offer = JobOffer::factory()->closed()->create();

    $this->post(route('careers.apply'), applicationData(['job_offer_id' => $offer->id]))
        ->assertSessionHasErrors('job_offer_id');

    expect(JobApplication::query()->count())->toBe(0);
});

test('admins manage job offers', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.job-offers.store'), [
            'title' => 'Chaudronnier',
            'contract_type' => 'CDI',
            'location' => 'Abidjan',
            'is_published' => '1',
        ])
        ->assertRedirect(route('admin.job-offers.index'));

    $offer = JobOffer::query()->sole();
    expect($offer->slug)->toBe('chaudronnier')->and($offer->is_published)->toBeTrue();

    $this->actingAs($admin)
        ->put(route('admin.job-offers.update', $offer), [
            'title' => 'Chaudronnier confirmé',
            'contract_type' => 'CDD',
            'location' => 'Abidjan',
        ])
        ->assertRedirect(route('admin.job-offers.index'));

    expect($offer->refresh())
        ->contract_type->toBe('CDD')
        ->slug->toBe('chaudronnier-confirme')
        ->is_published->toBeFalse();
});

test('deleting an offer keeps its applications', function () {
    $admin = User::factory()->admin()->create();
    $offer = JobOffer::factory()->create();
    $application = JobApplication::factory()->for($offer)->create();

    $this->actingAs($admin)->delete(route('admin.job-offers.destroy', $offer));

    expect($application->refresh()->job_offer_id)->toBeNull();
});

test('opening a new application marks it as reviewing', function () {
    $admin = User::factory()->admin()->create();
    $application = JobApplication::factory()->create();

    $this->actingAs($admin)
        ->get(route('admin.applications.show', $application))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/applications/show')->missing('application.cv_path'));

    expect($application->refresh()->status)->toBe(ApplicationStatus::Reviewing);
});

test('applications can be filtered and their status changed', function () {
    $admin = User::factory()->admin()->create();
    $offer = JobOffer::factory()->create();
    JobApplication::factory()->for($offer)->create();
    $spontaneous = JobApplication::factory()->create();

    $this->actingAs($admin)
        ->get(route('admin.applications.index', ['offer' => 'spontaneous']))
        ->assertInertia(fn (Assert $page) => $page->has('applications.data', 1)->where('applications.data.0.id', $spontaneous->id));

    $this->actingAs($admin)
        ->patch(route('admin.applications.update', $spontaneous), ['status' => 'interview'])
        ->assertRedirect();

    expect($spontaneous->refresh()->status)->toBe(ApplicationStatus::Interview);
});

test('only admins can download a cv', function () {
    Storage::disk('local')->put('applications/cv.pdf', 'contenu');
    $application = JobApplication::factory()->create(['cv_path' => 'applications/cv.pdf', 'cv_name' => 'cv-awa.pdf']);

    $this->actingAs(User::factory()->create())
        ->get(route('admin.applications.cv', $application))
        ->assertForbidden();

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.applications.cv', $application))
        ->assertOk()
        ->assertDownload('cv-awa.pdf');
});

test('deleting an application removes the cv', function () {
    Storage::disk('local')->put('applications/cv.pdf', 'contenu');
    $application = JobApplication::factory()->create(['cv_path' => 'applications/cv.pdf']);

    $this->actingAs(User::factory()->admin()->create())
        ->delete(route('admin.applications.destroy', $application))
        ->assertRedirect(route('admin.applications.index'));

    Storage::disk('local')->assertMissing('applications/cv.pdf');
});
