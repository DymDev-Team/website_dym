<?php

use App\Enums\ApplicationEventType;
use App\Models\Candidate;
use App\Models\JobApplication;
use App\Models\JobOffer;
use App\Models\RecruitmentSetting;
use App\Models\RecruitmentStage;
use App\Models\Setting;
use App\Models\User;
use App\Notifications\ApplicationReceived;
use App\Notifications\NewJobApplication;
use App\Recruitment\CandidateMail;
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
        ->and($application->stage_id)->toBe(RecruitmentStage::initial()->id)
        ->and($application->source->label)->toBe('Site web')
        ->and($application->cv_name)->toBe('cv-awa.pdf')
        ->and($application->candidate->only(['name', 'email']))->toBe(['name' => 'Awa Koné', 'email' => 'awa@example.com']);

    Storage::disk('local')->assertExists($application->cv_path);

    Notification::assertSentTo(
        new AnonymousNotifiable,
        NewJobApplication::class,
        fn ($notification, $channels, $notifiable) => $notifiable->routes['mail'] === Setting::values()['email'],
    );
});

test('the candidate receives an acknowledgment of their application', function () {
    $offer = JobOffer::factory()->create(['title' => 'Soudeur TIG']);

    $this->post(route('careers.apply'), applicationData(['job_offer_id' => $offer->id]))->assertSessionHasNoErrors();

    $sent = null;
    Notification::assertSentOnDemand(
        ApplicationReceived::class,
        function (ApplicationReceived $notification, array $channels, AnonymousNotifiable $notifiable) use (&$sent) {
            $sent = $notification->toMail($notifiable);

            return $notifiable->routes['mail'] === 'awa@example.com';
        },
    );

    expect($sent->subject)->toBe('Nous avons bien reçu votre candidature')
        // Sans adresse de réponse saisie : l'e-mail de contact du site.
        ->and($sent->replyTo)->toBe([[Setting::values()['email'], null]])
        ->and((string) $sent->render())->toContain('Bonjour Awa Koné,', 'Poste : Soudeur TIG', 'Cordialement,<br>');
});

test('the acknowledgment follows the text written in the settings', function () {
    RecruitmentSetting::store([
        'acknowledgment_subject' => 'Candidature reçue, {nom}',
        'acknowledgment_body' => "Bonjour {nom},\n\nMerci pour : {poste}.\nÀ bientôt,\r\n\r\n\r\nL’équipe RH",
        'acknowledgment_reply_to' => 'rh@dym.ci',
    ]);

    $mail = (new ApplicationReceived('Awa Koné', null))->toMail(new AnonymousNotifiable);

    expect($mail->subject)->toBe('Candidature reçue, Awa Koné')
        ->and($mail->replyTo)->toBe([['rh@dym.ci', null]])
        ->and(CandidateMail::paragraphs(RecruitmentSetting::values()['acknowledgment_body']))->toBe([
            'Bonjour {nom},',
            "Merci pour : {poste}.  \nÀ bientôt,",
            'L’équipe RH',
        ])
        ->and((string) $mail->render())->toContain('Merci pour : Candidature spontanée.<br>');
});

test('no acknowledgment is sent once switched off', function () {
    RecruitmentSetting::store(['acknowledgment_enabled' => '0']);

    $this->post(route('careers.apply'), applicationData())->assertSessionHasNoErrors();

    Notification::assertSentOnDemand(NewJobApplication::class);
    Notification::assertSentTimes(ApplicationReceived::class, 0);
});

test('the name typed in the form cannot slip a link into the acknowledgment', function () {
    $mail = (new ApplicationReceived('Gagnant [ici](https://evil.example) evil.example <b>', null))->toMail(new AnonymousNotifiable);

    expect((string) $mail->render())
        ->toContain('Bonjour Gagnant ici https evil example evil example b,')
        ->not->toContain('evil.example', '<b>');

    $anonymous = (new ApplicationReceived('://', null))->toMail(new AnonymousNotifiable);
    expect((string) $anonymous->render())->toContain('Bonjour Madame, Monsieur,');
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

test('opening a new application marks it as viewed', function () {
    $admin = User::factory()->admin()->create();
    $application = JobApplication::factory()->create();

    $this->actingAs($admin)
        ->get(route('admin.applications.show', $application))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/applications/show')->missing('application.cv_path'));

    expect($application->refresh()->viewed_at)->not->toBeNull();
});

test('each column of the pipeline loads more cards on demand', function () {
    $admin = User::factory()->admin()->create();
    JobApplication::factory()->count(65)->create();
    $first = RecruitmentStage::initial();

    $this->actingAs($admin)
        ->get(route('admin.applications.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('perStage', 60)
            ->where('stages.0.total', 65)
            ->has('stages.0.applications', 60));

    $this->actingAs($admin)
        ->get(route('admin.applications.index', ['shown' => [$first->id => 120]]))
        ->assertInertia(fn (Assert $page) => $page->has('stages.0.applications', 65));

    // Une valeur trop petite ne descend pas sous la page par défaut.
    $this->actingAs($admin)
        ->get(route('admin.applications.index', ['shown' => [$first->id => 5]]))
        ->assertInertia(fn (Assert $page) => $page->has('stages.0.applications', 60));
});

test('the pipeline can show the latest applications first', function () {
    $admin = User::factory()->admin()->create();
    $best = JobApplication::factory()->create(['score' => 90, 'created_at' => now()->subDays(3)]);
    $latest = JobApplication::factory()->create(['score' => 40, 'created_at' => now()]);

    $this->actingAs($admin)
        ->get(route('admin.applications.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.sort', 'score')
            ->where('stages.0.applications.0.id', $best->id));

    $this->actingAs($admin)
        ->get(route('admin.applications.index', ['sort' => 'recent']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.sort', 'recent')
            ->where('stages.0.applications.0.id', $latest->id)
            ->where('stages.0.applications.1.id', $best->id));
});

test('the contacts of selected applications are exported and the export is noted', function () {
    $admin = User::factory()->admin()->create();
    $chosen = JobApplication::factory()
        ->for(JobOffer::factory()->state(['title' => 'Soudeur']))
        ->for(Candidate::factory()->state(['name' => 'Awa Koné', 'email' => 'awa@example.com', 'phone' => '0707070707']))
        ->create();
    $spontaneous = JobApplication::factory()->create();
    $other = JobApplication::factory()->create();

    $this->actingAs($admin)
        ->postJson(route('admin.applications.contacts'), ['action' => 'export', 'ids' => [$chosen->id, $spontaneous->id]])
        ->assertOk()
        ->assertJsonCount(2, 'rows')
        ->assertJsonFragment(['name' => 'Awa Koné', 'phone' => '0707070707', 'email' => 'awa@example.com', 'offer' => 'Soudeur'])
        ->assertJsonFragment(['offer' => 'Candidature spontanée']);

    $event = $chosen->events()->where('type', ApplicationEventType::ContactsExported)->sole();
    expect($event->data)->toBe(['action' => 'export'])
        ->and($event->user_id)->toBe($admin->id)
        ->and($other->events()->where('type', ApplicationEventType::ContactsExported)->exists())->toBeFalse();
});

test('the whole filter result can be exported, cards not loaded included', function () {
    $admin = User::factory()->admin()->create();
    $offer = JobOffer::factory()->create();
    JobApplication::factory()->count(3)->for($offer)->create();
    JobApplication::factory()->create();

    $this->actingAs($admin)
        ->postJson(route('admin.applications.contacts'), ['action' => 'copy', 'all' => true, 'offer' => (string) $offer->id])
        ->assertOk()
        ->assertJsonCount(3, 'rows');

    $this->actingAs($admin)
        ->postJson(route('admin.applications.contacts'), ['action' => 'print', 'ids' => [1]])
        ->assertUnprocessable();
});

test('the details sent by WhatsApp to a third person are previewed, then noted', function () {
    $admin = User::factory()->admin()->create();
    $application = JobApplication::factory()->create(['score' => 82, 'recommendation' => 'priority']);

    $this->actingAs($admin)
        ->postJson(route('admin.applications.contacts'), ['action' => 'preview', 'ids' => [$application->id]])
        ->assertOk()
        ->assertJsonPath('rows.0.score', 82)
        ->assertJsonPath('rows.0.stage', $application->stage->name)
        ->assertJsonPath('rows.0.url', route('admin.applications.show', $application));

    expect($application->events()->where('type', ApplicationEventType::ContactsExported)->exists())->toBeFalse();

    $this->actingAs($admin)
        ->postJson(route('admin.applications.contacts'), ['action' => 'whatsapp', 'recipient' => '+2250707070707', 'ids' => [$application->id]])
        ->assertOk();

    expect($application->events()->where('type', ApplicationEventType::ContactsExported)->sole()->data)
        ->toBe(['action' => 'whatsapp', 'recipient' => '+2250707070707']);
});

test('the admin overview lists the latest applications', function () {
    $admin = User::factory()->admin()->create();
    $older = JobApplication::factory()->create(['created_at' => now()->subDay()]);
    $latest = JobApplication::factory()->for(JobOffer::factory())->create(['viewed_at' => now()]);

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->has('latestApplications', 2)
            ->where('latestApplications.0.id', $latest->id)
            ->where('latestApplications.0.name', $latest->candidate->display_name)
            ->where('latestApplications.0.offer', $latest->jobOffer->title)
            ->where('latestApplications.0.viewed', true)
            ->where('latestApplications.1.id', $older->id)
            ->where('latestApplications.1.offer', null)
            ->where('latestApplications.1.viewed', false));
});

test('the pipeline can be filtered and an application moved to another stage', function () {
    $admin = User::factory()->admin()->create();
    $offer = JobOffer::factory()->create();
    JobApplication::factory()->for($offer)->create();
    $spontaneous = JobApplication::factory()->create();
    $interview = RecruitmentStage::query()->where('name', 'Entretien')->sole();

    $this->actingAs($admin)
        ->get(route('admin.applications.index', ['offer' => 'spontaneous']))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/applications/index')
            ->where('stages.0.total', 1)
            ->where('stages.0.applications.0.id', $spontaneous->id));

    $this->actingAs($admin)
        ->patch(route('admin.applications.update', $spontaneous), ['stage_id' => $interview->id])
        ->assertRedirect();

    expect($spontaneous->refresh()->stage_id)->toBe($interview->id)
        ->and($spontaneous->events()->where('type', 'stage_changed')->sole()->data)->toBe(['from' => 'Nouvelle', 'to' => 'Entretien']);
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
    expect($application->candidate()->exists())->toBeFalse();
});
