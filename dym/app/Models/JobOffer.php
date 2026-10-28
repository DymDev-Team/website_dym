<?php

namespace App\Models;

use Database\Factories\JobOfferFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $title
 * @property string $slug
 * @property string|null $department
 * @property string $location
 * @property string $contract_type
 * @property string|null $summary
 * @property string|null $description
 * @property string|null $requirements
 * @property list<array{name: string, weight: int, essential: bool}>|null $criteria
 * @property list<array{id: string, label: string, type: string, options: list<string>, required: bool}>|null $questions
 * @property Carbon|null $sourcing_started_at
 * @property Carbon|null $closes_at
 * @property bool $is_published
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, JobApplication> $applications
 * @property-read Collection<int, CandidateMatch> $matches
 */
#[Fillable(['title', 'slug', 'department', 'location', 'contract_type', 'summary', 'description', 'requirements', 'criteria', 'questions', 'closes_at', 'is_published'])]
// La grille d'évaluation est interne : l'admin la rend visible quand il en a besoin.
#[Hidden(['criteria', 'sourcing_started_at'])]
class JobOffer extends Model
{
    /** @use HasFactory<JobOfferFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'closes_at' => 'date:Y-m-d',
            'is_published' => 'boolean',
            'criteria' => 'json:unicode',
            'questions' => 'json:unicode',
            'sourcing_started_at' => 'datetime',
        ];
    }

    /**
     * Bootstrap the model.
     */
    protected static function booted(): void
    {
        static::saving(function (JobOffer $offer) {
            if (blank($offer->slug)) {
                $offer->slug = static::uniqueSlug($offer->title, $offer->id);
            }
        });
    }

    /**
     * Build a slug from the title that no other offer uses.
     */
    public static function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'offre';
        $slug = $base;

        for ($i = 2; static::query()->where('slug', $slug)->when($ignoreId, fn (Builder $q) => $q->whereKeyNot($ignoreId))->exists(); $i++) {
            $slug = "{$base}-{$i}";
        }

        return $slug;
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Offers visible on the careers page (published and not closed).
     *
     * @param  Builder<static>  $query
     */
    #[Scope]
    protected function open(Builder $query): void
    {
        $query->where('is_published', true)
            ->where(fn (Builder $q) => $q->whereNull('closes_at')->orWhereDate('closes_at', '>=', today()));
    }

    /**
     * Whether candidates can still apply.
     */
    public function isOpen(): bool
    {
        return $this->is_published && ($this->closes_at === null || ! $this->closes_at->isBefore(today()));
    }

    /**
     * @return HasMany<JobApplication, $this>
     */
    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    /**
     * Candidates of the CV library scored for this offer.
     *
     * @return HasMany<CandidateMatch, $this>
     */
    public function matches(): HasMany
    {
        return $this->hasMany(CandidateMatch::class);
    }
}
