<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * Psychotechnical test of an application: multiple-choice questions, the
 * common base of the offer plus questions drawn from the candidate's
 * analysis. The candidate answers on a private page and never sees the
 * correct answers nor the score.
 *
 * @property int $id
 * @property int $job_application_id
 * @property string $token
 * @property list<array{id: string, text: string, options: list<string>, answer: int, category: string, source: string}> $questions
 * @property array<string, int|null>|null $answers
 * @property int|null $score
 * @property int $duration_minutes
 * @property Carbon|null $sent_at
 * @property Carbon|null $expires_at
 * @property Carbon|null $started_at
 * @property Carbon|null $completed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read JobApplication $application
 */
#[Fillable(['job_application_id', 'token', 'questions', 'answers', 'score', 'duration_minutes', 'sent_at', 'expires_at', 'started_at', 'completed_at'])]
#[Hidden(['token'])]
class Psychotest extends Model
{
    /**
     * Minutes accepted after the time limit, for a slow connection.
     */
    public const GRACE_MINUTES = 2;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'questions' => 'json:unicode',
            'answers' => 'json:unicode',
            'score' => 'integer',
            'duration_minutes' => 'integer',
            'sent_at' => 'datetime',
            'expires_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public static function newToken(): string
    {
        return Str::random(48);
    }

    /**
     * draft, sent, started, completed or expired.
     */
    public function status(): string
    {
        return match (true) {
            $this->completed_at !== null => 'completed',
            $this->sent_at === null => 'draft',
            $this->started_at !== null && ! $this->isOverdue() => 'started',
            $this->started_at !== null, $this->expires_at?->isPast() === true => 'expired',
            default => 'sent',
        };
    }

    /**
     * Whether the candidate may still open, start or answer the test.
     */
    public function isOpen(): bool
    {
        return in_array($this->status(), ['sent', 'started'], true);
    }

    /**
     * Time limit passed, grace included.
     */
    public function isOverdue(): bool
    {
        return $this->started_at !== null
            && now()->greaterThan($this->started_at->copy()->addMinutes($this->duration_minutes + self::GRACE_MINUTES));
    }

    /**
     * Seconds left to answer, from the start of the test.
     */
    public function secondsLeft(): int
    {
        if ($this->started_at === null) {
            return $this->duration_minutes * 60;
        }

        return max(0, (int) now()->diffInSeconds($this->started_at->copy()->addMinutes($this->duration_minutes), false));
    }

    /**
     * Questions as shown to the candidate: no correct answer, no origin.
     *
     * @return list<array{id: string, text: string, options: list<string>}>
     */
    public function publicQuestions(): array
    {
        return array_map(fn (array $question) => [
            'id' => $question['id'],
            'text' => $question['text'],
            'options' => $question['options'],
        ], $this->questions);
    }

    /**
     * Score out of 100: share of correct answers, unanswered counting wrong.
     *
     * @param  array<string, int|null>  $answers
     */
    public function grade(array $answers): int
    {
        if ($this->questions === []) {
            return 0;
        }

        $correct = collect($this->questions)->filter(fn (array $question) => ($answers[$question['id']] ?? null) === $question['answer'])->count();

        return (int) round($correct / count($this->questions) * 100);
    }

    public function url(): string
    {
        return route('psychotest.show', $this->token);
    }

    /**
     * @return BelongsTo<JobApplication, $this>
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(JobApplication::class, 'job_application_id');
    }
}
