<?php

namespace App\Models;

use App\Concerns\HasMediaUrls;
use App\Concerns\Publishable;
use Database\Factories\PartnerFactory;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $logo
 * @property string|null $website_url
 * @property int $position
 * @property bool $is_published
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read string|null $logo_url
 */
#[Fillable(['name', 'logo', 'website_url', 'position', 'is_published'])]
#[Appends(['logo_url'])]
class Partner extends Model
{
    /** @use HasFactory<PartnerFactory> */
    use HasFactory, HasMediaUrls, Publishable;

    /**
     * @return Attribute<string|null, never>
     */
    protected function logoUrl(): Attribute
    {
        return Attribute::get(fn () => $this->mediaUrl($this->logo));
    }
}
