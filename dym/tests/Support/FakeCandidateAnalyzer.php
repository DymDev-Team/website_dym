<?php

namespace Tests\Support;

use App\Recruitment\Ai\AnalysisRequest;
use App\Recruitment\Ai\CandidateAnalyzer;
use App\Recruitment\Ai\ModelReply;
use Closure;
use Throwable;

/**
 * Stands in for Claude in tests: returns a canned analysis, or throws.
 */
class FakeCandidateAnalyzer implements CandidateAnalyzer
{
    /** @var list<AnalysisRequest> */
    public array $requests = [];

    /**
     * @param  array<string, mixed>|Closure(AnalysisRequest): array<string, mixed>|Throwable  $answer
     */
    public function __construct(public array|Closure|Throwable $answer = []) {}

    public function analyze(AnalysisRequest $request): ModelReply
    {
        $this->requests[] = $request;

        if ($this->answer instanceof Throwable) {
            throw $this->answer;
        }

        $data = $this->answer instanceof Closure ? ($this->answer)($request) : $this->answer;

        return new ModelReply(
            data: array_replace_recursive(self::result($request->targetOffer !== null), $data),
            model: $request->model,
            inputTokens: 5000,
            outputTokens: 1500,
        );
    }

    /**
     * Valid analysis as the model would return it.
     *
     * @return array<string, mixed>
     */
    public static function result(bool $withEvaluation = true): array
    {
        return [
            'profile' => [
                'name' => 'Awa Koné',
                'email' => 'awa@example.com',
                'phone' => '+225 07 00 00 00 00',
                'location' => 'Abidjan',
                'headline' => 'Soudeuse TIG',
                'years_experience' => 5,
                'seniority' => 'intermediate',
                'job_family' => 'Soudure',
                'skills' => ['Soudure TIG', 'Lecture de plans'],
                'languages' => ['Français'],
                'certifications' => [],
                'education' => [['degree' => 'CAP Soudure', 'institution' => null, 'year' => '2019']],
                'experiences' => [['title' => 'Soudeuse', 'company' => 'Atelier X', 'period' => '2020-2025', 'highlights' => null]],
            ],
            'summary' => 'Soudeuse TIG confirmée, cinq ans en atelier.',
            'evaluation' => $withEvaluation ? [
                'score' => 82,
                'recommendation' => 'priority',
                'criteria' => [['name' => 'Soudure TIG', 'score' => 9, 'evidence' => '5 ans de TIG inox']],
                'strengths' => ['Expérience TIG'],
                'concerns' => [],
                'interview_questions' => ['Quelles épaisseurs soudez-vous ?'],
            ] : null,
            'offer_matches' => [],
            'research' => [['subject' => 'Atelier X', 'kind' => 'company', 'finding' => 'Atelier de chaudronnerie à Abidjan.', 'source_url' => 'https://example.com/atelier-x']],
            'assessment' => [
                'overall' => 'Parcours cohérent en soudure, expérience solide.',
                'strengths' => ['Expérience TIG'],
                'concerns' => [],
                'suggested_roles' => ['Soudeur TIG'],
            ],
            'warnings' => [],
        ];
    }
}
