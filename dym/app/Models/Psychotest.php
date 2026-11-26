<?php

namespace App\Models;

use App\Enums\ApplicationEventType;
use App\Recruitment\AutoAdvance;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Psychotechnical test of an application: multiple-choice questions, the
 * common base of the offer plus questions drawn from the candidate's
 * analysis. The candidate answers one question at a time, each with its own
 * time limit and no going back, on a private page bound to the device where
 * the test started. Leaving the page once brings a warning, twice stops the
 * test. The candidate never sees the right answers nor the score.
 *
 * @property int $id
 * @property int $job_application_id
 * @property string $token
 * @property string|null $device_hash
 * @property list<array{id: string, text: string, options: list<string>, answer: int, category: string, source: string}> $questions
 * @property array<string, int|null>|null $answers
 * @property int $current_question
 * @property int $exits
 * @property int $away_seconds
 * @property string|null $stopped_reason
 * @property int|null $score
 * @property int $duration_minutes
 * @property int $question_seconds
 * @property Carbon|null $sent_at
 * @property Carbon|null $expires_at
 * @property Carbon|null $started_at
 * @property Carbon|null $question_started_at
 * @property Carbon|null $completed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read JobApplication $application
 */
#[Fillable(['job_application_id', 'token', 'device_hash', 'questions', 'answers', 'current_question', 'exits', 'away_seconds', 'stopped_reason', 'score', 'duration_minutes', 'question_seconds', 'sent_at', 'expires_at', 'started_at', 'question_started_at', 'completed_at'])]
#[Hidden(['token', 'device_hash'])]
class Psychotest extends Model
{
    /**
     * Seconds accepted after a question's time limit, for a slow connection.
     */
    public const GRACE_SECONDS = 5;

    /**
     * Page exits tolerated: the first one is a warning, the next stops the test.
     */
    public const MAX_EXITS = 2;

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
            'current_question' => 'integer',
            'exits' => 'integer',
            'away_seconds' => 'integer',
            'score' => 'integer',
            'duration_minutes' => 'integer',
            'question_seconds' => 'integer',
            'sent_at' => 'datetime',
            'expires_at' => 'datetime',
            'started_at' => 'datetime',
            'question_started_at' => 'datetime',
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
            $this->started_at !== null => 'started',
            $this->expires_at?->isPast() === true => 'expired',
            default => 'sent',
        };
    }

    /**
     * Start the test on this device: returns the secret kept by the browser.
     */
    public function start(): string
    {
        $secret = Str::random(40);

        $this->update([
            'device_hash' => hash('sha256', $secret),
            'started_at' => now(),
            'question_started_at' => now(),
            'current_question' => 0,
            'answers' => [],
        ]);

        return $secret;
    }

    public function isDevice(?string $secret): bool
    {
        return $this->device_hash !== null && $secret !== null && hash_equals($this->device_hash, hash('sha256', $secret));
    }

    /**
     * Questions whose time ran out count as unanswered: the clock runs on
     * the server, whether the page is open or not.
     */
    public function catchUp(): void
    {
        if ($this->status() !== 'started') {
            return;
        }

        $answers = $this->answers ?? [];
        $current = $this->current_question;
        $started = $this->question_started_at ?? $this->started_at;
        $limit = $this->question_seconds + self::GRACE_SECONDS;

        while ($current < count($this->questions) && now()->greaterThan($started->copy()->addSeconds($limit))) {
            $answers[$this->questions[$current]['id']] = null;
            $current++;
            $started = $started->copy()->addSeconds($limit);
        }

        if ($current === $this->current_question) {
            return;
        }

        $this->update(['answers' => $answers, 'current_question' => $current, 'question_started_at' => $started]);

        if ($current >= count($this->questions)) {
            $this->finish();
        }
    }

    /**
     * Answer of the question on screen; a late or stale one is ignored.
     */
    public function answer(string $questionId, ?int $option): void
    {
        $this->catchUp();
        $question = $this->questions[$this->current_question] ?? null;

        if ($this->status() !== 'started' || $question === null || $question['id'] !== $questionId) {
            return;
        }

        $this->update([
            'answers' => [...($this->answers ?? []), $questionId => $option],
            'current_question' => $this->current_question + 1,
            'question_started_at' => now(),
        ]);

        if ($this->current_question >= count($this->questions)) {
            $this->finish();
        }
    }

    /**
     * The candidate left the page: a warning first, then the test stops.
     */
    public function leave(int $seconds): void
    {
        $this->catchUp();

        if ($this->status() !== 'started') {
            return;
        }

        $this->update(['exits' => $this->exits + 1, 'away_seconds' => $this->away_seconds + max(0, $seconds)]);

        if ($this->exits >= self::MAX_EXITS) {
            $this->finish('exits');
        }
    }

    /**
     * Grade the test, unanswered questions counting wrong.
     */
    public function finish(?string $reason = null): void
    {
        $answers = [];
        foreach ($this->questions as $question) {
            $answers[$question['id']] = $this->answers[$question['id']] ?? null;
        }

        $score = $this->grade($answers);

        DB::transaction(function () use ($answers, $score, $reason) {
            $this->update(['answers' => $answers, 'score' => $score, 'completed_at' => now(), 'stopped_reason' => $reason]);
            $this->application->update(['test_score' => $score]);
            $this->application->record(ApplicationEventType::PsychotestCompleted, [
                'score' => $score,
                'minutes' => (int) ceil(($this->started_at ?? now())->diffInSeconds(now()) / 60),
                'exits' => $this->exits,
                'stopped' => $reason,
            ]);
            AutoAdvance::afterPsychotest($this->application);
        });
    }

    /**
     * Seconds left on the question on screen.
     */
    public function secondsLeft(): int
    {
        $started = $this->question_started_at ?? $this->started_at ?? now();

        return max(0, (int) now()->diffInSeconds($started->copy()->addSeconds($this->question_seconds), false));
    }

    /**
     * Question on screen as the candidate sees it: no right answer.
     *
     * @return array{id: string, text: string, options: list<string>}|null
     */
    public function currentQuestion(): ?array
    {
        $question = $this->questions[$this->current_question] ?? null;

        return $question === null ? null : ['id' => $question['id'], 'text' => $question['text'], 'options' => $question['options']];
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
