<?php

namespace App\Models;

use App\Concerns\HasMediaUrls;
use App\Concerns\Publishable;
use Database\Factories\ActivityFactory;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $title
 * @property string $description
 * @property string $image
 * @property string|null $image_alt
 * @property int $position
 * @property bool $is_published
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read string|null $image_url
 */
#[Fillable(['title', 'description', 'image', 'image_alt', 'position', 'is_published'])]
#[Appends(['image_url'])]
class Activity extends Model
{
    /** @use HasFactory<ActivityFactory> */
    use HasFactory, HasMediaUrls, Publishable;

    /**
     * @return Attribute<string|null, never>
     */
    protected function imageUrl(): Attribute
    {
        return Attribute::get(fn () => $this->mediaUrl($this->image));
    }
}
