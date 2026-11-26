<?php

namespace App\Recruitment;

use App\Enums\ApplicationEventType;
use App\Enums\StageKind;
use App\Enums\StageRole;
use App\Models\JobApplication;
use App\Models\RecruitmentSetting;
use App\Models\RecruitmentStage;
use Illuminate\Database\Eloquent\Builder;

/**
 * Automatic moves in the pipeline: the new applications whose AI score
 * reaches the threshold set in the admin go to the review stage, and a
 * candidate who finishes the psychotechnical test goes to the test stage.
 * A candidate the team already moved further is never moved back.
 */
class AutoAdvance
{
    /**
     * The test is taken during the review: once finished, the candidate
     * joins the test column, unless already in a later or closed stage.
     */
    public static function afterPsychotest(JobApplication $application): bool
    {
        $target = RecruitmentStage::withRole(StageRole::Psychotest);
        $current = $application->stage;

        if ($target === null || $current->is($target) || $current->kind !== StageKind::Open || $current->position > $target->position) {
            return false;
        }

        $application->update(['stage_id' => $target->id]);
        $application->record(ApplicationEventType::StageChanged, [
            'from' => $current->name,
            'to' => $target->name,
            'auto' => true,
            'reason' => 'psychotest',
        ]);

        return true;
    }

    /**
     * Move one application after its analysis, if it qualifies.
     */
    public static function apply(JobApplication $application): bool
    {
        $target = self::target();

        if ($target === null || ! self::qualifying()->whereKey($application->id)->exists()) {
            return false;
        }

        self::move($application, $target);

        return true;
    }

    /**
     * Move every qualifying application, for those already waiting.
     */
    public static function applyToAll(): int
    {
        $target = self::target();

        if ($target === null) {
            return 0;
        }

        $applications = self::qualifying()->get();
        $applications->each(fn (JobApplication $application) => self::move($application, $target));

        return $applications->count();
    }

    /**
     * How many waiting applications the current threshold would move.
     */
    public static function pending(): int
    {
        return self::target() === null ? 0 : self::qualifying()->count();
    }

    /**
     * Review stage, when the move is enabled and that stage still exists.
     */
    private static function target(): ?RecruitmentStage
    {
        return RecruitmentSetting::values()['auto_advance'] ? RecruitmentStage::withRole(StageRole::Review) : null;
    }

    /**
     * @return Builder<JobApplication>
     */
    private static function qualifying(): Builder
    {
        return JobApplication::query()
            ->where('stage_id', RecruitmentStage::initial()->id)
            ->where('score', '>=', RecruitmentSetting::values()['auto_advance_threshold']);
    }

    private static function move(JobApplication $application, RecruitmentStage $target): void
    {
        $from = $application->stage->name;
        $application->update(['stage_id' => $target->id]);
        $application->record(ApplicationEventType::StageChanged, [
            'from' => $from,
            'to' => $target->name,
            'auto' => true,
            'score' => $application->score,
        ]);
    }
}
