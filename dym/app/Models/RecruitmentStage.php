<?php

namespace App\Models;

use App\Enums\StageKind;
use Database\Factories\RecruitmentStageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Column of the recruitment pipeline, editable in the admin.
 *
 * @property int $id
 * @property string $name
 * @property string $color
 * @property StageKind $kind
 * @property int $position
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'color', 'kind', 'position'])]
class RecruitmentStage extends Model
{
    /** @use HasFactory<RecruitmentStageFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'kind' => StageKind::class,
            'position' => 'integer',
        ];
    }

    /**
     * @param  Builder<static>  $query
     */
    #[Scope]
    protected function ordered(Builder $query): void
    {
        $query->orderBy('position')->orderBy('id');
    }

    /**
     * Stage given to every new application: the first open one.
     */
    public static function initial(): self
    {
        return static::query()->ordered()->where('kind', StageKind::Open)->firstOrFail();
    }

    /**
     * @return HasMany<JobApplication, $this>
     */
    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class, 'stage_id');
    }
}
