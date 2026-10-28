<?php

namespace App\Recruitment\Ai;

final readonly class ModelReply
{
    /**
     * @param  array<string, mixed>  $data  JSON returned by the model, not yet validated
     */
    public function __construct(
        public array $data,
        public string $model,
        public int $inputTokens = 0,
        public int $outputTokens = 0,
        public int $cacheReadTokens = 0,
        public int $cacheWriteTokens = 0,
        public int $webSearches = 0,
    ) {}

    /**
     * Price of the call in dollars, from the rates in config/recruitment.php.
     */
    public function cost(): float
    {
        $rates = config("recruitment.models.{$this->model}")
            ?? config('recruitment.models.'.array_key_first(config('recruitment.models')));

        return ($this->inputTokens * $rates['input']
            + $this->outputTokens * $rates['output']
            + $this->cacheReadTokens * $rates['cache_read']
            + $this->cacheWriteTokens * $rates['cache_write']) / 1_000_000
            + $this->webSearches * (float) config('recruitment.web_search_price');
    }
}
