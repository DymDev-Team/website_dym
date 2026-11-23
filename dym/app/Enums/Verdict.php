<?php

namespace App\Enums;

/**
 * Hiring advice of the AI, given once the three scores are known.
 */
enum Verdict: string
{
    case Hire = 'hire';
    case Discuss = 'discuss';
    case Reject = 'reject';

    public function label(): string
    {
        return match ($this) {
            self::Hire => 'Recruter',
            self::Discuss => 'À discuter',
            self::Reject => 'Ne pas recruter',
        };
    }
}
