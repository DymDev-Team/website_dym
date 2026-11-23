<?php

namespace App\Recruitment;

use Anthropic\Beta\Messages\BetaTextBlockParam;
use App\Enums\Verdict;
use App\Models\AiCall;
use App\Models\JobApplication;
use App\Models\RecruitmentSetting;
use App\Recruitment\Ai\AnalysisSchema;
use App\Recruitment\Ai\ModelGateway;
use App\Recruitment\Exceptions\PermanentAnalysisError;
use App\Recruitment\Exceptions\TransientAnalysisError;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Hiring advice of the AI once the three scores are known: a decision aid
 * written from the CV analysis, the psychotechnical test and the managing
 * director's appraisal. The decision stays human.
 */
class HiringAdvisor
{
    private const RULES = <<<'TXT'
        Tu aides la direction de DYM Manufacture, entreprise de conception, d'usinage et de fabrication métallique sur mesure basée à Abidjan (Côte d'Ivoire), à décider d'un recrutement. Tu donnes un avis argumenté, jamais la décision : elle reste humaine.

        Règles impératives :
        1. Fonde-toi uniquement sur les éléments fournis : analyse du CV, test psychotechnique, appréciation du DG et note globale.
        2. Aucun critère discriminatoire, même indirect : âge, sexe, situation familiale, nationalité, origine, religion, apparence, santé, handicap, opinions.
        3. « verdict » : hire pour recruter, discuss quand l'avis est partagé (notes contradictoires, risque à lever avant de décider), reject pour ne pas recruter.
        4. « comment » : 3 à 5 phrases en français, sans titre ni puce : la recommandation, ce qui la justifie, puis le principal risque ou ce qu'il reste à vérifier. Cite les notes quand elles éclairent l'avis et signale un écart important entre elles (par exemple un bon test mais un CV éloigné du poste).
        TXT;

    public function __construct(private ModelGateway $gateway, private AiGuard $guard) {}

    /**
     * @param  array{ai: int, test: int, dg: int}  $weights
     * @return array{verdict: Verdict, comment: string}
     *
     * @throws PermanentAnalysisError|TransientAnalysisError
     */
    public function advise(JobApplication $application, array $weights): array
    {
        $reply = $this->gateway->json($this->guard->call(
            system: self::RULES.RecruitmentSetting::knowledge(),
            content: [BetaTextBlockParam::with(text: "<dossier>\n".$this->file($application, $weights)."\n</dossier>\n\nDonne ton avis sur ce recrutement.")],
            schema: AnalysisSchema::object([
                'verdict' => ['type' => 'string', 'enum' => array_column(Verdict::cases(), 'value')],
                'comment' => ['type' => 'string'],
            ]),
            effort: 'low',
        ));

        AiCall::record(AiCall::VERDICT, $reply, $application->job_offer_id);

        try {
            $valid = Validator::make($reply->data, [
                'verdict' => ['required', Rule::enum(Verdict::class)],
                'comment' => ['required', 'string', 'max:2000'],
            ])->validate();
        } catch (ValidationException $e) {
            throw new TransientAnalysisError('Réponse de l’IA non conforme : '.collect($e->errors())->flatten()->first());
        }

        return ['verdict' => Verdict::from($valid['verdict']), 'comment' => trim($valid['comment'])];
    }

    /**
     * What the team knows of the candidate, without identity.
     *
     * @param  array{ai: int, test: int, dg: int}  $weights
     */
    private function file(JobApplication $application, array $weights): string
    {
        $result = $application->latestCompletedAnalysis?->result;
        $test = $application->psychotest;
        $list = fn (mixed $items) => is_array($items) && $items !== [] ? implode(' ; ', array_map('strval', $items)) : null;
        $score = fn (?int $value) => $value === null ? 'non disponible' : "{$value} / 100";

        $testLine = 'Test psychotechnique : '.$score($application->test_score);
        if ($test?->completed_at !== null) {
            $testLine .= $test->stopped_reason === 'exits'
                ? ' (test arrêté : le candidat a quitté la page '.$test->exits.' fois)'
                : ($test->exits > 0 ? ' (une sortie de page, avertissement donné)' : '');
        }

        $criteria = collect($application->dg_review ?? [])
            ->map(fn (array $row) => "{$row['criterion']} {$row['score']}/5")
            ->implode(', ');

        return collect([
            'Poste : '.($application->jobOffer->title ?? 'candidature spontanée'),
            'Note IA (adéquation du CV au poste) : '.$score($application->score)
                .($application->recommendation ? ', avis « '.$application->recommendation->label().' »' : ''),
            filled($result['profile']['headline'] ?? null) ? 'Profil : '.$result['profile']['headline'] : null,
            filled($result['summary'] ?? null) ? 'Synthèse de l’analyse : '.$result['summary'] : null,
            ($strengths = $list($result['evaluation']['strengths'] ?? $result['assessment']['strengths'] ?? null)) ? "Points forts : {$strengths}" : null,
            ($concerns = $list($result['evaluation']['concerns'] ?? $result['assessment']['concerns'] ?? null)) ? "Points d’attention : {$concerns}" : null,
            $testLine,
            'Appréciation DG : '.$score($application->dg_score).($criteria !== '' ? " ({$criteria})" : ''),
            filled($application->dg_comment) ? 'Commentaire du DG : '.$application->dg_comment : null,
            'Note globale : '.$score($application->globalScore($weights))
                ." (pondération : IA {$weights['ai']}, test {$weights['test']}, DG {$weights['dg']})",
        ])->filter()->implode("\n");
    }
}
