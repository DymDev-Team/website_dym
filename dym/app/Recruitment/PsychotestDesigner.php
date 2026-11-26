<?php

namespace App\Recruitment;

use Anthropic\Beta\Messages\BetaTextBlockParam;
use App\Models\AiCall;
use App\Models\JobApplication;
use App\Models\JobOffer;
use App\Models\RecruitmentSetting;
use App\Recruitment\Ai\AnalysisSchema;
use App\Recruitment\Ai\ModelGateway;
use App\Recruitment\Exceptions\PermanentAnalysisError;
use App\Recruitment\Exceptions\TransientAnalysisError;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Writes the multiple-choice questions of the psychotechnical tests: a base
 * common to an offer (aptitudes and behaviour at work, in the shares set in
 * the admin), plus behaviour questions drawn from a candidate's analysis.
 * Suggestions only: the team reviews them before sending the test.
 */
class PsychotestDesigner
{
    // Réserve du poste : chaque candidat en reçoit une partie, tirée au hasard.
    public const OFFER_QUESTIONS = 25;

    public const OFFER_DRAWN = 12;

    public const CANDIDATE_QUESTIONS = 5;

    private const RULES = <<<'TXT'
        Tu prépares les tests psychotechniques de DYM Manufacture, entreprise de conception, d'usinage et de fabrication métallique sur mesure basée à Abidjan (Côte d'Ivoire).

        Le test est d'abord psychotechnique : il mesure les aptitudes et le comportement au travail, pas les connaissances techniques, vérifiées en entretien.

        Chaque question est un QCM :
        - « text » : l'énoncé, en français clair, compréhensible sans document ni calculatrice, auquel on répond en une minute et demie au plus ;
        - « options » : exactement 4 réponses courtes et plausibles ;
        - « answer » : l'indice (de 0 à 3) de la seule bonne réponse ;
        - « category » : l'une des catégories ci-dessous, écrite telle quelle.

        Catégories :
        - Aptitudes : « Logique » (suites de nombres ou de lettres, analogies, intrus, déductions), « Attention » (repérer une différence, une erreur ou un élément manquant dans une courte liste écrite dans l'énoncé), « Raisonnement chiffré » (petits problèmes résolus de tête), « Compréhension » (sens d'une consigne ou d'un court texte).
        - « Comportement » : une mise en situation de la vie au travail (atelier, chantier ou bureau) qui révèle la façon d'agir : gestion du stress et de l'urgence, conflit avec un collègue ou un chef, réaction à sa propre erreur, respect des consignes et de la hiérarchie, honnêteté et intégrité, esprit d'équipe et entraide, autonomie et initiative, relation avec un client.
        - « Métier et sécurité » : un cas concret du poste visé où la bonne réponse est le bon réflexe de qualité ou de sécurité.

        Règles impératives :
        1. Aucune question sur la vie privée, l'âge, le sexe, la situation familiale, l'origine, la religion, la santé (physique ou mentale) ou les opinions.
        2. Ni piège ni ambiguïté : une personne compétente trouve la bonne réponse sans hésiter entre deux options.
        3. En « Comportement », les 4 réponses sont des réactions qu'on observe réellement au travail, sans caricature ; la bonne est la conduite professionnelle la plus adaptée (calme, honnêteté, respect des consignes et de la sécurité, communication, entraide). Varie les situations et la position de la bonne conduite.
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
            $context."\n\nPrépare ".self::OFFER_QUESTIONS.' questions communes aux candidats de ce poste : '.self::mixInstructions().'.',
            'offer',
            $offer?->id,
        );
    }

    /**
     * Number of questions of each part of the base, from the shares set in
     * the admin (the rounding goes to the largest part).
     *
     * @return array{aptitude: int, behaviour: int, trade: int}
     */
    public static function mix(): array
    {
        $values = RecruitmentSetting::values();
        $shares = [
            'aptitude' => $values['psychotest_mix_aptitude'],
            'behaviour' => $values['psychotest_mix_behaviour'],
            'trade' => $values['psychotest_mix_trade'],
        ];

        if (array_sum($shares) === 0) {
            $shares = ['aptitude' => 40, 'behaviour' => 60, 'trade' => 0];
        }

        $total = array_sum($shares);
        $counts = array_map(fn (int $share) => (int) round(self::OFFER_QUESTIONS * $share / $total), $shares);
        $largest = array_search(max($shares), $shares, true);
        $counts[$largest] += self::OFFER_QUESTIONS - array_sum($counts);

        return $counts;
    }

    private static function mixInstructions(): string
    {
        $mix = self::mix();

        return collect([
            $mix['aptitude'] > 0 ? "{$mix['aptitude']} d’aptitudes, réparties entre Logique, Attention, Raisonnement chiffré et Compréhension" : null,
            $mix['behaviour'] > 0 ? "{$mix['behaviour']} de Comportement, chacune sur une situation différente" : null,
            $mix['trade'] > 0 ? "{$mix['trade']} de Métier et sécurité propres au poste" : null,
        ])->filter()->implode(', ');
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
            "<analyse>\n{$context}\n</analyse>\n\nPrépare ".self::CANDIDATE_QUESTIONS.' questions de Comportement qui éclairent les points d’attention de ce candidat (stabilité, travail en équipe, autonomie, rigueur, gestion de la pression…) : des mises en situation proches de son parcours et du poste visé, sans jamais mentionner son parcours dans l’énoncé.',
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
            system: self::RULES.RecruitmentSetting::knowledge(),
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

        return array_values(array_map(fn (array $question) => self::withShuffledOptions([
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
     * Options mixed for each candidate (the model also tends to put the
     * right answer first): an answer passed around helps nobody.
     *
     * @param  array{id: string, text: string, options: list<string>, answer: int, category: string, source: string}  $question
     * @return array{id: string, text: string, options: list<string>, answer: int, category: string, source: string}
     */
    public static function withShuffledOptions(array $question): array
    {
        $right = $question['options'][$question['answer']];
        $options = $question['options'];
        shuffle($options);

        return [...$question, 'options' => $options, 'answer' => (int) array_search($right, $options, true)];
    }
}
