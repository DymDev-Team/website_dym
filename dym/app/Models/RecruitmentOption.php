<?php

namespace App\Models;

use App\Enums\RecruitmentOptionType;
use Database\Factories\RecruitmentOptionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Editable list entry of the recruitment module (job family, source...).
 *
 * @property int $id
 * @property RecruitmentOptionType $type
 * @property string $label
 * @property int $position
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['type', 'label', 'position'])]
class RecruitmentOption extends Model
{
    /** @use HasFactory<RecruitmentOptionFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => RecruitmentOptionType::class,
            'position' => 'integer',
        ];
    }

    /**
     * @param  Builder<static>  $query
     */
    #[Scope]
    protected function ofType(Builder $query, RecruitmentOptionType $type): void
    {
        $query->where('type', $type)->orderBy('position')->orderBy('id');
    }

    /**
     * Source given to applications sent from the careers page.
     */
    public static function websiteSource(): ?self
    {
        return static::source('Site web');
    }

    /**
     * Source of the given label, if the team kept it in the list.
     */
    public static function source(string $label): ?self
    {
        return static::query()->ofType(RecruitmentOptionType::Source)->where('label', $label)->first();
    }
}
