<?php

namespace Database\Factories;

use App\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Post>
 */
class PostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'category' => 'Réalisation',
            'excerpt' => fake()->sentence(),
            'body' => fake()->paragraphs(3, true),
            'image' => '/images/actualites/salon-machines.jpg',
            'published_at' => now()->subDay(),
        ];
    }
}
