<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Score of a CV library candidate for an offer, from the anonymised profile.
 *
 * @property int $id
 * @property int $job_offer_id
 * @property int $candidate_id
 * @property int $score
 * @property string $reason
 * @property string|null $model
 * @property string|null $prompt_version
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read JobOffer $jobOffer
 * @property-read Candidate $candidate
 */
#[Fillable(['job_offer_id', 'candidate_id', 'score', 'reason', 'model', 'prompt_version'])]
class CandidateMatch extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'score' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<JobOffer, $this>
     */
    public function jobOffer(): BelongsTo
    {
        return $this->belongsTo(JobOffer::class);
    }

    /**
     * @return BelongsTo<Candidate, $this>
     */
    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class);
    }
}
