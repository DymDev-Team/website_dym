<?php

namespace App\Recruitment;

use Anthropic\Beta\Messages\BetaTextBlockParam;
use App\Models\AiCall;
use App\Models\JobApplication;
use App\Models\JobOffer;
use App\Recruitment\Ai\AnalysisSchema;
use App\Recruitment\Ai\ModelGateway;
use App\Recruitment\Exceptions\PermanentAnalysisError;
use App\Recruitment\Exceptions\TransientAnalysisError;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Writes the multiple-choice questions of the psychotechnical tests: a base
 * common to an offer, plus questions drawn from a candidate's analysis.
 * Suggestions only: the team reviews them before sending the test.
 */
class PsychotestDesigner
{
    public const OFFER_QUESTIONS = 15;

    public const CANDIDATE_QUESTIONS = 5;

    private const RULES = <<<'TXT'
        Tu prépares les tests psychotechniques de DYM Manufacture, entreprise de conception, d'usinage et de fabrication métallique sur mesure basée à Abidjan (Côte d'Ivoire).

        Chaque question est un QCM :
        - « text » : l'énoncé, en français clair, compréhensible sans document ni calculatrice, auquel on répond en une minute et demie au plus ;
        - « options » : exactement 4 réponses courtes et plausibles ;
        - « answer » : l'indice (de 0 à 3) de la seule bonne réponse ;
        - « category » : Logique, Calcul, Compréhension, Mise en situation, ou Rigueur et sécurité.

        Règles impératives :
        1. Aucune question sur la vie privée, l'âge, le sexe, la situation familiale, l'origine, la religion, la santé ou les opinions.
        2. Ni piège ni ambiguïté : une personne compétente trouve la bonne réponse sans hésiter entre deux options.
        3. Une mise en situation décrit un cas concret du poste ; sa bonne réponse est la conduite professionnelle attendue (sécurité, qualité, respect des consignes, communication).
        4. Ne cite jamais le nom du candidat ni aucune information qui permettrait de l'identifier.
        TXT;

    public function __construct(private ModelGateway $gateway, private AiGuard $guard) {}

    /**
     * Base of the test for an offer, or for a trade when the application
     * targets no offer.
     *
     * @return list<array{id: string, text: string, options: list<string>, answer: int, category: string, source: string}>
     *
     * @throws PermanentAnalysisError|TransientAnalysisError
     */
    public function forOffer(?JobOffer $offer, ?string $trade): array
    {
        $context = $offer === null
            ? '<poste>'.($trade ?: 'Poste d’atelier ou de bureau chez un fabricant métallique').'</poste>'
            : "<offre>\n".collect([
                'Intitulé' => $offer->title,
                'Résumé' => $offer->summary,
                'Missions' => $offer->description,
                'Profil recherché' => $offer->requirements,
            ])->filter(fn (?string $value) => filled($value))->map(fn (string $value, string $label) => "{$label} : ".trim($value))->implode("\n")."\n</offre>";

        return $this->ask(
            $context."\n\nPrépare ".self::OFFER_QUESTIONS.' questions communes à tous les candidats de ce poste : environ 4 de logique, 3 de calcul, 2 de compréhension et 6 mises en situation ou questions de rigueur et de sécurité propres au métier.',
            'offer',
            $offer?->id,
        );
    }

    /**
     * Questions checking what the analysis of this candidate flagged.
     *
     * @return list<array{id: string, text: string, options: list<string>, answer: int, category: string, source: string}>
     *
     * @throws PermanentAnalysisError|TransientAnalysisError
     */
    public function forCandidate(JobApplication $application): array
    {
        $result = $application->latestCompletedAnalysis?->result;

        if ($result === null) {
            return [];
        }

        $points = fn (string $label, mixed $items) => is_array($items) && $items !== []
            ? $label." :\n- ".implode("\n- ", array_map('strval', $items))
            : null;

        $context = collect([
            'Poste visé : '.($application->jobOffer->title ?? 'candidature spontanée'),
            filled($result['profile']['headline'] ?? null) ? 'Profil : '.$result['profile']['headline'] : null,
            filled($result['summary'] ?? null) ? 'Synthèse : '.$result['summary'] : null,
            $points('Points forts', $result['evaluation']['strengths'] ?? $result['assessment']['strengths'] ?? null),
            $points('Points d’attention', $result['evaluation']['concerns'] ?? $result['assessment']['concerns'] ?? null),
            $points('Questions à creuser', $result['evaluation']['interview_questions'] ?? null),
        ])->filter()->implode("\n\n");

        return $this->ask(
            "<analyse>\n{$context}\n</analyse>\n\nPrépare ".self::CANDIDATE_QUESTIONS.' questions qui vérifient les compétences annoncées par ce candidat et ses points d’attention : surtout des mises en situation tirées de son parcours et du poste visé.',
            'candidate',
            $application->job_offer_id,
        );
    }

    /**
     * @return list<array{id: string, text: string, options: list<string>, answer: int, category: string, source: string}>
     *
     * @throws PermanentAnalysisError|TransientAnalysisError
     */
    private function ask(string $prompt, string $source, ?int $offerId): array
    {
        $string = ['type' => 'string'];

        $reply = $this->gateway->json($this->guard->call(
            system: self::RULES,
            content: [BetaTextBlockParam::with(text: $prompt)],
            schema: AnalysisSchema::object(['questions' => ['type' => 'array', 'items' => AnalysisSchema::object([
                'text' => $string,
                'options' => ['type' => 'array', 'items' => $string],
                'answer' => ['type' => 'integer'],
                'category' => $string,
            ])]]),
            effort: 'low',
        ));

        AiCall::record(AiCall::PSYCHOTEST, $reply, $offerId);

        try {
            $valid = Validator::make($reply->data, [
                'questions' => ['required', 'array', 'min:1', 'max:30'],
                'questions.*.text' => ['required', 'string', 'max:600'],
                'questions.*.options' => ['required', 'array', 'size:4'],
                'questions.*.options.*' => ['required', 'string', 'max:200', 'distinct'],
                'questions.*.answer' => ['required', 'integer', 'between:0,3'],
                'questions.*.category' => ['required', 'string', 'max:60'],
            ])->validate();
        } catch (ValidationException $e) {
            throw new TransientAnalysisError('Réponse de l’IA non conforme : '.collect($e->errors())->flatten()->first());
        }

        return array_values(array_map(fn (array $question) => self::shuffled([
            'id' => self::newId(),
            'text' => trim($question['text']),
            'options' => array_values(array_map(trim(...), $question['options'])),
            'answer' => (int) $question['answer'],
            'category' => trim($question['category']),
            'source' => $source,
        ]), $valid['questions']));
    }

    public static function newId(): string
    {
        return 'q'.Str::lower(Str::random(8));
    }

    /**
     * The model tends to put the right answer first: the options are mixed.
     *
     * @param  array{id: string, text: string, options: list<string>, answer: int, category: string, source: string}  $question
     * @return array{id: string, text: string, options: list<string>, answer: int, category: string, source: string}
     */
    private static function shuffled(array $question): array
    {
        $right = $question['options'][$question['answer']];
        $options = $question['options'];
        shuffle($options);

        return [...$question, 'options' => $options, 'answer' => (int) array_search($right, $options, true)];
    }
}
