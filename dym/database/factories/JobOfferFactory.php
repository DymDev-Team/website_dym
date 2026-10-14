<?php

namespace Database\Factories;

use App\Models\JobOffer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobOffer>
 */
class JobOfferFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->jobTitle(),
            'department' => 'Atelier',
            'location' => 'Abidjan',
            'contract_type' => 'CDI',
            'summary' => fake()->sentence(),
            'description' => fake()->paragraphs(2, true),
            'requirements' => "Expérience en atelier\nRigueur",
            'is_published' => true,
        ];
    }

    /**
     * Indicate that the offer is no longer open.
     */
    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'closes_at' => today()->subDay(),
        ]);
    }
}
