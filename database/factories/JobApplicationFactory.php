<?php

namespace Database\Factories;

use App\Enums\ApplicationStatus;
use App\Models\JobApplication;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobApplication>
 */
class JobApplicationFactory extends Factory
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
            'email' => fake()->safeEmail(),
            'phone' => '+225 07 00 00 00 00',
            'message' => fake()->paragraph(),
            'cv_path' => 'applications/cv.pdf',
            'cv_name' => 'cv.pdf',
            'status' => ApplicationStatus::New,
        ];
    }
}
