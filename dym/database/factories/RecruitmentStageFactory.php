<?php

namespace Database\Factories;

use App\Enums\StageKind;
use App\Models\RecruitmentStage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RecruitmentStage>
 */
class RecruitmentStageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true),
            'color' => '#2563eb',
            'kind' => StageKind::Open,
            'position' => fake()->numberBetween(10, 99),
        ];
    }
}
