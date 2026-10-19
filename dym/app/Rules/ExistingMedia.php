<?php

namespace App\Rules;

use App\Support\MediaLibrary;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Image choisie dans la médiathèque : doit exister sur le serveur.
 */
class ExistingMedia implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! MediaLibrary::exists($value)) {
            $fail('Cette image n’existe pas dans la médiathèque.');
        }
    }
}
