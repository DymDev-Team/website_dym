<?php

use App\Enums\AnalysisStatus;
use App\Enums\Recommendation;
use App\Models\AiCall;
use App\Models\Candidate;
use App\Models\CandidateMatch;
use App\Models\JobApplication;
use App\Models\JobOffer;
use App\Models\RecruitmentSetting;
use App\Models\User;
use App\Recruitment\Ai\AnalysisPrompt;
use App\Recruitment\Ai\CandidateAnalyzer;
use App\Recruitment\Ai\ModelCall;
use App\Recruitment\Ai\ModelGateway;
use App\Recruitment\AnalysisRunner;
use App\Recruitment\CandidateSourcing;
use App\Recruitment\Exceptions\TransientAnalysisError;
use App\Recruitment\Scoring;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\FakeCandidateAnalyzer;
use Tests\Support\FakeModelGateway;

beforeEach(function () {
    Storage::fake('local');
    Storage::disk('local')->put('applications/cv.pdf', '%PDF-1.4');
    Notification::fake();
    // Indépendant d'une éventuelle ANTHROPIC_API_KEY dans le .env.
    config(['services.anthropic.key' => null]);
    RecruitmentSetting::store(['api_key' => 'sk-ant-test']);
    config(['recruitment.background' => 'after_response']);
    $this->admin = User::factory()->admin()->create();
});

function fakeGateway(array $replies): FakeModelGateway
{
    $fake = new FakeModelGateway($replies);
    app()->instance(ModelGateway::class, $fake);

    return $fake;
}

function weldingGrid(): array
{
    return [
        ['name' => 'Soudure TIG', 'weight' => 5, 'essential' => true],
        ['name' => 'Lecture de plans', 'weight' => 3, 'essential' => false],
        ['name' => 'Habilitation électrique', 'weight' => 2, 'essential' => false],
    ];
}

// --- Note calculée à partir de la grille ---------------------------------

test('the score is the weighted average of the grid, not the model’s own figure', function () {
    $evaluation = Scoring::apply([
        'score' => 95,
        'recommendation' => 'priority',
        'criteria' => [
            ['name' => 'lecture de plans', 'score' => 6, 'evidence' => 'Plans d’ensemble'],
            ['name' => 'Soudure TIG', 'score' => 9, 'evidence' => '5 ans de TIG'],
        ],
        'concerns' => [],
    ], weldingGrid());

    // (5×9 + 3×6 + 2×0) / (10 × 10) = 63 %, le critère oublié compte pour 0.
    expect($evaluation['score'])->toBe(63)
        ->and($evaluation['model_score'])->toBe(95)
        ->and(array_column($evaluation['criteria'], 'name'))->toBe(['Soudure TIG', 'Lecture de plans', 'Habilitation électrique'])
        ->and($evaluation['criteria'][2]['evidence'])->toBe('Non évalué.')
        ->and($evaluation['recommendation'])->toBe('consider');
});

test('a missing essential criterion caps the opinion and is flagged', function () {
    $evaluation = Scoring::apply([
        'score' => 90,
        'recommendation' => 'priority',
        'criteria' => [
            ['name' => 'Soudure TIG', 'score' => 3, 'evidence' => 'Notions'],
            ['name' => 'Lecture de plans', 'score' => 10, 'evidence' => 'Expert'],
            ['name' => 'Habilitation électrique', 'score' => 10, 'evidence' => 'B1V'],
        ],
        'concerns' => ['Disponibilité à confirmer.'],
    ], [
        ['name' => 'Soudure TIG', 'weight' => 1, 'essential' => true],
        ['name' => 'Lecture de plans', 'weight' => 5, 'essential' => false],
        ['name' => 'Habilitation électrique', 'weight' => 5, 'essential' => false],
    ]);

    expect($evaluation['score'])->toBe(94)
        ->and($evaluation['recommendation'])->toBe('consider')
        ->and($evaluation['concerns'][0])->toBe('Critère indispensable non démontré : Soudure TIG.');
});

test('the opinion thresholds are set in the admin', function () {
    expect(Scoring::recommendation(70))->toBe(Recommendation::Consider);

    RecruitmentSetting::store(['priority_threshold' => '65', 'consider_threshold' => '40']);

    expect(Scoring::recommendation(70))->toBe(Recommendation::Priority)
        ->and(Scoring::recommendation(45))->toBe(Recommendation::Consider)
        ->and(Scoring::recommendation(39))->toBe(Recommendation::NotMatching);
});

test('an analysis for an offer with a grid scores the grid and logs its cost', function () {
    $fake = new FakeCandidateAnalyzer(['evaluation' => ['score' => 99, 'criteria' => [
        ['name' => 'Soudure TIG', 'score' => 8, 'evidence' => 'TIG inox'],
        ['name' => 'Lecture de plans', 'score' => 8, 'evidence' => 'Plans'],
        ['name' => 'Habilitation électrique', 'score' => 8, 'evidence' => 'B1V'],
    ]]]);
    app()->instance(CandidateAnalyzer::class, $fake);
    $offer = JobOffer::factory()->create(['criteria' => weldingGrid()]);
    $application = JobApplication::factory()->for($offer)->create(['answers' => [['id' => 'dispo', 'label' => 'Disponibilité ?', 'answer' => 'Immédiate']]]);
    $runner = app(AnalysisRunner::class);

    $runner->run($runner->request($application, runAfterResponse: false));

    expect($application->refresh()->score)->toBe(80)
        ->and($application->recommendation)->toBe(Recommendation::Priority)
        ->and($fake->requests[0]->answers)->toBe([['label' => 'Disponibilité ?', 'answer' => 'Immédiate']])
        ->and(AiCall::query()->sole())->task->toBe(AiCall::CV_ANALYSIS)->job_offer_id->toBe($offer->id);
});

test('the grid and the answers reach the model, the grid only for the target offer', function () {
    $offer = JobOffer::factory()->make(['id' => 3, 'criteria' => weldingGrid()]);

    $application = AnalysisPrompt::application($offer, null, [['label' => 'Permis B ?', 'answer' => 'oui']]);
    $system = AnalysisPrompt::system(collect([$offer]), ['Soudure'], null);

    expect($application)->toContain('- Soudure TIG (poids 5/5, indispensable)')
        ->toContain("<reponses_du_candidat>\nQuestion : Permis B ?\nRéponse : oui")
        ->and($system)->not->toContain('Grille d’évaluation')->not->toContain('poids 5/5');
});

// --- Grille et questions dans le formulaire des offres -------------------

function offerPayload(array $overrides = []): array
{
    return [
        'title' => 'Soudeur TIG',
        'contract_type' => 'CDI',
        'location' => 'Abidjan',
        'is_published' => '1',
        'criteria' => [
            ['name' => ' Soudure TIG ', 'weight' => '5', 'essential' => '1'],
            ['name' => 'Lecture de plans', 'weight' => '3'],
        ],
        'questions' => [
            ['id' => 'dispo', 'label' => 'Quand pouvez-vous commencer ?', 'type' => 'choice', 'options' => "Immédiatement\nSous 1 mois\n\nSous 1 mois", 'required' => '1'],
            ['id' => 'permis', 'label' => 'Avez-vous le permis B ?', 'type' => 'yes_no'],
        ],
        ...$overrides,
    ];
}

test('the grid and the questions are saved in their clean form', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.job-offers.store'), offerPayload())
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.job-offers.index'));

    $offer = JobOffer::query()->sole();

    expect($offer->criteria)->toBe([
        ['name' => 'Soudure TIG', 'weight' => 5, 'essential' => true],
        ['name' => 'Lecture de plans', 'weight' => 3, 'essential' => false],
    ])->and($offer->questions)->toBe([
        ['id' => 'dispo', 'label' => 'Quand pouvez-vous commencer ?', 'type' => 'choice', 'options' => ['Immédiatement', 'Sous 1 mois'], 'required' => true],
        ['id' => 'permis', 'label' => 'Avez-vous le permis B ?', 'type' => 'yes_no', 'options' => [], 'required' => false],
    ]);
});

test('invalid grids and questions are refused', function (array $overrides, string $error) {
    $this->actingAs($this->admin)
        ->post(route('admin.job-offers.store'), offerPayload($overrides))
        ->assertSessionHasErrors($error);
})->with([
    'poids hors limites' => [['criteria' => [['name' => 'TIG', 'weight' => '9']]], 'criteria.0.weight'],
    'critères en double' => [['criteria' => [['name' => 'TIG', 'weight' => '2'], ['name' => 'tig', 'weight' => '3']]], 'criteria.1.name'],
    'choix sans réponses' => [['questions' => [['id' => 'q1', 'label' => 'Ville ?', 'type' => 'choice', 'options' => 'Abidjan']]], 'questions.0.options'],
    'type inconnu' => [['questions' => [['id' => 'q1', 'label' => 'Ville ?', 'type' => 'fichier']]], 'questions.0.type'],
]);

test('the grid stays internal: the site never receives it', function () {
    $offer = JobOffer::factory()->create(['criteria' => weldingGrid(), 'questions' => [['id' => 'q1', 'label' => 'Permis ?', 'type' => 'yes_no', 'options' => [], 'required' => false]]]);

    $this->get(route('careers.show', $offer))
        ->assertInertia(fn (Assert $page) => $page->missing('offer.criteria')->has('offer.questions', 1));
    $this->get(route('careers.index'))
        ->assertInertia(fn (Assert $page) => $page->missing('offers.0.criteria'));
    $this->actingAs($this->admin)->get(route('admin.job-offers.edit', $offer))
        ->assertInertia(fn (Assert $page) => $page->has('offer.criteria', 3));
});

// --- Questions dans le formulaire public ---------------------------------

function applyWith(JobOffer $offer, array $answers): TestResponse
{
    return test()->post(route('careers.apply'), [
        'name' => 'Awa Koné',
        'email' => 'awa@example.com',
        'cv' => UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf'),
        'consent' => '1',
        'job_offer_id' => $offer->id,
        'answers' => $answers,
    ]);
}

test('candidates answer the offer’s questions, stored with the question as asked', function () {
    app()->instance(CandidateAnalyzer::class, new FakeCandidateAnalyzer);
    $offer = JobOffer::factory()->create(['questions' => [
        ['id' => 'dispo', 'label' => 'Quand pouvez-vous commencer ?', 'type' => 'choice', 'options' => ['Immédiatement', 'Sous 1 mois'], 'required' => true],
        ['id' => 'permis', 'label' => 'Permis B ?', 'type' => 'yes_no', 'options' => [], 'required' => false],
        ['id' => 'annees', 'label' => 'Années de TIG', 'type' => 'number', 'options' => [], 'required' => false],
    ]]);

    applyWith($offer, ['permis' => 'oui'])->assertSessionHasErrors(['answers.dispo' => 'Le champ « Quand pouvez-vous commencer ? » est obligatoire.']);
    applyWith($offer, ['dispo' => 'Demain'])->assertSessionHasErrors('answers.dispo');
    applyWith($offer, ['dispo' => 'Sous 1 mois', 'annees' => 'beaucoup'])->assertSessionHasErrors('answers.annees');
    expect(JobApplication::query()->count())->toBe(0);

    applyWith($offer, ['dispo' => 'Sous 1 mois', 'permis' => 'non', 'injecte' => 'ignoré'])->assertSessionHasNoErrors();

    expect(JobApplication::query()->sole()->answers)->toBe([
        ['id' => 'dispo', 'label' => 'Quand pouvez-vous commencer ?', 'answer' => 'Sous 1 mois'],
        ['id' => 'permis', 'label' => 'Permis B ?', 'answer' => 'non'],
    ]);
});

// --- Assistant de rédaction ----------------------------------------------

test('the AI suggests a grid for the offer being written', function () {
    $fake = fakeGateway([[
        'criteria' => [
            ['name' => ' Soudure TIG ', 'weight' => 5, 'essential' => true],
            ['name' => 'Lecture de plans', 'weight' => 3, 'essential' => false],
        ],
    ]]);

    $this->actingAs($this->admin)
        ->postJson(route('admin.job-offers.assistant.criteria'), ['title' => 'Soudeur TIG', 'requirements' => 'TIG inox'])
        ->assertOk()
        ->assertJsonPath('criteria.0', ['name' => 'Soudure TIG', 'weight' => 5, 'essential' => true]);

    expect($fake->calls[0]->effort)->toBe('low')
        ->and($fake->text())->toContain('Intitulé : Soudeur TIG')->toContain('Profil recherché : TIG inox')
        ->and($fake->calls[0]->system)->toContain('Aucune exigence discriminatoire')
        ->and(AiCall::query()->sole()->task)->toBe(AiCall::OFFER_CRITERIA);
});

test('the AI drafts a whole offer from a brief', function () {
    fakeGateway([[
        'title' => 'Chaudronnier confirmé',
        'department' => 'Atelier',
        'contract_type' => 'CDI',
        'location' => 'Abidjan',
        'summary' => 'Rejoignez notre atelier.',
        'description' => "Traçage et découpe.\n\nAssemblage.",
        'requirements' => "5 ans d’expérience\nLecture de plans",
        'criteria' => [['name' => 'Chaudronnerie', 'weight' => 5, 'essential' => true]],
        'questions' => [
            ['label' => 'Disponibilité ?', 'type' => 'choice', 'options' => ['Immédiate', 'Sous 1 mois'], 'required' => true],
            ['label' => 'Permis B ?', 'type' => 'yes_no', 'options' => ['inutile'], 'required' => false],
        ],
    ]]);

    $this->actingAs($this->admin)
        ->postJson(route('admin.job-offers.assistant.draft'), ['brief' => 'Intitulé : Chaudronnier'])
        ->assertOk()
        ->assertJsonPath('draft.title', 'Chaudronnier confirmé')
        ->assertJsonPath('draft.criteria.0.essential', true)
        ->assertJsonPath('draft.questions.0.options', ['Immédiate', 'Sous 1 mois'])
        ->assertJsonPath('draft.questions.1.options', [])
        ->assertJsonPath('draft.questions.1.type', 'yes_no');
});

test('assistant failures come back as readable messages', function (Closure $setup, string $message) {
    $setup();

    $this->actingAs($this->admin)
        ->postJson(route('admin.job-offers.assistant.criteria'), ['title' => 'Soudeur'])
        ->assertStatus(422)
        ->assertJsonPath('message', $message);
})->with([
    'IA désactivée' => [fn () => RecruitmentSetting::store(['ai_enabled' => '0']), 'L’analyse par IA est désactivée.'],
    'réponse non conforme' => [fn () => fakeGateway([['criteria' => [['name' => 'TIG', 'weight' => 12, 'essential' => true]]]]), 'Réponse de l’IA non conforme : Grille d’évaluation non conforme.'],
    'service indisponible' => [fn () => fakeGateway([new TransientAnalysisError('Service d’IA momentanément indisponible : 529')]), 'Service d’IA momentanément indisponible : 529'],
]);

// --- Recherche dans la base de CV ----------------------------------------

function profiledCandidate(string $name, array $skills = ['Soudure TIG']): Candidate
{
    $candidate = Candidate::factory()->create([
        'name' => $name,
        'email' => str($name)->slug().'@example.com',
        'skills' => $skills,
        'summary' => "{$name} : soudeur d’atelier.",
        'profile' => ['headline' => 'Soudeur', 'languages' => ['Français'], 'certifications' => [], 'education' => [], 'experiences' => []],
    ]);
    JobApplication::factory()->for($candidate)->create();

    return $candidate;
}

test('the CV library is scored chunk by chunk from anonymised profiles', function () {
    $offer = JobOffer::factory()->create(['criteria' => weldingGrid()]);
    $candidates = collect(range(1, CandidateSourcing::CHUNK + 2))->map(fn (int $i) => profiledCandidate("Candidat {$i}"));
    Candidate::factory()->create(['summary' => null]); // jamais analysé : ignoré
    $applied = profiledCandidate('Déjà candidat');
    JobApplication::factory()->for($applied)->for($offer)->create(); // déjà dans le pipeline : ignoré

    $scoreAll = fn (ModelCall $call) => ['matches' => collect(json_decode('['.preg_replace('/.*?<profil id="(\d+)">.*?<\/profil>/s', '$1,', $call->content[0]['text']).'0]'))
        ->filter()->map(fn (int $id) => ['candidate_id' => $id, 'score' => 40 + $id % 50, 'reason' => 'Bonne base TIG.'])->values()->all()];
    $fake = fakeGateway([$scoreAll, $scoreAll]);
    $sourcing = app(CandidateSourcing::class);

    $this->actingAs($this->admin)->post(route('admin.job-offers.sourcing.start', $offer))->assertRedirect();

    $this->actingAs($this->admin)->postJson(route('admin.job-offers.sourcing.next', $offer))
        ->assertOk()->assertJson(['processed' => CandidateSourcing::CHUNK, 'remaining' => 2]);
    $this->actingAs($this->admin)->postJson(route('admin.job-offers.sourcing.next', $offer))
        ->assertJson(['processed' => 2, 'remaining' => 0]);

    expect(CandidateMatch::query()->count())->toBe($candidates->count())
        ->and($sourcing->pending($offer->refresh())->count())->toBe(0)
        ->and($fake->text())->toContain('<profil id="'.$candidates[0]->id.'">')
        ->not->toContain('Candidat 1')->not->toContain('@example.com')
        ->and($fake->calls[0]->system)->toContain('Soudure TIG (poids 5/5, indispensable)')
        ->and(AiCall::query()->where('task', AiCall::SOURCING)->count())->toBe(2);

    // Nouvelle recherche : tout est réévalué, sans doublon.
    $this->travel(2)->seconds();
    fakeGateway([$scoreAll, $scoreAll]);
    $this->actingAs($this->admin)->post(route('admin.job-offers.sourcing.start', $offer));
    $this->actingAs($this->admin)->postJson(route('admin.job-offers.sourcing.next', $offer))->assertJson(['remaining' => 2]);
    expect(CandidateMatch::query()->count())->toBe($candidates->count());
});

test('a profile the model skipped is still marked as done', function () {
    $offer = JobOffer::factory()->create();
    $candidate = profiledCandidate('Oublié');
    fakeGateway([['matches' => []]]);
    $sourcing = app(CandidateSourcing::class);
    $sourcing->start($offer);

    expect($sourcing->next($offer))->toMatchArray(['processed' => 1, 'remaining' => 0])
        ->and(CandidateMatch::query()->sole())->score->toBe(0)->reason->toBe('Profil non évalué par l’IA.');
});

test('two tabs never pay twice for the same chunk', function () {
    $offer = JobOffer::factory()->create();
    profiledCandidate('Unique');
    $fake = fakeGateway([]);
    $sourcing = app(CandidateSourcing::class);
    $sourcing->start($offer);

    $lock = Cache::lock("recruitment-sourcing-{$offer->id}", 60);
    $lock->get();

    expect($sourcing->next($offer))->toMatchArray(['busy' => true, 'processed' => 0, 'remaining' => 1])
        ->and($fake->calls)->toBe([]);

    $lock->release();
});

test('a library candidate joins the pipeline with a copy of their CV, analysed for the offer', function () {
    app()->instance(CandidateAnalyzer::class, new FakeCandidateAnalyzer);
    $offer = JobOffer::factory()->create();
    $candidate = profiledCandidate('Awa Koné');
    CandidateMatch::query()->create(['job_offer_id' => $offer->id, 'candidate_id' => $candidate->id, 'score' => 77, 'reason' => 'TIG']);

    $this->actingAs($this->admin)->get(route('admin.job-offers.sourcing.show', $offer))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/job-offers/sourcing')
            ->where('matches.0.candidate.id', $candidate->id)
            ->where('matches.0.candidate.application_id', null)
            ->where('eligible', 1));

    $this->actingAs($this->admin)->post(route('admin.job-offers.sourcing.add', [$offer, $candidate]))->assertRedirect();
    $this->actingAs($this->admin)->post(route('admin.job-offers.sourcing.add', [$offer, $candidate]))->assertRedirect();

    $application = $candidate->applications()->where('job_offer_id', $offer->id)->sole();
    $original = $candidate->applications()->whereNull('job_offer_id')->sole();

    expect($application->cv_path)->not->toBe($original->cv_path)
        ->and($application->source->label)->toBe('Base de CV')
        ->and($application->events()->where('type', 'sourced')->sole()->data)->toBe(['score' => 77])
        ->and($application->latestAnalysis->status)->toBe(AnalysisStatus::Completed)
        ->and($application->latestAnalysis->job_offer_id)->toBe($offer->id);
    Storage::disk('local')->assertExists([$application->cv_path, $original->cv_path]);
});

test('every AI call counts in the monthly budget', function () {
    RecruitmentSetting::store(['monthly_budget' => '1']);
    AiCall::query()->create(['task' => AiCall::OFFER_DRAFT, 'cost' => 0.6]);
    AiCall::query()->create(['task' => AiCall::SOURCING, 'cost' => 0.4]);

    expect(app(AnalysisRunner::class)->blockedReason())->toBe('Le plafond de dépense mensuel est atteint.');

    $this->actingAs($this->admin)
        ->get(route('admin.recruitment.settings.edit'))
        ->assertInertia(fn (Assert $page) => $page->where('usage.spent', 1)->has('usage.by_task', 2));
});

test('the « to consider » threshold must stay below the « to meet » one', function () {
    $this->actingAs($this->admin)
        ->put(route('admin.recruitment.settings.update'), ['model' => 'claude-opus-5-5', 'effort' => 'medium', 'monthly_budget' => '5', 'priority_threshold' => '60', 'consider_threshold' => '70'])
        ->assertSessionHasErrors('consider_threshold');
});
