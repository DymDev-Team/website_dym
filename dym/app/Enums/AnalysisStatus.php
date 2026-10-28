<?php

namespace App\Enums;

enum AnalysisStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Completed = 'completed';
    case Failed = 'failed';
    case Skipped = 'skipped';

    /**
     * Label shown in the admin panel.
     */
    public function label(): string
    {
        return match ($this) {
            self::Pending => 'En attente',
            self::Processing => 'Analyse en cours',
            self::Completed => 'Analysée',
            self::Failed => 'Échec',
            self::Skipped => 'Non analysée',
        };
    }

    /**
     * Whether the analysis is still waiting for a result.
     */
    public function isActive(): bool
    {
        return $this === self::Pending || $this === self::Processing;
    }
}
