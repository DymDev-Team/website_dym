<?php

namespace Database\Factories;

use App\Models\Candidate;
use App\Models\JobApplication;
use App\Models\RecruitmentStage;
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
            'candidate_id' => Candidate::factory(),
            'stage_id' => fn () => RecruitmentStage::initial()->id,
            'message' => fake()->paragraph(),
            'cv_path' => 'applications/cv.pdf',
            'cv_name' => 'cv.pdf',
            'cv_mime' => 'application/pdf',
        ];
    }
}
