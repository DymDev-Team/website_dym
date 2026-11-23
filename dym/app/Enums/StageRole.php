<?php

namespace App\Enums;

/**
 * Stage the code relies on, whatever its name in the admin.
 */
enum StageRole: string
{
    /** Receives the applications whose AI score reaches the threshold. */
    case Review = 'review';

    /** Candidates who received the psychotechnical test. */
    case Psychotest = 'psychotest';

    /** Candidates waiting for the managing director's appraisal. */
    case DgReview = 'dg_review';

    /**
     * Label shown in the admin settings.
     */
    public function label(): string
    {
        return match ($this) {
            self::Review => 'Passage automatique',
            self::Psychotest => 'Test psychotechnique',
            self::DgReview => 'Appréciation DG',
        };
    }
}
