<?php

namespace App\Enums;

enum QuoteStatus: string
{
    case New = 'new';
    case InProgress = 'in_progress';
    case Quoted = 'quoted';
    case Won = 'won';
    case Lost = 'lost';

    /**
     * Label shown in the admin panel.
     */
    public function label(): string
    {
        return match ($this) {
            self::New => 'Nouvelle',
            self::InProgress => 'En cours d’étude',
            self::Quoted => 'Devis envoyé',
            self::Won => 'Acceptée',
            self::Lost => 'Sans suite',
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
