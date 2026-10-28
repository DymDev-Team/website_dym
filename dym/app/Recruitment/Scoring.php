<?php

namespace App\Recruitment;

use App\Enums\Recommendation;
use App\Models\RecruitmentSetting;

/**
 * Turns the criteria scored by the model into the final score and opinion,
 * the same way for every CV: weighted average over the offer's grid, then
 * the thresholds set in the admin. The model never sets the score alone.
 */
final class Scoring
{
    // En dessous de cette note sur 10, un critère indispensable n'est pas démontré.
    public const ESSENTIAL_MINIMUM = 5;

    /**
     * Apply the offer's grid and the thresholds to the model's evaluation.
     *
     * @param  array{score: int, recommendation: string, criteria: list<array{name: string, score: int, evidence: string}>, concerns: list<string>}  $evaluation
     * @param  list<array{name: string, weight: int, essential: bool}>|null  $grid
     * @return array{score: int, recommendation: string, criteria: list<array{name: string, score: int, evidence: string}>, concerns: list<string>, model_score: int}
     */
    public static function apply(array $evaluation, ?array $grid): array
    {
        $evaluation['model_score'] = $evaluation['score'];
        $gaps = [];

        if (filled($grid)) {
            $evaluation['criteria'] = self::alignedCriteria($grid, $evaluation['criteria']);
            $evaluation['score'] = self::weightedScore($grid, $evaluation['criteria']);
            $gaps = self::essentialGaps($grid, $evaluation['criteria']);
        }

        foreach (array_reverse($gaps) as $name) {
            array_unshift($evaluation['concerns'], "Critère indispensable non démontré : {$name}.");
        }

        $evaluation['recommendation'] = self::recommendation($evaluation['score'], $gaps !== [])->value;

        return $evaluation;
    }

    /**
     * Opinion from the score and the thresholds; a missing essential
     * criterion caps it to « à étudier ».
     */
    public static function recommendation(int $score, bool $essentialGap = false): Recommendation
    {
        $settings = RecruitmentSetting::values();

        return match (true) {
            $score >= $settings['priority_threshold'] && ! $essentialGap => Recommendation::Priority,
            $score >= $settings['consider_threshold'] => Recommendation::Consider,
            default => Recommendation::NotMatching,
        };
    }

    /**
     * The grid's criteria in the grid's order, with the model's score and
     * evidence; a criterion the model skipped counts as 0.
     *
     * @param  list<array{name: string, weight: int, essential: bool}>  $grid
     * @param  list<array{name: string, score: int, evidence: string}>  $scored
     * @return list<array{name: string, score: int, evidence: string}>
     */
    private static function alignedCriteria(array $grid, array $scored): array
    {
        $byName = [];

        foreach ($scored as $criterion) {
            $byName[self::key($criterion['name'])] ??= $criterion;
        }

        return array_map(fn (array $criterion) => [
            'name' => $criterion['name'],
            'score' => $byName[self::key($criterion['name'])]['score'] ?? 0,
            'evidence' => $byName[self::key($criterion['name'])]['evidence'] ?? 'Non évalué.',
        ], $grid);
    }

    /**
     * @param  list<array{name: string, weight: int, essential: bool}>  $grid
     * @param  list<array{name: string, score: int, evidence: string}>  $criteria  aligned on the grid
     */
    private static function weightedScore(array $grid, array $criteria): int
    {
        $total = 0;
        $weights = 0;

        foreach ($grid as $index => $criterion) {
            $total += $criterion['weight'] * $criteria[$index]['score'];
            $weights += $criterion['weight'];
        }

        return $weights === 0 ? 0 : (int) round($total * 10 / $weights);
    }

    /**
     * @param  list<array{name: string, weight: int, essential: bool}>  $grid
     * @param  list<array{name: string, score: int, evidence: string}>  $criteria  aligned on the grid
     * @return list<string>
     */
    private static function essentialGaps(array $grid, array $criteria): array
    {
        $gaps = [];

        foreach ($grid as $index => $criterion) {
            if ($criterion['essential'] && $criteria[$index]['score'] < self::ESSENTIAL_MINIMUM) {
                $gaps[] = $criterion['name'];
            }
        }

        return $gaps;
    }

    private static function key(string $name): string
    {
        return mb_strtolower(trim($name));
    }
}
