<?php

namespace App\Models;

use App\Enums\AnalysisStatus;
use Database\Factories\ApplicationAnalysisFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * One AI reading of a CV. Every run is kept, so a new analysis never erases
 * the previous one and each score stays traceable to its model and prompt.
 *
 * @property int $id
 * @property int $job_application_id
 * @property int|null $job_offer_id
 * @property AnalysisStatus $status
 * @property int $attempts
 * @property string|null $model
 * @property string|null $prompt_version
 * @property array<string, mixed>|null $result
 * @property string|null $error
 * @property int $input_tokens
 * @property int $output_tokens
 * @property int $cache_read_tokens
 * @property int $cache_write_tokens
 * @property string $cost
 * @property int|null $duration_ms
 * @property Carbon|null $started_at
 * @property Carbon|null $finished_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read JobApplication $application
 * @property-read JobOffer|null $jobOffer
 */
#[Fillable(['job_application_id', 'job_offer_id', 'status', 'attempts', 'model', 'prompt_version', 'result', 'error', 'input_tokens', 'output_tokens', 'cache_read_tokens', 'cache_write_tokens', 'cost', 'duration_ms', 'started_at', 'finished_at'])]
class ApplicationAnalysis extends Model
{
    /** @use HasFactory<ApplicationAnalysisFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => AnalysisStatus::class,
            'attempts' => 'integer',
            'result' => 'json:unicode',
            'input_tokens' => 'integer',
            'output_tokens' => 'integer',
            'cache_read_tokens' => 'integer',
            'cache_write_tokens' => 'integer',
            'cost' => 'decimal:6',
            'duration_ms' => 'integer',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    /**
     * Analyses waiting to run, or left running by an interrupted process.
     *
     * @param  Builder<static>  $query
     */
    #[Scope]
    protected function runnable(Builder $query): void
    {
        $query->where('attempts', '<', config('recruitment.max_attempts'))
            ->where(fn (Builder $q) => $q
                ->where('status', AnalysisStatus::Pending)
                ->orWhere(fn (Builder $q) => $q
                    ->where('status', AnalysisStatus::Processing)
                    ->where('started_at', '<', now()->subMinutes(config('recruitment.stale_after_minutes')))));
    }

    /**
     * @return BelongsTo<JobApplication, $this>
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(JobApplication::class, 'job_application_id');
    }

    /**
     * @return BelongsTo<JobOffer, $this>
     */
    public function jobOffer(): BelongsTo
    {
        return $this->belongsTo(JobOffer::class);
    }
}
