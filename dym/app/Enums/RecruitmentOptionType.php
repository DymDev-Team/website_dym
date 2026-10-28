<?php

namespace App\Enums;

enum RecruitmentOptionType: string
{
    case JobFamily = 'job_family';
    case Source = 'source';

    /**
     * Label shown in the admin panel.
     */
    public function label(): string
    {
        return match ($this) {
            self::JobFamily => 'Familles de métiers',
            self::Source => 'Sources des candidatures',
        };
    }
}
