<?php

namespace App\Http\Requests\Admin;

use App\Enums\RecruitmentOptionType;
use App\Models\JobOffer;
use App\Models\RecruitmentOption;
use App\Models\RecruitmentStage;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreManualApplicationRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'cv' => ['required', 'file', 'mimes:'.implode(',', config('recruitment.cv_mimes')), 'max:10240'],
            'job_offer_id' => ['nullable', 'integer', Rule::exists(JobOffer::class, 'id')],
            'source_id' => ['nullable', 'integer', Rule::exists(RecruitmentOption::class, 'id')->where('type', RecruitmentOptionType::Source->value)],
            'stage_id' => ['nullable', 'integer', Rule::exists(RecruitmentStage::class, 'id')],
            'name' => ['nullable', 'string', 'max:160'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:60'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'cv.required' => 'Joignez un CV.',
            'cv.mimes' => 'Formats acceptés : PDF, Word, JPG, PNG ou WebP.',
            'cv.max' => 'Le CV ne doit pas dépasser 10 Mo.',
        ];
    }
}
