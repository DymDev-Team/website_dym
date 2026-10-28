<?php

namespace App\Http\Requests\Admin;

use App\Enums\RecruitmentOptionType;
use App\Models\JobOffer;
use App\Models\RecruitmentOption;
use App\Models\RecruitmentStage;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateJobApplicationRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'stage_id' => ['sometimes', 'required', 'integer', Rule::exists(RecruitmentStage::class, 'id')],
            'job_offer_id' => ['sometimes', 'nullable', 'integer', Rule::exists(JobOffer::class, 'id')],
            'source_id' => ['sometimes', 'nullable', 'integer', Rule::exists(RecruitmentOption::class, 'id')->where('type', RecruitmentOptionType::Source->value)],
        ];
    }
}
