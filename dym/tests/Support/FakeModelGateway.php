<?php

namespace Tests\Support;

use App\Recruitment\Ai\ModelCall;
use App\Recruitment\Ai\ModelGateway;
use App\Recruitment\Ai\ModelReply;
use Closure;
use Throwable;

/**
 * Stands in for the language model: answers each call with the next
 * scripted reply (JSON, closure of the call, or exception).
 */
class FakeModelGateway implements ModelGateway
{
    /** @var list<ModelCall> */
    public array $calls = [];

    /**
     * @param  list<array<string, mixed>|Closure(ModelCall): array<string, mixed>|Throwable>  $replies
     */
    public function __construct(public array $replies = []) {}

    public function json(ModelCall $call): ModelReply
    {
        $this->calls[] = $call;
        $reply = array_shift($this->replies) ?? [];

        if ($reply instanceof Throwable) {
            throw $reply;
        }

        return new ModelReply(
            data: $reply instanceof Closure ? $reply($call) : $reply,
            model: $call->model,
            inputTokens: 2000,
            outputTokens: 500,
        );
    }

    /**
     * Text of the user turn of a call, for assertions on what was sent.
     */
    public function text(int $call = 0): string
    {
        return collect($this->calls[$call]->content)
            ->map(fn ($block) => is_object($block) && isset($block['text']) ? $block['text'] : '')
            ->implode("\n");
    }
}
