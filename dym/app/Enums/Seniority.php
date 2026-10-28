<?php

namespace App\Enums;

enum Seniority: string
{
    case Junior = 'junior';
    case Intermediate = 'intermediate';
    case Senior = 'senior';
    case Expert = 'expert';

    /**
     * Label shown in the admin panel.
     */
    public function label(): string
    {
        return match ($this) {
            self::Junior => 'Débutant (0-2 ans)',
            self::Intermediate => 'Confirmé (3-5 ans)',
            self::Senior => 'Senior (6-10 ans)',
            self::Expert => 'Expert (10 ans et plus)',
        };
    }

    /**
     * Options for the seniority filter.
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $seniority) => ['value' => $seniority->value, 'label' => $seniority->label()],
            self::cases(),
        );
    }
}
