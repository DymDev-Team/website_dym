<?php

namespace Database\Factories;

use App\Enums\RecruitmentOptionType;
use App\Models\RecruitmentOption;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RecruitmentOption>
 */
class RecruitmentOptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'type' => RecruitmentOptionType::Source,
            'label' => fake()->unique()->words(2, true),
            'position' => fake()->numberBetween(10, 99),
        ];
    }
}
