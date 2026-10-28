<?php

namespace App\Recruitment;

use App\Enums\ApplicationEventType;
use App\Models\Candidate;
use App\Models\JobApplication;
use App\Models\JobOffer;
use App\Models\RecruitmentOption;
use App\Models\RecruitmentSetting;
use App\Models\RecruitmentStage;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

/**
 * Single entry point for new applications, from the careers page or the
 * admin: candidate deduplication, CV storage, history and AI analysis.
 */
class ApplicationIntake
{
    public function __construct(private AnalysisRunner $runner) {}

    /**
     * Application sent from the careers page.
     *
     * @param  array<string, mixed>  $identity  validated name, email and phone
     * @param  list<array{id: string, label: string, answer: string}>  $answers  answers to the offer's questions
     */
    public function fromWebsite(array $identity, ?JobOffer $offer, ?string $message, UploadedFile $cv, array $answers = []): JobApplication
    {
        $application = $this->create(
            identity: $identity,
            cv: $cv,
            attributes: [
                'job_offer_id' => $offer?->id,
                'stage_id' => RecruitmentStage::initial()->id,
                'source_id' => RecruitmentOption::websiteSource()?->id,
                'message' => $message,
                'answers' => $answers === [] ? null : $answers,
            ],
            event: ApplicationEventType::Received,
        );

        $this->analyzeIfEnabled($application, null, runAfterResponse: true);

        return $application;
    }

    /**
     * CV added by the team. Identity is optional: the analysis fills it in.
     *
     * @param  array<string, mixed>  $identity  validated name, email and phone, all optional
     */
    public function fromAdmin(
        UploadedFile $cv,
        User $user,
        ?JobOffer $offer = null,
        ?RecruitmentOption $source = null,
        ?RecruitmentStage $stage = null,
        array $identity = [],
        bool $runAfterResponse = true,
    ): JobApplication {
        $application = $this->create(
            identity: $identity,
            cv: $cv,
            attributes: [
                'job_offer_id' => $offer?->id,
                'stage_id' => ($stage ?? RecruitmentStage::initial())->id,
                'source_id' => $source?->id,
                'added_by_id' => $user->id,
                'viewed_at' => now(),
            ],
            event: ApplicationEventType::AddedManually,
            user: $user,
        );

        $this->analyzeIfEnabled($application, $user, $runAfterResponse);

        return $application;
    }

    /**
     * Candidate of the CV library added to an offer's pipeline: their latest
     * CV is copied, so that deleting one application never removes the file
     * of another, then analysed for the offer.
     */
    public function fromCandidate(Candidate $candidate, JobOffer $offer, User $user, ?int $score = null): JobApplication
    {
        $existing = $candidate->applications()->where('job_offer_id', $offer->id)->first();

        if ($existing !== null) {
            return $existing;
        }

        $latest = $candidate->applications()->latest('id')->firstOrFail();
        $disk = Storage::disk(JobApplication::CV_DISK);
        $extension = pathinfo($latest->cv_path, PATHINFO_EXTENSION);
        $path = 'applications/'.Str::random(40).($extension !== '' ? ".{$extension}" : '');

        if (! $disk->copy($latest->cv_path, $path)) {
            throw new \RuntimeException('Le CV de ce candidat est introuvable.');
        }

        try {
            $application = DB::transaction(function () use ($candidate, $offer, $user, $score, $latest, $path) {
                $application = $candidate->applications()->create([
                    'job_offer_id' => $offer->id,
                    'stage_id' => RecruitmentStage::initial()->id,
                    'source_id' => RecruitmentOption::source('Base de CV')?->id,
                    'added_by_id' => $user->id,
                    'viewed_at' => now(),
                    'cv_path' => $path,
                    'cv_name' => $latest->cv_name,
                    'cv_mime' => $latest->cv_mime,
                ]);

                $application->record(ApplicationEventType::Sourced, ['score' => $score], $user);

                return $application;
            });
        } catch (Throwable $e) {
            $disk->delete($path);

            throw $e;
        }

        $this->analyzeIfEnabled($application, $user, runAfterResponse: true);

        return $application;
    }

    /**
     * @param  array<string, string|null>  $identity
     * @param  array<string, mixed>  $attributes
     */
    private function create(array $identity, UploadedFile $cv, array $attributes, ApplicationEventType $event, ?User $user = null): JobApplication
    {
        $path = $cv->store('applications', JobApplication::CV_DISK);

        if ($path === false) {
            throw new \RuntimeException('Le CV n’a pas pu être enregistré.');
        }

        try {
            return DB::transaction(function () use ($identity, $cv, $path, $attributes, $event, $user) {
                $application = $this->candidate($identity)->applications()->create([
                    ...$attributes,
                    'cv_path' => $path,
                    'cv_name' => mb_substr($cv->getClientOriginalName(), 0, 255),
                    'cv_mime' => $cv->getMimeType(),
                ]);

                $application->record($event, null, $user);

                return $application;
            });
        } catch (Throwable $e) {
            // Pas de fichier orphelin si l'enregistrement échoue.
            Storage::disk(JobApplication::CV_DISK)->delete($path);

            throw $e;
        }
    }

    /**
     * Known candidate with the same e-mail, completed with new details, or a
     * new one.
     *
     * @param  array<string, string|null>  $identity
     */
    private function candidate(array $identity): Candidate
    {
        $identity = array_filter(
            array_map(fn ($value) => is_string($value) ? trim($value) : null, $identity),
            fn (?string $value) => filled($value),
        );

        $candidate = Candidate::findByEmail($identity['email'] ?? null);

        if ($candidate === null) {
            return Candidate::query()->create($identity);
        }

        foreach ($identity as $field => $value) {
            if (blank($candidate->{$field})) {
                $candidate->{$field} = $value;
            }
        }

        $candidate->save();

        return $candidate;
    }

    private function analyzeIfEnabled(JobApplication $application, ?User $user, bool $runAfterResponse): void
    {
        if (RecruitmentSetting::values()['auto_analyze']) {
            $this->runner->request($application, $user, $runAfterResponse);
        }
    }
}
