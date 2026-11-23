<?php

use App\Enums\AnalysisStatus;
use App\Enums\StageRole;
use App\Models\Candidate;
use App\Models\JobApplication;
use App\Models\JobOffer;
use App\Models\Psychotest;
use App\Models\RecruitmentSetting;
use App\Models\RecruitmentStage;
use App\Models\User;
use App\Notifications\CandidateMessage;
use App\Recruitment\Ai\ModelGateway;
use App\Recruitment\PsychotestInvitation;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\FakeCandidateAnalyzer;
use Tests\Support\FakeModelGateway;

beforeEach(function () {
    // Indépendant d'une éventuelle ANTHROPIC_API_KEY dans le .env.
    config(['services.anthropic.key' => null]);
    RecruitmentSetting::store(['api_key' => 'sk-ant-test']);
    $this->admin = User::factory()->admin()->create();
});

/**
 * Questions as the model returns them; the right answer is a number.
 *
 * @return array<string, mixed>
 */
function psychotestReply(int $count, string $prefix): array
{
    return ['questions' => array_map(fn (int $i) => [
        'text' => "{$prefix} {$i} : combien font 2 + {$i} ?",
        'options' => [(string) (2 + $i), "a{$i}", "b{$i}", "c{$i}"],
        'answer' => 0,
        'category' => 'Calcul',
    ], range(1, $count))];
}

function analysedApplication(?JobOffer $offer, array $candidate = []): JobApplication
{
    $application = JobApplication::factory()
        ->for(Candidate::factory()->state(['name' => 'Awa Koné', 'email' => 'awa@example.com', ...$candidate]))
        ->create(['job_offer_id' => $offer?->id, 'score' => 82]);

    $application->analyses()->create([
        'status' => AnalysisStatus::Completed,
        'job_offer_id' => $offer?->id,
        'result' => FakeCandidateAnalyzer::result(),
        'finished_at' => now(),
    ]);

    return $application;
}

/**
 * Test opened to the candidate: question q1 expects option 0, q2 option 1.
 */
function sentTest(array $attributes = [], array $candidate = []): Psychotest
{
    $application = analysedApplication(JobOffer::factory()->create(['title' => 'Soudeur TIG']), $candidate);

    return Psychotest::query()->create([
        'job_application_id' => $application->id,
        'token' => Psychotest::newToken(),
        'questions' => [
            ['id' => 'q1', 'text' => 'Combien font 2 + 2 ?', 'options' => ['4', '5', '6', '7'], 'answer' => 0, 'category' => 'Calcul', 'source' => 'offer'],
            ['id' => 'q2', 'text' => 'Que faire d’une pièce non conforme ?', 'options' => ['L’expédier', 'L’isoler et le signaler', 'La cacher', 'La jeter'], 'answer' => 1, 'category' => 'Mise en situation', 'source' => 'candidate'],
        ],
        'duration_minutes' => 30,
        'sent_at' => now(),
        'expires_at' => now()->addDays(7),
        ...$attributes,
    ]);
}

test('the pipeline gets the test and appraisal stages right after the review stage', function () {
    expect(RecruitmentStage::query()->ordered()->get()->map(fn (RecruitmentStage $stage) => [$stage->name, $stage->role?->value])->all())->toBe([
        ['Nouvelle', null],
        ['En cours d’étude', 'review'],
        ['Test psychotechnique', 'psychotest'],
        ['Appréciation DG', 'dg_review'],
        ['Entretien', null],
        ['Retenue', null],
        ['Refusée', null],
    ]);
});

test('the assessment pages are reserved to admins', function (string $method, string $route) {
    $application = JobApplication::factory()->create();

    $this->actingAs(User::factory()->create())
        ->{$method}(route($route, $application))
        ->assertForbidden();
})->with([
    ['post', 'admin.applications.psychotest.prepare'],
    ['put', 'admin.applications.dg-review.update'],
    ['get', 'admin.applications.email.draft'],
    ['post', 'admin.applications.email.send'],
]);

test('the process settings are saved', function () {
    $this->actingAs($this->admin)
        ->put(route('admin.recruitment.settings.process.update'), [
            'auto_advance' => '1',
            'auto_advance_threshold' => '60',
            'psychotest_duration' => '20',
            'psychotest_validity_days' => '3',
            'dg_criteria' => "Motivation\n\n  Rigueur \nMotivation",
        ])
        ->assertRedirect(route('admin.recruitment.settings.edit'));

    expect(RecruitmentSetting::values())->toMatchArray([
        'auto_advance' => true,
        'auto_advance_threshold' => 60,
        'psychotest_duration' => 20,
        'psychotest_validity_days' => 3,
        'dg_criteria' => ['Motivation', 'Rigueur'],
    ]);

    $this->actingAs($this->admin)
        ->put(route('admin.recruitment.settings.process.update'), [
            'auto_advance_threshold' => '101',
            'psychotest_duration' => '20',
            'psychotest_validity_days' => '3',
            'dg_criteria' => '',
        ])
        ->assertSessionHasErrors(['auto_advance_threshold', 'dg_criteria']);
});

test('the team moves at once the waiting applications that reach the threshold', function () {
    $high = JobApplication::factory()->create(['score' => 80]);
    $low = JobApplication::factory()->create(['score' => 60]);
    $interview = RecruitmentStage::query()->where('name', 'Entretien')->sole();
    $moved = JobApplication::factory()->create(['score' => 90, 'stage_id' => $interview->id]);

    $this->actingAs($this->admin)
        ->get(route('admin.recruitment.settings.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('autoAdvance.pending', 1)
            ->where('autoAdvance.from', 'Nouvelle')
            ->where('autoAdvance.to', 'En cours d’étude'));

    $this->actingAs($this->admin)
        ->post(route('admin.recruitment.settings.process.apply'))
        ->assertInertiaFlash('toast', ['type' => 'success', 'message' => '1 candidature(s) déplacée(s).']);

    expect($high->refresh()->stage->role)->toBe(StageRole::Review)
        ->and($low->refresh()->stage_id)->toBe(RecruitmentStage::initial()->id)
        ->and($moved->refresh()->stage_id)->toBe($interview->id)
        ->and($high->events()->where('type', 'stage_changed')->sole()->data)->toBe([
            'from' => 'Nouvelle', 'to' => 'En cours d’étude', 'auto' => true, 'score' => 80,
        ]);

    RecruitmentSetting::store(['auto_advance' => '0']);
    JobApplication::factory()->create(['score' => 99]);

    $this->actingAs($this->admin)->post(route('admin.recruitment.settings.process.apply'));
    expect(JobApplication::query()->where('stage_id', RecruitmentStage::initial()->id)->count())->toBe(2);
});

test('the AI prepares a test from the base of the offer and the analysis of the candidate', function () {
    $gateway = new FakeModelGateway([psychotestReply(15, 'Base'), psychotestReply(5, 'Perso'), psychotestReply(5, 'Autre')]);
    app()->instance(ModelGateway::class, $gateway);
    $offer = JobOffer::factory()->create(['title' => 'Soudeur TIG']);
    $application = analysedApplication($offer);

    $this->actingAs($this->admin)
        ->post(route('admin.applications.psychotest.prepare', $application))
        ->assertRedirect()
        ->assertInertiaFlash('toast', ['type' => 'success', 'message' => '20 questions préparées : relisez-les avant d’envoyer le test.']);

    $test = $application->psychotest()->sole();
    expect($test->questions)->toHaveCount(20)
        ->and(collect($test->questions)->countBy('source')->all())->toBe(['offer' => 15, 'candidate' => 5])
        ->and($test->sent_at)->toBeNull()
        ->and($test->duration_minutes)->toBe(30)
        ->and($offer->refresh()->psychotest_questions)->toHaveCount(15)
        // Réponses mélangées : la bonne reste repérée.
        ->and(collect($test->questions)->every(fn (array $q) => is_numeric($q['options'][$q['answer']])))->toBeTrue();

    // Les questions personnalisées partent de l'analyse, sans identifier le candidat.
    expect($gateway->text(1))->toContain('Expérience TIG', 'Quelles épaisseurs soudez-vous ?', 'Poste visé : Soudeur TIG')
        ->not->toContain('Awa');

    // Un autre candidat du même poste reprend la base : un seul appel à l'IA.
    $this->actingAs($this->admin)->post(route('admin.applications.psychotest.prepare', analysedApplication($offer, ['email' => 'kofi@example.com'])));

    expect($gateway->calls)->toHaveCount(3)
        ->and(Psychotest::query()->latest('id')->first()->questions)->toHaveCount(20);
});

test('a test cannot be prepared again once sent', function () {
    $test = sentTest();
    app()->instance(ModelGateway::class, $gateway = new FakeModelGateway);

    $this->actingAs($this->admin)
        ->post(route('admin.applications.psychotest.prepare', $test->application))
        ->assertInertiaFlash('toast', ['type' => 'error', 'message' => 'Ce test a déjà été envoyé : supprimez-le pour en préparer un autre.']);

    expect($gateway->calls)->toBe([]);
});

test('the team edits the questions until the candidate starts', function () {
    $test = sentTest(['sent_at' => null, 'expires_at' => null]);
    $question = ['text' => 'Nouvelle question ?', 'options' => ['Oui', 'Non', 'Peut-être', 'Jamais'], 'answer' => 2, 'category' => 'Logique'];

    $this->actingAs($this->admin)
        ->put(route('admin.applications.psychotest.update', $test->application), [
            'questions' => [$test->questions[0], $question],
        ])
        ->assertSessionHasNoErrors();

    $questions = $test->refresh()->questions;
    expect($questions)->toHaveCount(2)
        ->and($questions[0]['id'])->toBe('q1')
        ->and($questions[1])->toMatchArray(['text' => 'Nouvelle question ?', 'answer' => 2, 'source' => 'manual'])
        ->and($questions[1]['id'])->toStartWith('q');

    $this->actingAs($this->admin)
        ->put(route('admin.applications.psychotest.update', $test->application), [
            'questions' => [[...$question, 'options' => ['Oui', 'Oui', 'Non', 'Jamais']]],
        ])
        ->assertSessionHasErrors('questions.0.options.1');

    $test->update(['sent_at' => now(), 'started_at' => now()]);

    $this->actingAs($this->admin)
        ->put(route('admin.applications.psychotest.update', $test->application), ['questions' => [$question]])
        ->assertSessionHasErrors('psychotest');
});

test('the test is sent by WhatsApp and the candidate joins the test column', function () {
    $test = sentTest(['sent_at' => null, 'expires_at' => null], ['phone' => '07 00 00 00 00']);
    $application = $test->application;

    $this->actingAs($this->admin)
        ->get(route('admin.applications.show', $application))
        ->assertInertia(fn (Assert $page) => $page
            ->where('application.psychotest.status', 'draft')
            ->where('application.psychotest.whatsapp_url', fn (string $url) => str_starts_with($url, 'https://wa.me/2250700000000?text=')
                && str_contains(rawurldecode($url), $test->url())
                && str_contains(rawurldecode($url), 'Bonjour Awa Koné,')));

    $this->actingAs($this->admin)
        ->post(route('admin.applications.psychotest.send', $application), ['channel' => 'whatsapp'])
        ->assertSessionHasNoErrors();

    $test->refresh();
    expect($test->sent_at)->not->toBeNull()
        ->and($test->expires_at->isSameDay(now()->addDays(7)))->toBeTrue()
        ->and($application->refresh()->stage->role)->toBe(StageRole::Psychotest)
        ->and($application->events()->where('type', 'psychotest_sent')->sole()->data)->toBe(['channel' => 'whatsapp']);
});

test('the test link can be e-mailed', function () {
    Notification::fake();
    $test = sentTest(['sent_at' => null, 'expires_at' => null]);

    $this->actingAs($this->admin)
        ->post(route('admin.applications.psychotest.send', $test->application), ['channel' => 'email'])
        ->assertInertiaFlash('toast', ['type' => 'success', 'message' => 'Test envoyé à awa@example.com.']);

    Notification::assertSentOnDemand(
        CandidateMessage::class,
        fn (CandidateMessage $message, array $channels, AnonymousNotifiable $notifiable) => $notifiable->routes['mail'] === 'awa@example.com'
            && $message->subject === PsychotestInvitation::SUBJECT
            && str_contains($message->body, $test->url())
            && str_contains($message->body, '2 questions, 30 minutes'),
    );
});

test('the candidate sees the questions but never the right answers nor the score', function () {
    $test = sentTest();

    $this->get(route('psychotest.show', $test->token))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('test-psychotechnique')
            ->where('status', 'sent')
            ->where('greeting', 'Awa Koné')
            ->where('count', 2)
            ->where('questions', []));

    $this->post(route('psychotest.start', $test->token))->assertRedirect();

    $this->get(route('psychotest.show', $test->token))
        ->assertInertia(fn (Assert $page) => $page
            ->where('status', 'started')
            ->has('questions', 2)
            ->where('questions.0', ['id' => 'q1', 'text' => 'Combien font 2 + 2 ?', 'options' => ['4', '5', '6', '7']])
            ->missing('score'));

    $this->post(route('psychotest.submit', $test->token), ['answers' => ['q1' => 0, 'q2' => 3]])->assertRedirect();

    $this->get(route('psychotest.show', $test->token))
        ->assertInertia(fn (Assert $page) => $page->where('status', 'completed')->where('questions', [])->missing('score'));

    $test->refresh();
    expect($test->score)->toBe(50)
        ->and($test->answers)->toBe(['q1' => 0, 'q2' => 3])
        ->and($test->application->test_score)->toBe(50)
        ->and($test->application->events()->where('type', 'psychotest_completed')->sole()->data)->toMatchArray(['score' => 50]);

    // Une seule tentative : un second envoi ne change rien.
    $this->post(route('psychotest.submit', $test->token), ['answers' => ['q1' => 0, 'q2' => 1]]);
    expect($test->refresh()->score)->toBe(50);
});

test('a draft test is unreachable and late answers are not recorded', function () {
    $draft = sentTest(['sent_at' => null, 'expires_at' => null]);
    $this->get(route('psychotest.show', $draft->token))->assertNotFound();

    $late = sentTest(['started_at' => now()->subMinutes(40)], ['email' => 'kofi@example.com']);

    $this->post(route('psychotest.submit', $late->token), ['answers' => ['q1' => 0]])->assertRedirect();
    $this->get(route('psychotest.show', $late->token))->assertInertia(fn (Assert $page) => $page->where('status', 'expired'));

    expect($late->refresh()->completed_at)->toBeNull()
        ->and($late->application->test_score)->toBeNull();
});

test('phone numbers are written the way WhatsApp expects them', function (?string $phone, ?string $expected) {
    expect(PsychotestInvitation::internationalNumber($phone))->toBe($expected);
})->with([
    ['07 00 00 00 00', '2250700000000'],
    ['+225 07 00 00 00 00', '2250700000000'],
    ['00225 0700000000', '2250700000000'],
    ['+33 6 12 34 56 78', '33612345678'],
    ['07 00 00', null],
    [null, null],
]);

test('the managing director scores each criterion of the grid', function () {
    RecruitmentSetting::store(['dg_criteria' => "Motivation\nRigueur"]);
    $application = JobApplication::factory()->create();

    $this->actingAs($this->admin)
        ->put(route('admin.applications.dg-review.update', $application), ['scores' => [5, 3], 'comment' => '  Très motivé  '])
        ->assertInertiaFlash('toast', ['type' => 'success', 'message' => 'Appréciation DG enregistrée : 80 / 100.']);

    $application->refresh();
    expect($application->dg_score)->toBe(80)
        ->and($application->dg_review)->toBe([['criterion' => 'Motivation', 'score' => 5], ['criterion' => 'Rigueur', 'score' => 3]])
        ->and($application->dg_comment)->toBe('Très motivé')
        ->and($application->dg_reviewed_by_id)->toBe($this->admin->id)
        ->and($application->events()->where('type', 'dg_reviewed')->sole()->data)->toBe(['score' => 80]);

    $this->actingAs($this->admin)
        ->get(route('admin.applications.index'))
        ->assertInertia(fn (Assert $page) => $page->where('stages.0.applications.0.dg_score', 80));

    $this->actingAs($this->admin)
        ->put(route('admin.applications.dg-review.update', $application), ['scores' => [5]])
        ->assertSessionHasErrors(['scores' => 'Notez chaque critère.']);

    $this->actingAs($this->admin)
        ->put(route('admin.applications.dg-review.update', $application), ['scores' => [6, 1]])
        ->assertSessionHasErrors('scores.0');
});
