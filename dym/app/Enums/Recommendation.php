<?php

namespace App\Enums;

enum Recommendation: string
{
    case Priority = 'priority';
    case Consider = 'consider';
    case NotMatching = 'not_matching';

    /**
     * Label shown in the admin panel.
     */
    public function label(): string
    {
        return match ($this) {
            self::Priority => 'À rencontrer en priorité',
            self::Consider => 'À étudier',
            self::NotMatching => 'Ne correspond pas',
        };
    }
}
