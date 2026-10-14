<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->words(3, true),
            'category' => 'Menuiserie métallique',
            'image' => '/images/realisations/pergola.jpg',
            'position' => fake()->numberBetween(1, 10),
            'is_published' => true,
        ];
    }
}
