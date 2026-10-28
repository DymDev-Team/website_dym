<?php

namespace App\Recruitment\Ai;

use Anthropic\Beta\Messages\BetaCacheControlEphemeral;
use Anthropic\Beta\Messages\BetaJSONOutputFormat;
use Anthropic\Beta\Messages\BetaMessage;
use Anthropic\Beta\Messages\BetaOutputConfig;
use Anthropic\Beta\Messages\BetaOutputConfig\Effort;
use Anthropic\Beta\Messages\BetaTextBlock;
use Anthropic\Beta\Messages\BetaTextBlockParam;
use Anthropic\Client;
use Anthropic\Core\Exceptions\APIConnectionException;
use Anthropic\Core\Exceptions\APIStatusException;
use Anthropic\Core\Exceptions\AuthenticationException;
use Anthropic\Core\Exceptions\InternalServerException;
use Anthropic\Core\Exceptions\PermissionDeniedException;
use Anthropic\Core\Exceptions\RateLimitException;
use Anthropic\RequestOptions;
use App\Recruitment\Exceptions\PermanentAnalysisError;
use App\Recruitment\Exceptions\TransientAnalysisError;
use Psr\Http\Client\ClientInterface;

/**
 * ModelGateway backed by the Claude API (official PHP SDK): structured
 * output, prompt caching, server-side fallback and error classification.
 */
class ClaudeGateway implements ModelGateway
{
    // Relance automatique sur un autre modèle si celui choisi décline la requête.
    private const FALLBACK_BETA = 'server-side-fallback-2026-07-01';

    public function json(ModelCall $call): ModelReply
    {
        try {
            $message = $this->client($call->apiKey)->beta->messages->create(
                maxTokens: $call->maxTokens,
                model: $call->model,
                system: [
                    BetaTextBlockParam::with(text: $call->system, cacheControl: BetaCacheControlEphemeral::with()),
                ],
                messages: [['role' => 'user', 'content' => $call->content]],
                outputConfig: BetaOutputConfig::with(
                    effort: Effort::from($call->effort),
                    format: BetaJSONOutputFormat::with(schema: $call->schema),
                ),
                tools: $call->tools === [] ? null : $call->tools,
                fallbacks: 'default',
                betas: [self::FALLBACK_BETA],
            );
        } catch (RateLimitException|InternalServerException|APIConnectionException $e) {
            report($e);

            throw new TransientAnalysisError('Service d’IA momentanément indisponible : un nouvel essai sera fait automatiquement.', previous: $e);
        } catch (AuthenticationException|PermissionDeniedException $e) {
            throw new PermanentAnalysisError('Clé API refusée : vérifiez-la dans les réglages du recrutement.', previous: $e);
        } catch (APIStatusException $e) {
            // Le détail technique va dans les journaux, jamais à l'écran.
            report($e);

            throw new PermanentAnalysisError('Le service d’IA n’a pas pu traiter ce CV. Relancez l’analyse ; si le problème persiste, contactez le support technique.', previous: $e);
        }

        return new ModelReply(
            data: $this->decode($message),
            model: $message->model,
            inputTokens: $message->usage->inputTokens,
            outputTokens: $message->usage->outputTokens,
            cacheReadTokens: $message->usage->cacheReadInputTokens ?? 0,
            cacheWriteTokens: $message->usage->cacheCreationInputTokens ?? 0,
            webSearches: $message->usage->serverToolUse->webSearchRequests ?? 0,
        );
    }

    /**
     * SDK client; the SDK itself retries rate limits and server errors twice
     * before the callers' own attempts.
     */
    protected function client(string $apiKey, ?ClientInterface $transporter = null): Client
    {
        return new Client(
            apiKey: $apiKey,
            requestOptions: RequestOptions::with(
                timeout: (float) config('recruitment.timeout'),
                maxRetries: 2,
                transporter: $transporter,
            ),
        );
    }

    /**
     * JSON of the answer, after checking why the model stopped.
     *
     * @return array<string, mixed>
     */
    private function decode(BetaMessage $message): array
    {
        if ($message->stopReason === 'refusal') {
            throw new PermanentAnalysisError('Le modèle a refusé de traiter ce document.');
        }

        if ($message->stopReason === 'pause_turn') {
            throw new TransientAnalysisError('Recherches web interrompues avant la fin : nouvel essai.');
        }

        if ($message->stopReason === 'max_tokens') {
            throw new PermanentAnalysisError('Réponse tronquée : le document est trop long pour être traité en entier.');
        }

        // Avec la recherche web, des blocs de texte précèdent parfois le JSON final.
        foreach (array_reverse($message->content) as $block) {
            if ($block instanceof BetaTextBlock) {
                $data = json_decode($block->text, true);

                if (is_array($data)) {
                    return $data;
                }
            }
        }

        throw new TransientAnalysisError('Réponse du modèle illisible.');
    }
}
