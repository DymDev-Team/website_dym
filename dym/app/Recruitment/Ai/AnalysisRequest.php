<?php

namespace App\Recruitment\Ai;

use App\Models\JobOffer;
use App\Recruitment\CvDocument;
use Illuminate\Support\Collection;

final readonly class AnalysisRequest
{
    /**
     * @param  Collection<int, JobOffer>  $openOffers  offers the CV is compared to
     * @param  list<string>  $jobFamilies
     * @param  list<array{label: string, answer: string}>  $answers  answers to the offer's questions
     */
    public function __construct(
        public CvDocument $cv,
        public ?JobOffer $targetOffer,
        public Collection $openOffers,
        public array $jobFamilies,
        public ?string $message,
        public ?string $customInstructions,
        public string $apiKey,
        public string $model,
        public string $effort,
        public array $answers = [],
        public bool $webResearch = false,
    ) {}
}
