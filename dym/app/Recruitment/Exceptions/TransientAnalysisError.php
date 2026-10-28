<?php

namespace App\Recruitment\Exceptions;

use RuntimeException;

/**
 * Temporary failure (rate limit, overloaded API, network): the analysis is
 * put back in the queue until its attempts run out.
 */
class TransientAnalysisError extends RuntimeException {}
