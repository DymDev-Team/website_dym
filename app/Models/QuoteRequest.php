<?php

namespace App\Models;

use App\Enums\QuoteStatus;
use Database\Factories\QuoteRequestFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string|null $company
 * @property string $email
 * @property string $phone
 * @property string|null $activity
 * @property string $message
 * @property string|null $deadline
 * @property string|null $attachment_path
 * @property string|null $attachment_name
 * @property QuoteStatus $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'company', 'email', 'phone', 'activity', 'message', 'deadline', 'attachment_path', 'attachment_name', 'status'])]
#[Hidden(['attachment_path'])]
class QuoteRequest extends Model
{
    /** @use HasFactory<QuoteRequestFactory> */
    use HasFactory;

    /**
     * Attachments (plans, photos) are kept on the private disk, never exposed publicly.
     */
    public const ATTACHMENT_DISK = 'local';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => QuoteStatus::class,
        ];
    }
}
