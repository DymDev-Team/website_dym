<?php

namespace App\Models;

use App\Enums\Seniority;
use Database\Factories\CandidateFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * A person, whatever the number of positions they applied to. Identity comes
 * from the form or the admin; the profile is filled by the CV analysis.
 *
 * @property int $id
 * @property string|null $name
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $location
 * @property int|null $job_family_id
 * @property Seniority|null $seniority
 * @property int|null $years_experience
 * @property list<string>|null $skills
 * @property array<string, mixed>|null $profile
 * @property string|null $summary
 * @property string|null $search_text
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read string $display_name
 * @property-read RecruitmentOption|null $jobFamily
 * @property-read Collection<int, JobApplication> $applications
 * @property-read Collection<int, CandidateMatch> $matches
 */
#[Fillable(['name', 'email', 'phone', 'location', 'job_family_id', 'seniority', 'years_experience', 'skills', 'profile', 'summary'])]
class Candidate extends Model
{
    /** @use HasFactory<CandidateFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $appends = ['display_name'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'seniority' => Seniority::class,
            'years_experience' => 'integer',
            // Accents gardés tels quels : la recherche porte sur ce JSON.
            'skills' => 'json:unicode',
            'profile' => 'json:unicode',
        ];
    }

    /**
     * Bootstrap the model.
     */
    protected static function booted(): void
    {
        static::saving(function (Candidate $candidate) {
            $candidate->email = filled($candidate->email) ? mb_strtolower(trim($candidate->email)) : null;
            $candidate->search_text = self::normalize(implode(' ', array_filter([
                $candidate->name,
                $candidate->email,
                $candidate->phone,
                $candidate->location,
                $candidate->profile['headline'] ?? null,
                implode(' ', $candidate->skills ?? []),
                $candidate->summary,
            ])));
        });

        // La cascade SQL supprime les candidatures, pas leurs fichiers.
        static::deleting(function (Candidate $candidate) {
            $candidate->applications()->pluck('cv_path')->each(
                fn (string $path) => Storage::disk(JobApplication::CV_DISK)->delete($path),
            );
        });
    }

    /**
     * Candidate already known under this e-mail address.
     */
    public static function findByEmail(?string $email): ?self
    {
        return filled($email)
            ? static::query()->where('email', mb_strtolower(trim($email)))->oldest('id')->first()
            : null;
    }

    /**
     * Name shown in the admin, even before the CV has been read.
     *
     * @return Attribute<non-falsy-string, never>
     */
    protected function displayName(): Attribute
    {
        return Attribute::get(fn (): string => $this->name ?: ($this->email ?: "Candidat n° {$this->id}"));
    }

    /**
     * Search on identity and skills.
     *
     * @param  Builder<static>  $query
     */
    #[Scope]
    protected function search(Builder $query, ?string $term): void
    {
        // Chaque mot doit apparaître, quels que soient les accents et la casse.
        foreach (preg_split('/\s+/', self::normalize((string) $term), -1, PREG_SPLIT_NO_EMPTY) ?: [] as $word) {
            $query->where('search_text', 'like', '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $word).'%');
        }
    }

    /**
     * Lowercase text without accents, as stored in search_text.
     */
    public static function normalize(string $text): string
    {
        return Str::lower(Str::ascii($text));
    }

    /**
     * @return BelongsTo<RecruitmentOption, $this>
     */
    public function jobFamily(): BelongsTo
    {
        return $this->belongsTo(RecruitmentOption::class, 'job_family_id');
    }

    /**
     * @return HasMany<JobApplication, $this>
     */
    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    /**
     * Scores of this candidate for offers, from the CV library search.
     *
     * @return HasMany<CandidateMatch, $this>
     */
    public function matches(): HasMany
    {
        return $this->hasMany(CandidateMatch::class);
    }
}
