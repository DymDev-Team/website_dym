<?php

namespace App\Enums;

enum StageKind: string
{
    case Open = 'open';
    case Hired = 'hired';
    case Rejected = 'rejected';

    /**
     * Label shown in the admin panel.
     */
    public function label(): string
    {
        return match ($this) {
            self::Open => 'En cours',
            self::Hired => 'Embauche',
            self::Rejected => 'Refus',
        };
    }

    /**
     * Whether a candidate in this stage is out of the pipeline.
     */
    public function isFinal(): bool
    {
        return $this !== self::Open;
    }

    /**
     * Options for the kind select.
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $kind) => ['value' => $kind->value, 'label' => $kind->label()],
            self::cases(),
        );
    }
}
