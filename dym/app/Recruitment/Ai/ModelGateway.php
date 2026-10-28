<?php

namespace App\Recruitment\Ai;

use App\Recruitment\Exceptions\PermanentAnalysisError;
use App\Recruitment\Exceptions\TransientAnalysisError;

/**
 * The only door to the language model: one structured call in, the JSON
 * answer and its usage out. Callers validate the JSON themselves.
 */
interface ModelGateway
{
    /**
     * @throws TransientAnalysisError
     * @throws PermanentAnalysisError
     */
    public function json(ModelCall $call): ModelReply;
}
