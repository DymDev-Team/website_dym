<?php

namespace Database\Factories;

use App\Enums\QuoteStatus;
use App\Models\QuoteRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuoteRequest>
 */
class QuoteRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'company' => fake()->optional()->company(),
            'email' => fake()->safeEmail(),
            'phone' => '+225 07 '.fake()->numerify('## ## ## ##'),
            'activity' => fake()->randomElement(['Menuiserie métallique', 'Usinage métallique', 'Chaudronnerie industrielle']),
            'message' => fake()->paragraph(),
            'deadline' => fake()->optional()->randomElement(['Dès que possible', 'Sous 1 mois', 'Sous 3 mois']),
            'status' => QuoteStatus::New,
        ];
    }
}
