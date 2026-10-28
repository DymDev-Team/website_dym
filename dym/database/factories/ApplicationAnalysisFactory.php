<?php

namespace Database\Factories;

use App\Enums\AnalysisStatus;
use App\Models\ApplicationAnalysis;
use App\Models\JobApplication;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ApplicationAnalysis>
 */
class ApplicationAnalysisFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'job_application_id' => JobApplication::factory(),
            'status' => AnalysisStatus::Pending,
        ];
    }
}
