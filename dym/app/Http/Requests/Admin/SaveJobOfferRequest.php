<?php

namespace App\Http\Requests\Admin;

use App\Enums\QuestionType;
use App\Models\JobOffer;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class SaveJobOfferRequest extends FormRequest
{
    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'slug' => str($this->input('slug'))->slug()->toString() ?: null,
            'is_published' => $this->boolean('is_published'),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var JobOffer|null $offer */
        $offer = $this->route('job_offer');

        return [
            'title' => ['required', 'string', 'max:160'],
            'slug' => ['nullable', 'string', 'max:180', Rule::unique(JobOffer::class)->ignore($offer?->id)],
            'department' => ['nullable', 'string', 'max:80'],
            'location' => ['required', 'string', 'max:120'],
            'contract_type' => ['required', 'string', 'max:60'],
            'summary' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:20000'],
            'requirements' => ['nullable', 'string', 'max:5000'],
            'closes_at' => ['nullable', 'date'],
            'is_published' => ['boolean'],
            'criteria' => ['nullable', 'array', 'max:10'],
            'criteria.*.name' => ['required', 'string', 'max:120', 'distinct:ignore_case'],
            'criteria.*.weight' => ['required', 'integer', 'between:1,5'],
            'criteria.*.essential' => ['nullable', 'boolean'],
            'questions' => ['nullable', 'array', 'max:10'],
            'questions.*.id' => ['required', 'string', 'alpha_dash', 'max:40', 'distinct'],
            'questions.*.label' => ['required', 'string', 'max:300'],
            'questions.*.type' => ['required', Rule::enum(QuestionType::class)],
            'questions.*.options' => ['nullable', 'string', 'max:2000'],
            'questions.*.required' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get the "after" validation callables for the request.
     *
     * @return list<callable>
     */
    public function after(): array
    {
        return [function (Validator $validator) {
            foreach ((array) $this->input('questions', []) as $index => $question) {
                if (($question['type'] ?? null) === QuestionType::Choice->value && count(self::lines($question['options'] ?? '')) < 2) {
                    $validator->errors()->add("questions.{$index}.options", 'Une question à choix demande au moins deux réponses possibles, une par ligne.');
                }
            }
        }];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'criteria.max' => 'La grille ne peut pas dépasser 10 critères.',
            'criteria.*.name.required' => 'Chaque critère doit avoir un nom.',
            'criteria.*.name.distinct' => 'Deux critères portent le même nom.',
            'criteria.*.weight.between' => 'Le poids d’un critère va de 1 à 5.',
            'questions.max' => 'Le formulaire ne peut pas dépasser 10 questions.',
            'questions.*.label.required' => 'Chaque question doit avoir un intitulé.',
        ];
    }

    /**
     * Validated offer, with the grid and the questions in their stored form.
     *
     * @return array<string, mixed>
     */
    public function offerData(): array
    {
        $validated = $this->validated();

        $criteria = array_values(array_map(fn (array $criterion) => [
            'name' => trim($criterion['name']),
            'weight' => (int) $criterion['weight'],
            'essential' => filter_var($criterion['essential'] ?? false, FILTER_VALIDATE_BOOLEAN),
        ], $validated['criteria'] ?? []));

        $questions = array_values(array_map(fn (array $question) => [
            'id' => $question['id'],
            'label' => trim($question['label']),
            'type' => $question['type'],
            'options' => $question['type'] === QuestionType::Choice->value ? self::lines($question['options'] ?? '') : [],
            'required' => filter_var($question['required'] ?? false, FILTER_VALIDATE_BOOLEAN),
        ], $validated['questions'] ?? []));

        return [
            ...$validated,
            'criteria' => $criteria === [] ? null : $criteria,
            'questions' => $questions === [] ? null : $questions,
        ];
    }

    /**
     * One answer per line, blanks and duplicates removed.
     *
     * @return list<string>
     */
    private static function lines(mixed $text): array
    {
        $lines = preg_split('/\R/', is_string($text) ? $text : '') ?: [];

        return array_values(array_unique(array_filter(array_map(trim(...), $lines), fn (string $line) => $line !== '')));
    }
}
