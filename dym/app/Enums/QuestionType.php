<?php

namespace App\Enums;

use Illuminate\Validation\Rule;

enum QuestionType: string
{
    case Text = 'text';
    case Textarea = 'textarea';
    case Choice = 'choice';
    case YesNo = 'yes_no';
    case Number = 'number';

    /**
     * Label shown in the admin panel.
     */
    public function label(): string
    {
        return match ($this) {
            self::Text => 'Réponse courte',
            self::Textarea => 'Réponse longue',
            self::Choice => 'Choix dans une liste',
            self::YesNo => 'Oui / non',
            self::Number => 'Nombre',
        };
    }

    /**
     * Rules for the candidate's answer.
     *
     * @param  list<string>  $options
     * @return list<mixed>
     */
    public function answerRules(bool $required, array $options): array
    {
        return [
            $required ? 'required' : 'nullable',
            ...match ($this) {
                self::Text => ['string', 'max:500'],
                self::Textarea => ['string', 'max:3000'],
                self::Choice => ['string', Rule::in($options)],
                self::YesNo => ['in:oui,non'],
                self::Number => ['numeric', 'between:0,1000000'],
            },
        ];
    }

    /**
     * Options for the type select.
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $type) => ['value' => $type->value, 'label' => $type->label()],
            self::cases(),
        );
    }
}
