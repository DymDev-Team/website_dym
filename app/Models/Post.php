<?php

namespace App\Models;

use App\Concerns\HasMediaUrls;
use Database\Factories\PostFactory;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $title
 * @property string $slug
 * @property string $category
 * @property string|null $excerpt
 * @property string|null $body
 * @property string $image
 * @property Carbon|null $published_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read string|null $image_url
 */
#[Fillable(['title', 'slug', 'category', 'excerpt', 'body', 'image', 'published_at'])]
#[Appends(['image_url'])]
class Post extends Model
{
    /** @use HasFactory<PostFactory> */
    use HasFactory, HasMediaUrls;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    /**
     * Bootstrap the model.
     */
    protected static function booted(): void
    {
        static::saving(function (Post $post) {
            if (blank($post->slug)) {
                $post->slug = static::uniqueSlug($post->title, $post->id);
            }
        });
    }

    /**
     * Build a slug from the title that no other post uses.
     */
    public static function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'actualite';
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
     * Only keep posts whose publication date has passed.
     *
     * @param  Builder<static>  $query
     */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    /**
     * Whether the post is visible on the public site.
     */
    public function isPublished(): bool
    {
        return $this->published_at !== null && $this->published_at->isPast();
    }

    /**
     * @return Attribute<string|null, never>
     */
    protected function imageUrl(): Attribute
    {
        return Attribute::get(fn () => $this->mediaUrl($this->image));
    }
}
