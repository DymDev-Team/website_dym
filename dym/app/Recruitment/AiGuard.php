<?php

namespace App\Recruitment;

use App\Models\AiCall;
use App\Models\RecruitmentSetting;
use App\Recruitment\Ai\ModelCall;
use App\Recruitment\Exceptions\PermanentAnalysisError;

/**
 * Says whether the AI may run (enabled, key present, monthly budget left)
 * and builds the calls from the admin settings.
 */
class AiGuard
{
    /**
     * Why no AI call can be made right now, if anything prevents it.
     */
    public function blockedReason(): ?string
    {
        $settings = RecruitmentSetting::values();

        return match (true) {
            ! $settings['ai_enabled'] => 'L’analyse par IA est désactivée.',
            $settings['api_key'] === null => 'Aucune clé API n’est configurée.',
            AiCall::spentThisMonth() >= $settings['monthly_budget'] => 'Le plafond de dépense mensuel est atteint.',
            default => null,
        };
    }

    /**
     * Call with the model, key and effort chosen in the admin.
     *
     * @param  list<mixed>  $content
     * @param  array<string, mixed>  $schema
     *
     * @throws PermanentAnalysisError when the AI cannot run
     */
    public function call(string $system, array $content, array $schema, ?string $effort = null, int $maxTokens = 8000): ModelCall
    {
        if ($reason = $this->blockedReason()) {
            throw new PermanentAnalysisError($reason);
        }

        $settings = RecruitmentSetting::values();

        return new ModelCall(
            system: $system,
            content: $content,
            schema: $schema,
            apiKey: (string) $settings['api_key'],
            model: $settings['model'],
            effort: $effort ?? $settings['effort'],
            maxTokens: $maxTokens,
        );
    }
}
