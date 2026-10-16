<?php

namespace App\Enums;

enum ApplicationStatus: string
{
    case New = 'new';
    case Reviewing = 'reviewing';
    case Interview = 'interview';
    case Rejected = 'rejected';
    case Hired = 'hired';

    /**
     * Label shown in the admin panel.
     */
    public function label(): string
    {
        return match ($this) {
            self::New => 'Nouvelle',
            self::Reviewing => 'En cours d’étude',
            self::Interview => 'Entretien',
            self::Rejected => 'Refusée',
            self::Hired => 'Retenue',
        };
    }

    /**
     * Options for the status select.
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $status) => ['value' => $status->value, 'label' => $status->label()],
            self::cases(),
        );
    }
}
