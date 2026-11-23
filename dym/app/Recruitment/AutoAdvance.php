<?php

namespace App\Recruitment;

use App\Enums\ApplicationEventType;
use App\Enums\StageRole;
use App\Models\JobApplication;
use App\Models\RecruitmentSetting;
use App\Models\RecruitmentStage;
use Illuminate\Database\Eloquent\Builder;

/**
 * Moves the new applications whose AI score reaches the threshold set in the
 * admin to the review stage. Only from the first stage: a candidate the
 * team already moved is never moved back.
 */
class AutoAdvance
{
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
