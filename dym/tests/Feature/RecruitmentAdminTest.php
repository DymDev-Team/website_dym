<?php

use App\Enums\AnalysisStatus;
use App\Enums\RecruitmentOptionType;
use App\Models\ApplicationAnalysis;
use App\Models\Candidate;
use App\Models\JobApplication;
use App\Models\JobOffer;
use App\Models\RecruitmentOption;
use App\Models\RecruitmentSetting;
use App\Models\RecruitmentStage;
use App\Models\User;
use App\Recruitment\Ai\CandidateAnalyzer;
use App\Recruitment\AnalysisRunner;
use App\Recruitment\Exceptions\PermanentAnalysisError;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\FakeCandidateAnalyzer;

beforeEach(function () {
    Storage::fake('local');
    $this->fake = new FakeCandidateAnalyzer;
    app()->instance(CandidateAnalyzer::class, $this->fake);
    // Indépendant d'une éventuelle ANTHROPIC_API_KEY dans le .env.
    config(['services.anthropic.key' => null]);
    RecruitmentSetting::store(['api_key' => 'sk-ant-test']);
    // Comme sous PHP-FPM : la réponse part avant l'analyse.
    config(['recruitment.background' => 'after_response']);
    $this->admin = User::factory()->admin()->create();
});

test('the recruitment pages are reserved to admins', function (string $method, string $route, array $parameters = []) {
    $this->actingAs(User::factory()->create())
        ->{$method}(route($route, $parameters))
        ->assertForbidden();
})->with([
    ['get', 'admin.candidates.index'],
    ['get', 'admin.recruitment.settings.edit'],
    ['post', 'admin.recruitment.analyses.next'],
    ['post', 'admin.applications.store'],
]);

test('CVs added in bulk wait for the page to analyse them one by one', function () {
    $offer = JobOffer::factory()->create();
    $source = RecruitmentOption::query()->where('label', 'Salon / Forum')->sole();

    foreach (['cv-1.pdf', 'cv-2.pdf'] as $name) {
        $this->actingAs($this->admin)
            ->postJson(route('admin.applications.store'), [
                'cv' => UploadedFile::fake()->create($name, 100, 'application/pdf'),
                'job_offer_id' => $offer->id,
                'source_id' => $source->id,
            ])
            ->assertCreated();
    }

    expect(JobApplication::query()->count())->toBe(2)
        ->and(ApplicationAnalysis::query()->where('status', AnalysisStatus::Pending)->count())->toBe(2)
        ->and($this->fake->requests)->toBe([]);

    $application = JobApplication::query()->first();
    expect($application->added_by_id)->toBe($this->admin->id)
        ->and($application->source_id)->toBe($source->id)
        ->and($application->viewed_at)->not->toBeNull();

    $this->actingAs($this->admin)->postJson(route('admin.recruitment.analyses.next'))
        ->assertOk()
        ->assertJsonPath('processed.status', 'completed')
        ->assertJsonPath('remaining', 1);

    $this->actingAs($this->admin)->postJson(route('admin.recruitment.analyses.next'))
        ->assertJsonPath('remaining', 0);

    $this->actingAs($this->admin)->postJson(route('admin.recruitment.analyses.next'))
        ->assertJsonPath('processed', null);

    expect($this->fake->requests)->toHaveCount(2);
});

test('a CV with unsupported type is refused', function () {
    $this->actingAs($this->admin)
        ->postJson(route('admin.applications.store'), ['cv' => UploadedFile::fake()->create('cv.exe', 10)])
        ->assertJsonValidationErrors('cv');

    expect(JobApplication::query()->count())->toBe(0);
    expect(Storage::disk('local')->allFiles())->toBe([]);
});

test('a single CV added from the admin opens its file', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.applications.store'), [
            'cv' => UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf'),
            'name' => 'Koffi Yao',
        ])
        ->assertRedirect(route('admin.applications.show', JobApplication::query()->sole()));

    expect(Candidate::query()->sole()->name)->toBe('Koffi Yao');
});

test('the application page shows the analysis and accepts notes', function () {
    Storage::disk('local')->put('applications/cv.pdf', '%PDF');
    $offer = JobOffer::factory()->create();
    $application = JobApplication::factory()->for($offer)->create();
    $runner = app(AnalysisRunner::class);
    $runner->run($runner->request($application, runAfterResponse: false));

    $this->actingAs($this->admin)
        ->post(route('admin.applications.notes.store', $application), ['body' => 'Très bon contact au téléphone.'])
        ->assertRedirect();

    $this->actingAs($this->admin)
        ->get(route('admin.applications.show', $application))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/applications/show')
            ->where('application.score', 82)
            ->where('application.analysis.job_offer_id', $offer->id)
            ->where('application.latest_attempt', null)
            ->where('application.analysis.result.evaluation.recommendation', 'priority')
            ->where('application.candidate.job_family', 'Soudure')
            ->where('application.events.0.type', 'note')
            ->where('application.events.0.user', $this->admin->name)
            ->missing('application.cv_path'));
});

test('changing the target offer starts a new analysis', function () {
    Storage::disk('local')->put('applications/cv.pdf', '%PDF');
    $application = JobApplication::factory()->create(['score' => 40]);
    $offer = JobOffer::factory()->create();

    $this->actingAs($this->admin)
        ->patch(route('admin.applications.update', $application), ['job_offer_id' => $offer->id])
        ->assertRedirect();

    expect($application->refresh()->job_offer_id)->toBe($offer->id)
        ->and($application->score)->toBe(82)
        ->and($this->fake->requests[0]->targetOffer->id)->toBe($offer->id);
});

test('an analysis can be relaunched and keeps the previous one', function () {
    Storage::disk('local')->put('applications/cv.pdf', '%PDF');
    $application = JobApplication::factory()->create();
    ApplicationAnalysis::factory()->for($application, 'application')->create(['status' => AnalysisStatus::Failed]);

    $this->actingAs($this->admin)
        ->post(route('admin.applications.analyze', $application))
        ->assertRedirect();

    expect($application->analyses()->count())->toBe(2)
        ->and($application->latestAnalysis->status)->toBe(AnalysisStatus::Completed);
});

test('the AI settings keep the API key encrypted and never send it back', function () {
    $this->actingAs($this->admin)
        ->put(route('admin.recruitment.settings.update'), [
            'ai_enabled' => '1',
            'auto_analyze' => '0',
            'api_key' => 'sk-ant-api03-secret1234',
            'model' => 'claude-sonnet-5-5',
            'effort' => 'high',
            'monthly_budget' => '25',
            'custom_instructions' => 'Les habilitations électriques sont un plus.',
            'priority_threshold' => '80',
            'consider_threshold' => '55',
        ])
        ->assertRedirect(route('admin.recruitment.settings.edit'));

    $stored = RecruitmentSetting::query()->find('api_key')->value;
    expect($stored)->not->toContain('secret1234')
        ->and(RecruitmentSetting::values())->toMatchArray([
            'api_key' => 'sk-ant-api03-secret1234',
            'auto_analyze' => false,
            'model' => 'claude-sonnet-5-5',
            'monthly_budget' => 25.0,
            'priority_threshold' => 80,
            'consider_threshold' => 55,
        ]);

    // Champ vide : la clé enregistrée est conservée.
    $this->actingAs($this->admin)->put(route('admin.recruitment.settings.update'), [
        'ai_enabled' => '1', 'model' => 'claude-opus-5-5', 'effort' => 'medium', 'monthly_budget' => '25', 'api_key' => '', 'priority_threshold' => '80', 'consider_threshold' => '55',
    ]);
    expect(RecruitmentSetting::values()['api_key'])->toBe('sk-ant-api03-secret1234');

    $this->actingAs($this->admin)
        ->get(route('admin.recruitment.settings.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/recruitment/settings')
            ->where('settings.api_key_masked', '••••1234')
            ->missing('settings.api_key'));
});

test('a fake API key is refused', function () {
    $this->actingAs($this->admin)
        ->put(route('admin.recruitment.settings.update'), ['api_key' => 'abc', 'model' => 'claude-opus-5-5', 'effort' => 'medium', 'monthly_budget' => '5'])
        ->assertSessionHasErrors('api_key');
});

test('stages can be added, reordered and deleted, the first one staying open', function () {
    $stages = RecruitmentStage::query()->ordered()->get();
    $refused = $stages->firstWhere('name', 'Refusée');

    $this->actingAs($this->admin)
        ->post(route('admin.recruitment.stages.store'), ['name' => 'Test technique', 'color' => '#0891b2', 'kind' => 'open'])
        ->assertRedirect();

    $this->actingAs($this->admin)
        ->put(route('admin.recruitment.stages.reorder'), ['ids' => [$refused->id, ...$stages->pluck('id')->reject(fn ($id) => $id === $refused->id)]])
        ->assertSessionHasErrors('stages');

    expect(RecruitmentStage::query()->ordered()->first()->name)->toBe('Nouvelle');

    $application = JobApplication::factory()->create(['stage_id' => $refused->id]);

    $this->actingAs($this->admin)
        ->delete(route('admin.recruitment.stages.destroy', $refused))
        ->assertSessionHasErrors('move_to');

    $target = RecruitmentStage::query()->where('name', 'Test technique')->sole();

    $this->actingAs($this->admin)
        ->delete(route('admin.recruitment.stages.destroy', $refused), ['move_to' => $target->id])
        ->assertRedirect();

    expect(RecruitmentStage::query()->find($refused->id))->toBeNull()
        ->and($application->refresh()->stage_id)->toBe($target->id);
});

test('job families and sources are editable lists', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.recruitment.options.store'), ['type' => 'job_family', 'label' => 'Peinture industrielle'])
        ->assertRedirect();

    $this->actingAs($this->admin)
        ->post(route('admin.recruitment.options.store'), ['type' => 'job_family', 'label' => 'Peinture industrielle'])
        ->assertSessionHasErrors('label');

    $option = RecruitmentOption::query()->where('label', 'Peinture industrielle')->sole();
    expect($option->type)->toBe(RecruitmentOptionType::JobFamily);

    $this->actingAs($this->admin)->put(route('admin.recruitment.options.update', $option), ['label' => 'Peinture']);
    expect($option->refresh()->label)->toBe('Peinture');

    $candidate = Candidate::factory()->create(['job_family_id' => $option->id]);
    $this->actingAs($this->admin)->delete(route('admin.recruitment.options.destroy', $option));

    expect($candidate->refresh()->job_family_id)->toBeNull();
});

test('the CV library searches skills and deletes a candidate with every CV', function () {
    Storage::disk('local')->put('applications/a.pdf', '%PDF');
    Storage::disk('local')->put('applications/b.pdf', '%PDF');
    $welder = Candidate::factory()->create(['skills' => ['Soudure TIG', 'Électricité']]);
    Candidate::factory()->create(['skills' => ['Comptabilité']]);
    JobApplication::factory()->for($welder)->create(['cv_path' => 'applications/a.pdf']);
    JobApplication::factory()->for($welder)->create(['cv_path' => 'applications/b.pdf']);

    $this->actingAs($this->admin)
        ->get(route('admin.candidates.index', ['search' => 'électricité']))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/candidates/index')
            ->has('candidates.data', 1)
            ->where('candidates.data.0.id', $welder->id)
            ->has('candidates.data.0.applications', 2));

    $this->actingAs($this->admin)
        ->delete(route('admin.candidates.destroy', $welder))
        ->assertRedirect(route('admin.candidates.index'));

    expect(JobApplication::query()->count())->toBe(0);
    Storage::disk('local')->assertMissing(['applications/a.pdf', 'applications/b.pdf']);
});

test('opening the pipeline resumes analyses left behind', function () {
    Storage::disk('local')->put('applications/cv.pdf', '%PDF');
    $analysis = ApplicationAnalysis::factory()->create(['status' => AnalysisStatus::Pending]);
    $analysis->forceFill(['updated_at' => now()->subMinutes(5)])->saveQuietly();

    $this->actingAs($this->admin)
        ->get(route('admin.applications.index'))
        ->assertOk();

    expect($analysis->refresh()->status)->toBe(AnalysisStatus::Completed);
});

test('CVs never analysed can be queued, then run by the open pipeline', function () {
    Storage::disk('local')->put('applications/cv.pdf', '%PDF');
    config(['recruitment.background' => 'browser']);
    $never = JobApplication::factory()->create();
    $skipped = JobApplication::factory()->create();
    ApplicationAnalysis::factory()->for($skipped, 'application')->create(['status' => AnalysisStatus::Skipped, 'error' => 'Aucune clé API n’est configurée.']);
    $done = JobApplication::factory()->create();
    ApplicationAnalysis::factory()->for($done, 'application')->create(['status' => AnalysisStatus::Completed]);

    $this->actingAs($this->admin)
        ->get(route('admin.applications.index'))
        ->assertInertia(fn (Assert $page) => $page->where('missingAnalyses', 2)->where('activeAnalyses', 0));

    $this->actingAs($this->admin)
        ->post(route('admin.recruitment.analyses.missing'))
        ->assertRedirect();

    expect($never->analyses()->sole()->status)->toBe(AnalysisStatus::Pending)
        ->and($skipped->latestAnalysis()->sole()->status)->toBe(AnalysisStatus::Pending)
        ->and($done->analyses()->count())->toBe(1)
        ->and($this->fake->requests)->toBe([]);

    $this->actingAs($this->admin)
        ->get(route('admin.applications.index'))
        ->assertInertia(fn (Assert $page) => $page->where('missingAnalyses', 0)->where('activeAnalyses', 2));

    $preferred = $skipped->latestAnalysis()->sole();

    $this->actingAs($this->admin)
        ->postJson(route('admin.recruitment.analyses.next'), ['analysis_id' => $preferred->id])
        ->assertJsonPath('processed.id', $preferred->id)
        ->assertJsonPath('active', 1);
});

test('nothing is queued while the AI cannot run', function () {
    RecruitmentSetting::store(['ai_enabled' => '0']);
    JobApplication::factory()->create();

    $this->actingAs($this->admin)
        ->post(route('admin.recruitment.analyses.missing'))
        ->assertRedirect();

    expect(ApplicationAnalysis::query()->count())->toBe(0);
});

test('a failed new analysis keeps the previous result on screen', function () {
    Storage::disk('local')->put('applications/cv.pdf', '%PDF');
    $offer = JobOffer::factory()->create();
    $application = JobApplication::factory()->for($offer)->create();
    $runner = app(AnalysisRunner::class);
    $runner->run($runner->request($application, runAfterResponse: false));

    app()->instance(CandidateAnalyzer::class, new FakeCandidateAnalyzer(new PermanentAnalysisError('Clé API refusée')));
    $runner = app(AnalysisRunner::class);
    $runner->run($runner->request($application->refresh(), runAfterResponse: false));

    $this->actingAs($this->admin)
        ->get(route('admin.applications.show', $application))
        ->assertInertia(fn (Assert $page) => $page
            ->where('application.score', 82)
            ->where('application.analysis.result.evaluation.score', 82)
            ->where('application.latest_attempt.status', 'failed')
            ->where('application.latest_attempt.error', 'Clé API refusée'));
});
