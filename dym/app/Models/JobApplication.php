<?php

namespace App\Models;

use App\Enums\AnalysisStatus;
use App\Enums\ApplicationEventType;
use App\Enums\Recommendation;
use Database\Factories\JobApplicationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $candidate_id
 * @property int|null $job_offer_id
 * @property int $stage_id
 * @property int|null $source_id
 * @property int|null $added_by_id
 * @property string|null $message
 * @property list<array{id: string, label: string, answer: string}>|null $answers
 * @property string $cv_path
 * @property string $cv_name
 * @property string|null $cv_mime
 * @property int|null $score
 * @property Recommendation|null $recommendation
 * @property Carbon|null $viewed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Candidate $candidate
 * @property-read JobOffer|null $jobOffer
 * @property-read RecruitmentStage $stage
 * @property-read RecruitmentOption|null $source
 * @property-read User|null $addedBy
 * @property-read ApplicationAnalysis|null $latestAnalysis
 * @property-read ApplicationAnalysis|null $latestCompletedAnalysis
 * @property-read Collection<int, ApplicationAnalysis> $analyses
 * @property-read Collection<int, ApplicationEvent> $events
 */
#[Fillable(['candidate_id', 'job_offer_id', 'stage_id', 'source_id', 'added_by_id', 'message', 'answers', 'cv_path', 'cv_name', 'cv_mime', 'score', 'recommendation', 'viewed_at'])]
#[Hidden(['cv_path'])]
class JobApplication extends Model
{
    /** @use HasFactory<JobApplicationFactory> */
    use HasFactory;

    /**
     * CVs are kept on the private disk, never exposed publicly.
     */
    public const CV_DISK = 'local';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'score' => 'integer',
            'recommendation' => Recommendation::class,
            'answers' => 'json:unicode',
            'viewed_at' => 'datetime',
        ];
    }

    /**
     * CVs never analysed, or skipped because the AI was off, had no key or
     * was over budget when they arrived.
     *
     * @param  Builder<static>  $query
     */
    #[Scope]
    protected function withoutAnalysis(Builder $query): void
    {
        $query->where(fn (Builder $q) => $q
            ->whereDoesntHave('analyses')
            ->orWhereHas('latestAnalysis', fn (Builder $analysis) => $analysis->where('status', AnalysisStatus::Skipped)));
    }

    /**
     * Add an entry to the application's history.
     *
     * @param  array<string, mixed>|null  $data
     */
    public function record(ApplicationEventType $type, ?array $data = null, ?User $user = null): ApplicationEvent
    {
        return $this->events()->create([
            'type' => $type,
            'data' => $data,
            'user_id' => $user?->id,
        ]);
    }

    /**
     * @return BelongsTo<Candidate, $this>
     */
    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class);
    }

    /**
     * @return BelongsTo<JobOffer, $this>
     */
    public function jobOffer(): BelongsTo
    {
        return $this->belongsTo(JobOffer::class);
    }

    /**
     * @return BelongsTo<RecruitmentStage, $this>
     */
    public function stage(): BelongsTo
    {
        return $this->belongsTo(RecruitmentStage::class, 'stage_id');
    }

    /**
     * @return BelongsTo<RecruitmentOption, $this>
     */
    public function source(): BelongsTo
    {
        return $this->belongsTo(RecruitmentOption::class, 'source_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function addedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by_id');
    }

    /**
     * @return HasMany<ApplicationAnalysis, $this>
     */
    public function analyses(): HasMany
    {
        return $this->hasMany(ApplicationAnalysis::class);
    }

    /**
     * @return HasOne<ApplicationAnalysis, $this>
     */
    public function latestAnalysis(): HasOne
    {
        return $this->hasOne(ApplicationAnalysis::class)->latestOfMany();
    }

    /**
     * Last analysis with a result: it stays on screen while a newer one runs
     * or after a newer one failed.
     *
     * @return HasOne<ApplicationAnalysis, $this>
     */
    public function latestCompletedAnalysis(): HasOne
    {
        return $this->hasOne(ApplicationAnalysis::class)->ofMany(
            ['id' => 'max'],
            fn (Builder $query) => $query->where('status', AnalysisStatus::Completed),
        );
    }

    /**
     * @return HasMany<ApplicationEvent, $this>
     */
    public function events(): HasMany
    {
        return $this->hasMany(ApplicationEvent::class);
    }
}
