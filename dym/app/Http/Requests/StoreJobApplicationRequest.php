<?php

namespace App\Http\Requests;

use App\Enums\QuestionType;
use App\Models\JobOffer;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreJobApplicationRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'job_offer_id' => ['nullable', 'integer', Rule::exists(JobOffer::class, 'id')],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'message' => ['nullable', 'string', 'max:5000'],
            'cv' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
            'consent' => ['accepted'],
            // Champ piège invisible : rempli uniquement par les robots.
            'website' => ['prohibited'],
            'answers' => ['nullable', 'array'],
            ...collect($this->offer()->questions ?? [])->mapWithKeys(fn (array $question) => [
                "answers.{$question['id']}" => QuestionType::from($question['type'])->answerRules($question['required'], $question['options']),
            ])->all(),
        ];
    }

    /**
     * Get custom attributes for validator errors: the question as asked.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return collect($this->offer()->questions ?? [])
            ->mapWithKeys(fn (array $question) => ["answers.{$question['id']}" => "« {$question['label']} »"])
            ->all();
    }

    /**
     * Answers to the offer's questions, with each question's label as asked.
     *
     * @return list<array{id: string, label: string, answer: string}>
     */
    public function answers(): array
    {
        $answers = array_map(fn (array $question) => [
            'id' => $question['id'],
            'label' => $question['label'],
            'answer' => trim((string) $this->input("answers.{$question['id']}")),
        ], $this->offer()->questions ?? []);

        return array_values(array_filter($answers, fn (array $answer) => $answer['answer'] !== ''));
    }

    private function offer(): ?JobOffer
    {
        // Lue une seule fois : règles, libellés et réponses en ont besoin.
        return once(fn () => $this->filled('job_offer_id') ? JobOffer::query()->find($this->integer('job_offer_id')) : null);
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Indiquez votre nom.',
            'email.required' => 'Indiquez votre adresse e-mail.',
            'email.email' => 'Cette adresse e-mail n’est pas valide.',
            'cv.required' => 'Joignez votre CV.',
            'cv.mimes' => 'Le CV doit être au format PDF ou Word.',
            'cv.max' => 'Le CV ne doit pas dépasser 5 Mo.',
            'consent.accepted' => 'Merci d’accepter le traitement de vos données.',
        ];
    }
}
