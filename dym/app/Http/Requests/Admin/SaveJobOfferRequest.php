<?php

namespace App\Http\Requests\Admin;

use App\Models\JobOffer;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
        ];
    }
}
