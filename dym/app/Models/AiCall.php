<?php

namespace App\Models;

use App\Recruitment\Ai\ModelReply;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * One billed call to the AI, whatever the task. The monthly budget is
 * computed on this ledger.
 *
 * @property int $id
 * @property string $task
 * @property string|null $model
 * @property int $input_tokens
 * @property int $output_tokens
 * @property int $cache_read_tokens
 * @property int $cache_write_tokens
 * @property string $cost
 * @property int|null $job_offer_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['task', 'model', 'input_tokens', 'output_tokens', 'cache_read_tokens', 'cache_write_tokens', 'cost', 'job_offer_id'])]
class AiCall extends Model
{
    public const CV_ANALYSIS = 'cv_analysis';

    public const OFFER_CRITERIA = 'offer_criteria';

    public const OFFER_DRAFT = 'offer_draft';

    public const SOURCING = 'sourcing';

    protected $table = 'recruitment_ai_calls';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'input_tokens' => 'integer',
            'output_tokens' => 'integer',
            'cache_read_tokens' => 'integer',
            'cache_write_tokens' => 'integer',
            'cost' => 'decimal:6',
        ];
    }

    /**
     * Log a call and its price.
     */
    public static function record(string $task, ModelReply $reply, ?int $offerId = null): self
    {
        return static::query()->create([
            'task' => $task,
            'model' => $reply->model,
            'input_tokens' => $reply->inputTokens,
            'output_tokens' => $reply->outputTokens,
            'cache_read_tokens' => $reply->cacheReadTokens,
            'cache_write_tokens' => $reply->cacheWriteTokens,
            'cost' => $reply->cost(),
            'job_offer_id' => $offerId,
        ]);
    }

    /**
     * Dollars spent on the AI since the start of the month.
     */
    public static function spentThisMonth(): float
    {
        return (float) static::query()->where('created_at', '>=', now()->startOfMonth())->sum('cost');
    }
}
