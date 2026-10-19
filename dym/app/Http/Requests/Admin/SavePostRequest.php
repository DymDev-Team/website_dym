<?php

namespace App\Http\Requests\Admin;

use App\Models\Post;
use App\Rules\ExistingMedia;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SavePostRequest extends FormRequest
{
    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge(['slug' => str($this->input('slug'))->slug()->toString() ?: null]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Post|null $post */
        $post = $this->route('post');

        return [
            'title' => ['required', 'string', 'max:160'],
            'slug' => ['nullable', 'string', 'max:180', Rule::unique(Post::class)->ignore($post?->id)],
            'category' => ['required', 'string', 'max:60'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'body' => ['nullable', 'string', 'max:50000'],
            'image' => [Rule::requiredIf($post === null && ! $this->filled('image_media')), 'nullable', 'image', 'max:5120'],
            // Image choisie dans la médiathèque à la place d'un envoi.
            'image_media' => ['nullable', 'string', new ExistingMedia],
            'published_at' => ['nullable', 'date'],
        ];
    }
}
