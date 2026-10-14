<?php

namespace App\Concerns;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;

/**
 * Content blocks shown on the public site in a manual order.
 */
trait Publishable
{
    /**
     * Initialize the trait.
     */
    public function initializePublishable(): void
    {
        $this->mergeCasts([
            'position' => 'integer',
            'is_published' => 'boolean',
        ]);
    }

    /**
     * Only keep the items visible on the public site.
     *
     * @param  Builder<static>  $query
     */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->where('is_published', true);
    }

    /**
     * Sort by manual position, then by creation.
     *
     * @param  Builder<static>  $query
     */
    #[Scope]
    protected function ordered(Builder $query): void
    {
        $query->orderBy('position')->orderBy('id');
    }
}
