<?php

namespace App\Recruitment\Ai;

use App\Enums\Recommendation;
use App\Enums\Seniority;
use Illuminate\Validation\Rule;

/**
 * Shape of an analysis: the JSON schema the model must follow, and the
 * Laravel rules that check it again before anything is stored.
 */
final class AnalysisSchema
{
    /**
     * JSON schema sent as structured output format.
     *
     * @return array<string, mixed>
     */
    public static function jsonSchema(): array
    {
        $string = ['type' => 'string'];
        // Texte vide plutôt que null : chaque « anyOf » alourdit la grammaire, que l'API limite.
        $nullableString = $string;
        $strings = ['type' => 'array', 'items' => $string];

        return self::object([
            'profile' => self::object([
                'name' => $nullableString,
                'email' => $nullableString,
                'phone' => $nullableString,
                'location' => $nullableString,
                'headline' => $nullableString,
                'years_experience' => ['anyOf' => [['type' => 'integer'], ['type' => 'null']]],
                'seniority' => ['type' => 'string', 'enum' => [...array_column(Seniority::cases(), 'value'), 'unknown']],
                'job_family' => $nullableString,
                'skills' => $strings,
                'languages' => $strings,
                'certifications' => $strings,
                'education' => ['type' => 'array', 'items' => self::object([
                    'degree' => $string,
                    'institution' => $nullableString,
                    'year' => $nullableString,
                ])],
                'experiences' => ['type' => 'array', 'items' => self::object([
                    'title' => $string,
                    'company' => $nullableString,
                    'period' => $nullableString,
                    'highlights' => $nullableString,
                ])],
            ]),
            'summary' => $string,
            'evaluation' => ['anyOf' => [
                self::object([
                    'score' => ['type' => 'integer'],
                    'recommendation' => ['type' => 'string', 'enum' => array_column(Recommendation::cases(), 'value')],
                    'criteria' => ['type' => 'array', 'items' => self::object([
                        'name' => $string,
                        'score' => ['type' => 'integer'],
                        'evidence' => $string,
                    ])],
                    'strengths' => $strings,
                    'concerns' => $strings,
                    'interview_questions' => $strings,
                ]),
                ['type' => 'null'],
            ]],
            'offer_matches' => ['type' => 'array', 'items' => self::object([
                'offer_id' => ['type' => 'integer'],
                'score' => ['type' => 'integer'],
                'reason' => $string,
            ])],
            'assessment' => self::object([
                'overall' => $string,
                'strengths' => $strings,
                'concerns' => $strings,
                'suggested_roles' => $strings,
            ]),
            'warnings' => $strings,
        ]);
    }

    /**
     * The model's answer in the stored form: empty texts and « unknown »
     * become null, as the rules and the admin expect.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public static function normalize(array $data): array
    {
        $blankToNull = fn (mixed $value) => is_string($value) && trim($value) === '' ? null : $value;

        if (is_array($data['profile'] ?? null)) {
            $profile = $data['profile'];

            foreach (['name', 'email', 'phone', 'location', 'headline', 'job_family'] as $field) {
                $profile[$field] = $blankToNull($profile[$field] ?? null);
            }

            $profile['seniority'] = in_array($profile['seniority'] ?? null, ['unknown', ''], true) ? null : ($profile['seniority'] ?? null);

            foreach (['education' => ['institution', 'year'], 'experiences' => ['company', 'period', 'highlights']] as $list => $fields) {
                $profile[$list] = array_map(function ($item) use ($fields, $blankToNull) {
                    if (is_array($item)) {
                        foreach ($fields as $field) {
                            $item[$field] = $blankToNull($item[$field] ?? null);
                        }
                    }

                    return $item;
                }, is_array($profile[$list] ?? null) ? $profile[$list] : []);
            }

            $data['profile'] = $profile;
        }

        return $data;
    }

    /**
     * Schema of the separate web research call: kept small, since the API
     * refuses an output grammar too large once a tool is attached.
     *
     * @return array<string, mixed>
     */
    public static function researchSchema(): array
    {
        return self::object([
            'research' => ['type' => 'array', 'items' => self::object([
                'subject' => ['type' => 'string'],
                'kind' => ['type' => 'string', 'enum' => ['school', 'company', 'other']],
                'finding' => ['type' => 'string'],
                'source_url' => ['anyOf' => [['type' => 'string'], ['type' => 'null']]],
            ])],
        ]);
    }

    /**
     * Rules applied to the model's answer. Bounds the JSON schema cannot
     * express (scores, lengths, list sizes) are enforced here.
     *
     * @param  list<int>  $offerIds  offers the CV was compared to
     * @return array<string, mixed>
     */
    public static function rules(bool $withEvaluation, array $offerIds): array
    {
        $evaluation = $withEvaluation ? [
            'evaluation' => ['required', 'array'],
            'evaluation.score' => ['required', 'integer', 'between:0,100'],
            'evaluation.recommendation' => ['required', Rule::enum(Recommendation::class)],
            'evaluation.criteria' => ['required', 'array', 'min:1', 'max:12'],
            'evaluation.criteria.*.name' => ['required', 'string', 'max:200'],
            'evaluation.criteria.*.score' => ['required', 'integer', 'between:0,10'],
            'evaluation.criteria.*.evidence' => ['required', 'string', 'max:1000'],
            'evaluation.strengths' => ['present', 'array', 'max:10'],
            'evaluation.strengths.*' => ['string', 'max:500'],
            'evaluation.concerns' => ['present', 'array', 'max:10'],
            'evaluation.concerns.*' => ['string', 'max:500'],
            'evaluation.interview_questions' => ['present', 'array', 'max:10'],
            'evaluation.interview_questions.*' => ['string', 'max:500'],
        ] : [
            'evaluation' => ['nullable', 'prohibited'],
        ];

        return [
            ...$evaluation,
            'profile' => ['required', 'array'],
            'profile.name' => ['nullable', 'string', 'max:160'],
            'profile.email' => ['nullable', 'string', 'max:255'],
            'profile.phone' => ['nullable', 'string', 'max:60'],
            'profile.location' => ['nullable', 'string', 'max:160'],
            'profile.headline' => ['nullable', 'string', 'max:200'],
            'profile.years_experience' => ['nullable', 'integer', 'between:0,60'],
            'profile.seniority' => ['nullable', Rule::enum(Seniority::class)],
            'profile.job_family' => ['nullable', 'string', 'max:120'],
            'profile.skills' => ['present', 'array', 'max:40'],
            'profile.skills.*' => ['string', 'max:120'],
            'profile.languages' => ['present', 'array', 'max:15'],
            'profile.languages.*' => ['string', 'max:80'],
            'profile.certifications' => ['present', 'array', 'max:30'],
            'profile.certifications.*' => ['string', 'max:200'],
            'profile.education' => ['present', 'array', 'max:20'],
            'profile.education.*.degree' => ['required', 'string', 'max:255'],
            'profile.education.*.institution' => ['nullable', 'string', 'max:255'],
            'profile.education.*.year' => ['nullable', 'string', 'max:40'],
            'profile.experiences' => ['present', 'array', 'max:30'],
            'profile.experiences.*.title' => ['required', 'string', 'max:255'],
            'profile.experiences.*.company' => ['nullable', 'string', 'max:255'],
            'profile.experiences.*.period' => ['nullable', 'string', 'max:80'],
            'profile.experiences.*.highlights' => ['nullable', 'string', 'max:1500'],
            'summary' => ['required', 'string', 'max:1500'],
            'offer_matches' => ['present', 'array', 'max:10'],
            'offer_matches.*.offer_id' => ['required', 'integer', Rule::in($offerIds)],
            'offer_matches.*.score' => ['required', 'integer', 'between:0,100'],
            'offer_matches.*.reason' => ['required', 'string', 'max:600'],
            'research' => ['present', 'array', 'max:8'],
            'research.*.subject' => ['required', 'string', 'max:200'],
            'research.*.kind' => ['required', 'in:school,company,other'],
            'research.*.finding' => ['required', 'string', 'max:800'],
            'research.*.source_url' => ['nullable', 'string', 'max:500', 'starts_with:http://,https://'],
            'assessment' => ['required', 'array'],
            'assessment.overall' => ['required', 'string', 'max:2000'],
            'assessment.strengths' => ['present', 'array', 'max:6'],
            'assessment.strengths.*' => ['string', 'max:400'],
            'assessment.concerns' => ['present', 'array', 'max:6'],
            'assessment.concerns.*' => ['string', 'max:400'],
            'assessment.suggested_roles' => ['present', 'array', 'max:5'],
            'assessment.suggested_roles.*' => ['string', 'max:120'],
            'warnings' => ['present', 'array', 'max:10'],
            'warnings.*' => ['string', 'max:500'],
        ];
    }

    /**
     * Object schema in the strict form structured outputs require.
     *
     * @param  array<string, mixed>  $properties
     * @return array<string, mixed>
     */
    public static function object(array $properties): array
    {
        return [
            'type' => 'object',
            'properties' => $properties,
            'required' => array_keys($properties),
            'additionalProperties' => false,
        ];
    }
}
