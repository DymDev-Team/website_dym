<?php

namespace App\Recruitment\Ai;

final readonly class ModelCall
{
    /**
     * @param  string  $system  stable instructions, served from the prompt cache
     * @param  list<mixed>  $content  SDK content blocks of the user turn
     * @param  array<string, mixed>  $schema  JSON schema the answer must follow
     * @param  list<mixed>  $tools  server tools the model may use (web search)
     */
    public function __construct(
        public string $system,
        public array $content,
        public array $schema,
        public string $apiKey,
        public string $model,
        public string $effort,
        public int $maxTokens = 16000,
        public array $tools = [],
    ) {}
}
