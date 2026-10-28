<?php

namespace App\Recruitment;

use Anthropic\Beta\Messages\BetaTextBlockParam;
use App\Enums\QuestionType;
use App\Models\AiCall;
use App\Recruitment\Ai\AnalysisSchema;
use App\Recruitment\Ai\ModelGateway;
use App\Recruitment\Exceptions\PermanentAnalysisError;
use App\Recruitment\Exceptions\TransientAnalysisError;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Helps the HR team write offers: an evaluation grid from an offer, or a
 * whole draft from a short brief. Suggestions only: nothing is saved until
 * the team submits the form.
 */
class OfferAssistant
{
    private const RULES = <<<'TXT'
        Tu aides l'équipe RH de DYM Manufacture, entreprise de conception, d'usinage et de fabrication métallique sur mesure basée à Abidjan (Côte d'Ivoire), à préparer ses offres d'emploi.

        Règles impératives :
        1. Aucune exigence discriminatoire, même indirecte : âge, sexe, situation familiale, nationalité, origine, religion, apparence, état de santé, handicap, opinions.
        2. Uniquement des exigences liées au poste : compétences, expérience, diplômes, habilitations, langues, mobilité.
        3. N'invente ni salaire, ni avantage, ni information sur l'entreprise qui ne figure pas dans la demande.
        4. Rédige en français clair et professionnel.

        Grille d'évaluation (« criteria ») : 4 à 8 critères vérifiables à la lecture d'un CV, tirés des missions et du profil recherché. Noms courts (moins de 60 caractères). « weight » va de 1 (secondaire) à 5 (déterminant). « essential » est vrai uniquement pour ce qui est indispensable pour exercer : habilitation ou diplôme obligatoire, expérience minimale clé. Au plus 3 critères indispensables.
        TXT;

    private const DRAFT_RULES = <<<'TXT'
        À partir du brief, rédige l'offre complète :
        - « title » : intitulé du poste ;
        - « department » : service parmi Atelier, Bureau d'études, Chantier, Administration, Commercial, ou null si aucun ne convient ;
        - « contract_type » : contrat indiqué dans le brief, sinon « CDI » ;
        - « location » : lieu indiqué dans le brief, sinon « Abidjan » ;
        - « summary » : une ou deux phrases d'accroche ;
        - « description » : les missions, en paragraphes courts séparés par une ligne vide ;
        - « requirements » : le profil recherché, une exigence par ligne, sans puce ni tiret ;
        - « criteria » : la grille d'évaluation de ce poste ;
        - « questions » : 2 à 4 questions utiles à poser aux candidats dans le formulaire (disponibilité, habilitations, mobilité…), jamais sur la vie privée. « type » parmi text, textarea, choice, yes_no, number ; « options » : les réponses possibles pour choice (2 à 6), sinon liste vide.
        Si le brief ne contient qu'un intitulé, déduis le reste d'un poste type de ce nom chez un fabricant métallique, sans inventer de salaire ni d'avantage.
        TXT;

    public function __construct(private ModelGateway $gateway, private AiGuard $guard) {}

    /**
     * Evaluation grid suggested for an offer being edited.
     *
     * @param  array{title?: string|null, description?: string|null, requirements?: string|null, summary?: string|null}  $offer
     * @return list<array{name: string, weight: int, essential: bool}>
     *
     * @throws PermanentAnalysisError|TransientAnalysisError
     */
    public function suggestCriteria(array $offer): array
    {
        $text = collect(['Intitulé' => $offer['title'] ?? null, 'Résumé' => $offer['summary'] ?? null, 'Missions' => $offer['description'] ?? null, 'Profil recherché' => $offer['requirements'] ?? null])
            ->filter(fn (?string $value) => filled($value))
            ->map(fn (string $value, string $label) => "{$label} : ".trim($value))
            ->implode("\n");

        $reply = $this->gateway->json($this->guard->call(
            system: self::RULES,
            content: [BetaTextBlockParam::with(text: "<offre>\n{$text}\n</offre>\n\nPropose la grille d'évaluation de cette offre.")],
            schema: AnalysisSchema::object(['criteria' => self::criteriaSchema()]),
            effort: 'low',
        ));

        AiCall::record(AiCall::OFFER_CRITERIA, $reply);

        return $this->validated($reply->data, ['criteria' => self::criteriaRules()])['criteria'];
    }

    /**
     * Complete offer written from a short brief.
     *
     * @return array{title: string, department: string|null, contract_type: string, location: string, summary: string, description: string, requirements: string, criteria: list<array{name: string, weight: int, essential: bool}>, questions: list<array{id: string, label: string, type: string, options: list<string>, required: bool}>}
     *
     * @throws PermanentAnalysisError|TransientAnalysisError
     */
    public function draft(string $brief): array
    {
        $string = ['type' => 'string'];

        $reply = $this->gateway->json($this->guard->call(
            system: self::RULES."\n\n".self::DRAFT_RULES,
            content: [BetaTextBlockParam::with(text: "<brief>\n".trim($brief)."\n</brief>\n\nRédige l'offre.")],
            schema: AnalysisSchema::object([
                'title' => $string,
                'department' => ['anyOf' => [$string, ['type' => 'null']]],
                'contract_type' => $string,
                'location' => $string,
                'summary' => $string,
                'description' => $string,
                'requirements' => $string,
                'criteria' => self::criteriaSchema(),
                'questions' => ['type' => 'array', 'items' => AnalysisSchema::object([
                    'label' => $string,
                    'type' => ['type' => 'string', 'enum' => array_column(QuestionType::cases(), 'value')],
                    'options' => ['type' => 'array', 'items' => $string],
                    'required' => ['type' => 'boolean'],
                ])],
            ]),
            effort: 'medium',
        ));

        AiCall::record(AiCall::OFFER_DRAFT, $reply);

        /** @var array{title: string, department: string|null, contract_type: string, location: string, summary: string, description: string, requirements: string, criteria: list<array{name: string, weight: int, essential: bool}>, questions: list<array{id: string, label: string, type: string, options: list<string>, required: bool}>} */
        return $this->validated($reply->data, [
            'title' => ['required', 'string', 'max:160'],
            'department' => ['nullable', 'string', 'max:80'],
            'contract_type' => ['required', 'string', 'max:60'],
            'location' => ['required', 'string', 'max:120'],
            'summary' => ['required', 'string', 'max:500'],
            'description' => ['required', 'string', 'max:20000'],
            'requirements' => ['required', 'string', 'max:5000'],
            'criteria' => self::criteriaRules(),
            'questions' => ['present', 'array', 'max:6'],
            'questions.*.label' => ['required', 'string', 'max:300'],
            'questions.*.type' => ['required', Rule::enum(QuestionType::class)],
            'questions.*.options' => ['present', 'array', 'max:10'],
            'questions.*.options.*' => ['string', 'max:120'],
            'questions.*.required' => ['required', 'boolean'],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private static function criteriaSchema(): array
    {
        return ['type' => 'array', 'items' => AnalysisSchema::object([
            'name' => ['type' => 'string'],
            'weight' => ['type' => 'integer'],
            'essential' => ['type' => 'boolean'],
        ])];
    }

    /**
     * Same bounds as the offer form (SaveJobOfferRequest).
     *
     * @return list<mixed>
     */
    private static function criteriaRules(): array
    {
        return ['required', 'array', 'min:1', 'max:10', function (string $attribute, mixed $value, \Closure $fail) {
            $valid = Validator::make(['c' => $value], [
                'c.*.name' => ['required', 'string', 'max:120', 'distinct:ignore_case'],
                'c.*.weight' => ['required', 'integer', 'between:1,5'],
                'c.*.essential' => ['required', 'boolean'],
            ])->passes();

            if (! $valid) {
                $fail('Grille d’évaluation non conforme.');
            }
        }];
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $rules
     * @return array<string, mixed>
     */
    private function validated(array $data, array $rules): array
    {
        try {
            $valid = Validator::make($data, $rules)->validate();
        } catch (ValidationException $e) {
            throw new TransientAnalysisError('Réponse de l’IA non conforme : '.collect($e->errors())->flatten()->first());
        }

        if (isset($valid['questions'])) {
            $valid['questions'] = array_values(array_map(fn (array $question) => [
                'id' => 'q'.Str::lower(Str::random(8)),
                'label' => trim($question['label']),
                'type' => $question['type'],
                'options' => $question['type'] === QuestionType::Choice->value ? array_values(array_unique(array_map(trim(...), $question['options']))) : [],
                'required' => (bool) $question['required'],
            ], $valid['questions']));
        }

        if (isset($valid['criteria'])) {
            $valid['criteria'] = array_values(array_map(fn (array $criterion) => [
                'name' => trim($criterion['name']),
                'weight' => (int) $criterion['weight'],
                'essential' => (bool) $criterion['essential'],
            ], $valid['criteria']));
        }

        return $valid;
    }
}
