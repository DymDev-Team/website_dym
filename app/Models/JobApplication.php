<?php

namespace App\Models;

use App\Enums\ApplicationStatus;
use Database\Factories\JobApplicationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $job_offer_id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property string|null $message
 * @property string $cv_path
 * @property string $cv_name
 * @property ApplicationStatus $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read JobOffer|null $jobOffer
 */
#[Fillable(['job_offer_id', 'name', 'email', 'phone', 'message', 'cv_path', 'cv_name', 'status'])]
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
            'status' => ApplicationStatus::class,
        ];
    }

    /**
     * @return BelongsTo<JobOffer, $this>
     */
    public function jobOffer(): BelongsTo
    {
        return $this->belongsTo(JobOffer::class);
    }
}
