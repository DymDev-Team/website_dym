<?php

namespace App\Recruitment\Ai;

use App\Recruitment\Exceptions\PermanentAnalysisError;
use App\Recruitment\Exceptions\TransientAnalysisError;

/**
 * Reads a CV and returns the raw structured analysis. Implementations only
 * talk to the model: validation and storage belong to the AnalysisRunner.
 */
interface CandidateAnalyzer
{
    /**
     * @throws TransientAnalysisError
     * @throws PermanentAnalysisError
     */
    public function analyze(AnalysisRequest $request): ModelReply;
}
