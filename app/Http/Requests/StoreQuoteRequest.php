<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreQuoteRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'company' => ['nullable', 'string', 'max:160'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:40'],
            'activity' => ['nullable', 'string', 'max:120'],
            'message' => ['required', 'string', 'max:5000'],
            'deadline' => ['nullable', 'string', 'max:120'],
            'attachment' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,webp,dwg,dxf', 'max:10240'],
            'consent' => ['accepted'],
            // Champ piège invisible : rempli uniquement par les robots.
            'website' => ['prohibited'],
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
            'name.required' => 'Indiquez votre nom.',
            'email.required' => 'Indiquez votre adresse e-mail.',
            'email.email' => 'Cette adresse e-mail n’est pas valide.',
            'phone.required' => 'Indiquez un numéro de téléphone pour que nous puissions vous rappeler.',
            'message.required' => 'Décrivez votre projet en quelques lignes.',
            'attachment.mimes' => 'La pièce jointe doit être un PDF, une image (JPG, PNG, WebP) ou un plan DWG/DXF.',
            'attachment.max' => 'La pièce jointe ne doit pas dépasser 10 Mo.',
            'consent.accepted' => 'Merci d’accepter le traitement de vos données.',
        ];
    }
}
