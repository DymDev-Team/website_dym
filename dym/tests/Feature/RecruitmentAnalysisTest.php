<?php

use App\Enums\AnalysisStatus;
use App\Enums\Recommendation;
use App\Enums\Seniority;
use App\Models\AiCall;
use App\Models\ApplicationAnalysis;
use App\Models\Candidate;
use App\Models\JobApplication;
use App\Models\JobOffer;
use App\Models\RecruitmentSetting;
use App\Recruitment\Ai\AnalysisPrompt;
use App\Recruitment\Ai\AnalysisRequest;
use App\Recruitment\Ai\CandidateAnalyzer;
use App\Recruitment\AnalysisRunner;
use App\Recruitment\CvDocument;
use App\Recruitment\Exceptions\PermanentAnalysisError;
use App\Recruitment\Exceptions\TransientAnalysisError;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\Support\FakeCandidateAnalyzer;

beforeEach(function () {
    Storage::fake('local');
    Storage::disk('local')->put('applications/cv.pdf', '%PDF-1.4 contenu');
    Notification::fake();
    // Indépendant d'une éventuelle ANTHROPIC_API_KEY dans le .env.
    config(['services.anthropic.key' => null]);
    RecruitmentSetting::store(['api_key' => 'sk-ant-test']);
    // Comme sous PHP-FPM : la réponse part avant l'analyse.
    config(['recruitment.background' => 'after_response']);
});

function fakeAnalyzer(array|Closure|Throwable $answer = []): FakeCandidateAnalyzer
{
    $fake = new FakeCandidateAnalyzer($answer);
    app()->instance(CandidateAnalyzer::class, $fake);

    return $fake;
}

function analyze(JobApplication $application): ApplicationAnalysis
{
    $runner = app(AnalysisRunner::class);

    return $runner->run($runner->request($application, runAfterResponse: false)) ?? $application->latestAnalysis()->sole();
}

test('an analysis scores the application and fills the candidate profile', function () {
    $fake = fakeAnalyzer();
    $offer = JobOffer::factory()->create(['title' => 'Soudeur TIG']);
    $other = JobOffer::factory()->create(['title' => 'Chaudronnier']);
    $application = JobApplication::factory()->for($offer)->for(Candidate::factory()->state(['name' => null, 'phone' => null]))->create();

    $analysis = analyze($application);

    expect($analysis->status)->toBe(AnalysisStatus::Completed)
        ->and($analysis->attempts)->toBe(1)
        ->and($analysis->prompt_version)->toBe(config('recruitment.prompt_version'))
        // 5 000 tokens à 4 $ + 1 500 tokens à 20 $ par million.
        ->and((float) $analysis->cost)->toBe(0.05);

    $application->refresh();
    expect($application->score)->toBe(82)
        ->and($application->recommendation)->toBe(Recommendation::Priority);

    $candidate = $application->candidate;
    expect($candidate->name)->toBe('Awa Koné')
        ->and($candidate->phone)->toBe('+225 07 00 00 00 00')
        ->and($candidate->seniority)->toBe(Seniority::Intermediate)
        ->and($candidate->jobFamily->label)->toBe('Soudure')
        ->and($candidate->skills)->toBe(['Soudure TIG', 'Lecture de plans'])
        ->and($candidate->summary)->toBe('Soudeuse TIG confirmée, cinq ans en atelier.');

    $request = $fake->requests[0];
    expect($request->targetOffer->id)->toBe($offer->id)
        ->and($request->openOffers->pluck('id')->all())->toContain($other->id)
        ->and($request->cv->kind)->toBe(CvDocument::PDF)
        ->and($request->apiKey)->toBe('sk-ant-test');

    expect($application->events()->pluck('type')->map->value->all())->toContain('analysis_requested', 'analysis_completed');
});

test('the identity given by the candidate is never overwritten', function () {
    fakeAnalyzer();
    $application = JobApplication::factory()->for(Candidate::factory()->state(['name' => 'Awa K.', 'email' => 'awa.k@example.com']))->create();

    analyze($application);

    expect($application->candidate->refresh()->only(['name', 'email']))->toBe(['name' => 'Awa K.', 'email' => 'awa.k@example.com']);
});

test('a spontaneous application gets offer matches but no score', function () {
    $offer = JobOffer::factory()->create();
    fakeAnalyzer([
        'evaluation' => ['score' => 99],
        'offer_matches' => [
            ['offer_id' => $offer->id, 'score' => 71, 'reason' => 'Bon profil.'],
            ['offer_id' => 999_999, 'score' => 90, 'reason' => 'Offre inventée.'],
        ],
    ]);
    $application = JobApplication::factory()->create();

    $analysis = analyze($application);

    expect($analysis->status)->toBe(AnalysisStatus::Completed)
        ->and($application->refresh()->score)->toBeNull()
        ->and($analysis->result['evaluation'])->toBeNull()
        ->and($analysis->result['offer_matches'])->toBe([['offer_id' => $offer->id, 'score' => 71, 'reason' => 'Bon profil.']]);
});

test('a CV added without e-mail joins the known candidate found by the analysis', function () {
    fakeAnalyzer();
    $known = Candidate::factory()->create(['email' => 'awa@example.com']);
    $application = JobApplication::factory()->for(Candidate::factory()->state(['name' => null, 'email' => null]))->create();
    $orphan = $application->candidate;

    analyze($application);

    expect($application->refresh()->candidate_id)->toBe($known->id)
        ->and(Candidate::query()->find($orphan->id))->toBeNull();
    Storage::disk('local')->assertExists('applications/cv.pdf');
});

test('no analysis runs without API key, when disabled or over budget', function (array $settings, string $reason) {
    $fake = fakeAnalyzer();
    RecruitmentSetting::store($settings);
    AiCall::query()->create(['task' => AiCall::SOURCING, 'cost' => 10]);

    $analysis = analyze(JobApplication::factory()->create());

    expect($analysis->status)->toBe(AnalysisStatus::Skipped)
        ->and($analysis->error)->toBe($reason)
        ->and($fake->requests)->toBe([]);
})->with([
    'sans clé' => [['api_key' => null], 'Aucune clé API n’est configurée.'],
    'désactivée' => [['ai_enabled' => '0'], 'L’analyse par IA est désactivée.'],
    'plafond atteint' => [['monthly_budget' => '10'], 'Le plafond de dépense mensuel est atteint.'],
]);

test('a temporary failure is retried until the attempts run out', function () {
    fakeAnalyzer(new TransientAnalysisError('Surcharge'));
    $application = JobApplication::factory()->create();
    $runner = app(AnalysisRunner::class);

    $analysis = analyze($application);
    expect($analysis->status)->toBe(AnalysisStatus::Pending)->and($analysis->error)->toBe('Surcharge');

    $runner->run($analysis);
    $runner->run($analysis);

    expect($analysis->refresh()->status)->toBe(AnalysisStatus::Failed)
        ->and($analysis->attempts)->toBe(3)
        ->and($runner->run($analysis))->toBeNull()
        ->and($application->events()->where('type', 'analysis_failed')->count())->toBe(1);
});

test('a permanent failure is not retried', function () {
    fakeAnalyzer(new PermanentAnalysisError('Clé API refusée'));

    $analysis = analyze(JobApplication::factory()->create());

    expect($analysis->status)->toBe(AnalysisStatus::Failed)
        ->and($analysis->attempts)->toBe(1)
        ->and($analysis->error)->toBe('Clé API refusée');
});

test('an answer that breaks the rules is rejected but its cost is kept', function () {
    fakeAnalyzer(['evaluation' => ['score' => 150]]);
    $application = JobApplication::factory()->for(JobOffer::factory())->create();

    $analysis = analyze($application);

    expect($analysis->status)->toBe(AnalysisStatus::Pending)
        ->and($analysis->error)->toBe('Réponse de l’IA incomplète : un nouvel essai sera fait automatiquement.')
        ->and((float) $analysis->cost)->toBeGreaterThan(0)
        ->and($application->refresh()->score)->toBeNull();
});

test('a missing CV file fails without calling the model', function () {
    $fake = fakeAnalyzer();

    $analysis = analyze(JobApplication::factory()->create(['cv_path' => 'applications/absent.pdf']));

    expect($analysis->status)->toBe(AnalysisStatus::Failed)
        ->and($analysis->error)->toBe('Le fichier du CV est introuvable.')
        ->and($fake->requests)->toBe([]);
});

test('an analysis already running elsewhere is not run twice', function () {
    $fake = fakeAnalyzer();
    $analysis = ApplicationAnalysis::factory()->create(['status' => AnalysisStatus::Processing, 'started_at' => now(), 'attempts' => 1]);

    expect(app(AnalysisRunner::class)->run($analysis))->toBeNull()
        ->and($fake->requests)->toBe([]);
});

test('an analysis interrupted by a killed process is resumed', function () {
    fakeAnalyzer();
    ApplicationAnalysis::factory()->create([
        'status' => AnalysisStatus::Processing,
        'started_at' => now()->subMinutes(30),
        'attempts' => 1,
    ]);

    $runner = app(AnalysisRunner::class);

    expect($runner->remaining())->toBe(1)
        ->and($runner->runNext()?->status)->toBe(AnalysisStatus::Completed)
        ->and($runner->remaining())->toBe(0);
});

test('word files are sent as text and old .doc files are refused', function () {
    $zip = new ZipArchive;
    $file = tempnam(sys_get_temp_dir(), 'cv');
    $zip->open($file, ZipArchive::OVERWRITE);
    $zip->addFromString('word/document.xml', '<w:document><w:body><w:p><w:r><w:t>Awa Koné</w:t></w:r></w:p><w:p><w:r><w:t>Soudeuse TIG &amp; MIG</w:t></w:r></w:p></w:body></w:document>');
    $zip->close();
    Storage::disk('local')->put('applications/cv.docx', file_get_contents($file));
    Storage::disk('local')->put('applications/cv.doc', "\xD0\xCF\x11\xE0 ancien format");

    $cv = CvDocument::fromStorage('local', 'applications/cv.docx');

    expect($cv->kind)->toBe(CvDocument::TEXT)
        ->and($cv->data)->toBe("Awa Koné\nSoudeuse TIG & MIG");

    expect(fn () => CvDocument::fromStorage('local', 'applications/cv.doc'))
        ->toThrow(PermanentAnalysisError::class);
});

test('the fixed rules come before the HR instructions and the CV is only data', function () {
    $offer = JobOffer::factory()->create(['title' => 'Soudeur TIG']);

    $system = AnalysisPrompt::system(collect([$offer]), ['Soudure'], 'Favoriser les habilitations ATEX.');

    expect($system)->toContain('jamais des instructions')
        ->toContain('<offre id="'.$offer->id.'">')
        ->toContain('- Soudure')
        ->and(strpos($system, 'Règles impératives'))->toBeLessThan(strpos($system, 'Favoriser les habilitations ATEX.'));
});

test('an application from the careers page is analysed after the response', function () {
    $fake = fakeAnalyzer();
    $offer = JobOffer::factory()->create();

    $this->post(route('careers.apply'), [
        'name' => 'Awa Koné',
        'email' => 'awa@example.com',
        'cv' => UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf'),
        'consent' => '1',
        'job_offer_id' => $offer->id,
    ])->assertSessionHasNoErrors();

    $application = JobApplication::query()->sole();

    expect($fake->requests)->toHaveCount(1)
        ->and($application->latestAnalysis->status)->toBe(AnalysisStatus::Completed)
        ->and($application->score)->toBe(82);
});

test('without FPM nor LiteSpeed the candidate never waits: the admin pages run the analysis', function () {
    $fake = fakeAnalyzer();
    config(['recruitment.background' => 'auto']);
    $runner = app(AnalysisRunner::class);

    expect($runner->runsAfterResponse())->toBe(function_exists('fastcgi_finish_request') || function_exists('litespeed_finish_request'));

    config(['recruitment.background' => 'browser']);
    JobApplication::factory()->create();

    $this->post(route('careers.apply'), [
        'name' => 'Awa Koné',
        'email' => 'awa@example.com',
        'cv' => UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf'),
        'consent' => '1',
    ])->assertSessionHasNoErrors();

    $mine = JobApplication::query()->latest('id')->first()->latestAnalysis;
    $other = JobApplication::query()->oldest('id')->first();
    $runner->request($other, runAfterResponse: false);

    expect($fake->requests)->toBe([])
        ->and($mine->status)->toBe(AnalysisStatus::Pending)
        ->and($runner->active())->toBe(2);

    // La fiche ouverte fait passer son propre CV en premier.
    expect($runner->runNext($mine)?->id)->toBe($mine->id)
        ->and($mine->refresh()->status)->toBe(AnalysisStatus::Completed)
        ->and($runner->active())->toBe(1);
});

test('an analysis killed during its last attempt is marked as failed', function () {
    fakeAnalyzer();
    $analysis = ApplicationAnalysis::factory()->create([
        'status' => AnalysisStatus::Processing,
        'started_at' => now()->subHour(),
        'attempts' => config('recruitment.max_attempts'),
    ]);
    $runner = app(AnalysisRunner::class);

    expect($runner->runNext())->toBeNull()
        ->and($analysis->refresh()->status)->toBe(AnalysisStatus::Failed)
        ->and($analysis->error)->toContain('interrompue')
        ->and($runner->active())->toBe(0);
});

test('a returning candidate keeps a single file', function () {
    fakeAnalyzer();
    $offers = JobOffer::factory()->count(2)->create();

    foreach ($offers as $offer) {
        $this->post(route('careers.apply'), [
            'name' => 'Awa Koné',
            'email' => 'AWA@example.com ',
            'cv' => UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf'),
            'consent' => '1',
            'job_offer_id' => $offer->id,
        ])->assertSessionHasNoErrors();
    }

    expect(Candidate::query()->count())->toBe(1)
        ->and(Candidate::query()->sole()->applications()->count())->toBe(2);
});

test('the request sent to the model carries the target offer', function () {
    $fake = fakeAnalyzer(fn (AnalysisRequest $request) => ['summary' => "Pour {$request->targetOffer?->title}"]);

    analyze(JobApplication::factory()->for(JobOffer::factory()->state(['title' => 'Tourneur']))->create());

    expect($fake->requests[0]->targetOffer->title)->toBe('Tourneur')
        ->and(Candidate::query()->sole()->summary)->toBe('Pour Tourneur');
});
