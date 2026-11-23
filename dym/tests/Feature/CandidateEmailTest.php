<?php

use App\Models\Candidate;
use App\Models\JobApplication;
use App\Models\JobOffer;
use App\Models\RecruitmentStage;
use App\Models\User;
use App\Notifications\CandidateMessage;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

function emailedApplication(array $candidate = []): JobApplication
{
    return JobApplication::factory()
        ->for(Candidate::factory()->state(['name' => 'Awa Koné', 'email' => 'awa@example.com', ...$candidate]))
        ->for(JobOffer::factory()->state(['title' => 'Soudeur TIG']))
        ->create();
}

test('the interview, hired and rejected stages propose an e-mail', function () {
    expect(RecruitmentStage::query()->ordered()->get()->filter->hasEmail()->pluck('name')->all())
        ->toBe(['Entretien', 'Retenue', 'Refusée']);
});

test('the e-mail of a stage is prepared, edited and sent by the team, then kept in the history', function () {
    Notification::fake();
    $application = emailedApplication();
    $interview = RecruitmentStage::query()->where('name', 'Entretien')->sole();

    // Changer d'étape n'envoie rien : l'e-mail est seulement proposé.
    $this->actingAs($this->admin)
        ->patch(route('admin.applications.update', $application), ['stage_id' => $interview->id])
        ->assertRedirect();
    Notification::assertNothingSent();

    $this->actingAs($this->admin)
        ->getJson(route('admin.applications.email.draft', ['application' => $application, 'stage_id' => $interview->id]))
        ->assertOk()
        ->assertJson([
            'name' => 'Awa Koné',
            'to' => 'awa@example.com',
            'stage' => 'Entretien',
            'subject' => 'Invitation à un entretien – DYM Manufacture',
            'sent_at' => null,
        ])
        ->assertJsonPath('body', fn (string $body) => str_starts_with($body, 'Bonjour Awa Koné,') && str_contains($body, 'Poste : Soudeur TIG'));

    $this->actingAs($this->admin)
        ->post(route('admin.applications.email.send', $application), [
            'subject' => 'Invitation à un entretien',
            'body' => "Bonjour {nom},\n\nDate et heure : lundi à 10 h",
            'stage_id' => $interview->id,
        ])
        ->assertInertiaFlash('toast', ['type' => 'success', 'message' => 'E-mail envoyé à awa@example.com.']);

    Notification::assertSentOnDemand(
        CandidateMessage::class,
        fn (CandidateMessage $message, array $channels, AnonymousNotifiable $notifiable) => $notifiable->routes['mail'] === 'awa@example.com'
            && $message->body === "Bonjour Awa Koné,\n\nDate et heure : lundi à 10 h",
    );

    expect($application->events()->where('type', 'email_sent')->sole()->data)->toMatchArray([
        'to' => 'awa@example.com',
        'subject' => 'Invitation à un entretien',
        'stage_id' => $interview->id,
        'stage' => 'Entretien',
    ]);

    $this->actingAs($this->admin)
        ->getJson(route('admin.applications.email.draft', ['application' => $application, 'stage_id' => $interview->id]))
        ->assertJsonPath('sent_at', fn (?string $sentAt) => $sentAt !== null);
});

test('a free message starts with a greeting and a signature', function () {
    $this->actingAs($this->admin)
        ->getJson(route('admin.applications.email.draft', emailedApplication()))
        ->assertJson(['stage' => null, 'subject' => '', 'sent_at' => null])
        ->assertJsonPath('body', "Bonjour Awa Koné,\n\n\n\nCordialement,\nL’équipe DYM Manufacture");
});

test('no e-mail without address, and a failed sending keeps the text in the window', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.applications.email.send', emailedApplication(['email' => null])), ['subject' => 'Objet', 'body' => 'Texte'])
        ->assertSessionHasErrors(['to' => 'Ce candidat n’a pas d’adresse e-mail : complétez sa fiche.']);

    // Serveur SMTP injoignable : l'envoi échoue sans quitter la machine.
    config([
        'mail.default' => 'smtp',
        'mail.mailers.smtp.host' => '127.0.0.1',
        'mail.mailers.smtp.port' => 1,
        'mail.mailers.smtp.timeout' => 2,
    ]);
    $application = emailedApplication(['email' => 'kofi@example.com']);

    $this->actingAs($this->admin)
        ->post(route('admin.applications.email.send', $application), ['subject' => 'Objet', 'body' => 'Texte'])
        ->assertSessionHasErrors('send');

    expect($application->events()->where('type', 'email_sent')->exists())->toBeFalse();
});

test('admins set or remove the e-mail of a stage', function () {
    $stage = RecruitmentStage::query()->where('name', 'En cours d’étude')->sole();

    $this->actingAs($this->admin)
        ->put(route('admin.recruitment.stages.email.update', $stage), ['email_subject' => ' Votre dossier ', 'email_body' => 'Bonjour {nom}'])
        ->assertRedirect(route('admin.recruitment.settings.edit'));
    expect($stage->refresh()->hasEmail())->toBeTrue()
        ->and($stage->email_subject)->toBe('Votre dossier');

    $this->actingAs($this->admin)
        ->put(route('admin.recruitment.stages.email.update', $stage), ['email_subject' => 'Objet seul', 'email_body' => ''])
        ->assertSessionHasErrors('email_body');

    $this->actingAs($this->admin)
        ->put(route('admin.recruitment.stages.email.update', $stage), ['email_subject' => '', 'email_body' => ''])
        ->assertSessionHasNoErrors();
    expect($stage->refresh()->hasEmail())->toBeFalse()
        ->and($stage->email_subject)->toBeNull();
});
