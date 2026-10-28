<?php

namespace App\Recruitment\Exceptions;

use RuntimeException;

/**
 * The analysis cannot succeed by trying again (unreadable CV, invalid key,
 * refused request...). The message is shown in the admin.
 */
class PermanentAnalysisError extends RuntimeException {}
