<?php

namespace App\Enums;

enum ApplicationEventType: string
{
    case Received = 'received';
    case AddedManually = 'added_manually';
    case Sourced = 'sourced';
    case StageChanged = 'stage_changed';
    case Note = 'note';
    case AnalysisRequested = 'analysis_requested';
    case AnalysisCompleted = 'analysis_completed';
    case AnalysisFailed = 'analysis_failed';
    case CandidateMerged = 'candidate_merged';
}
