<?php

namespace App\Http\Requests\Admin;

use App\Rules\ExistingMedia;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveEquipmentRequest extends FormRequest
{
    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge(['is_published' => $this->boolean('is_published')]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'description' => ['required', 'string', 'max:500'],
            'image' => [Rule::requiredIf($this->route('equipment') === null && ! $this->filled('image_media')), 'nullable', 'image', 'max:5120'],
            // Image choisie dans la médiathèque à la place d'un envoi.
            'image_media' => ['nullable', 'string', new ExistingMedia],
            'position' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_published' => ['boolean'],
        ];
    }
}
