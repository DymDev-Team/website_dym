<?php

namespace App\Recruitment\Ai;

use Anthropic\Beta\Messages\BetaBase64ImageSource;
use Anthropic\Beta\Messages\BetaBase64ImageSource\MediaType;
use Anthropic\Beta\Messages\BetaBase64PDFSource;
use Anthropic\Beta\Messages\BetaImageBlockParam;
use Anthropic\Beta\Messages\BetaPlainTextSource;
use Anthropic\Beta\Messages\BetaRequestDocumentBlock;
use Anthropic\Beta\Messages\BetaTextBlockParam;
use Anthropic\Beta\Messages\BetaWebSearchTool20260209;
use App\Recruitment\CvDocument;
use App\Recruitment\Exceptions\PermanentAnalysisError;
use App\Recruitment\Exceptions\TransientAnalysisError;
use Illuminate\Support\Facades\Validator;

/**
 * CandidateAnalyzer backed by the language model, in up to two calls: web
 * research on the schools and companies of the CV (optional, never fatal),
 * then the structured analysis, informed by those findings.
 */
class ClaudeCandidateAnalyzer implements CandidateAnalyzer
{
    public function __construct(private ModelGateway $gateway) {}

    public function analyze(AnalysisRequest $request): ModelReply
    {
        $research = $request->webResearch ? $this->research($request) : null;
        $findings = $research === null ? [] : $research->data['research'];

        $analysis = $this->gateway->json(new ModelCall(
            system: AnalysisPrompt::system($request->openOffers, $request->jobFamilies, $request->customInstructions),
            content: [
                $this->cvBlock($request->cv),
                BetaTextBlockParam::with(text: AnalysisPrompt::application($request->targetOffer, $request->message, $request->answers).AnalysisPrompt::researchFindings($findings)),
            ],
            schema: AnalysisSchema::jsonSchema(),
            apiKey: $request->apiKey,
            model: $request->model,
            effort: $request->effort,
            maxTokens: (int) config('recruitment.max_output_tokens'),
        ));

        return new ModelReply(
            data: [...$analysis->data, 'research' => $findings],
            model: $analysis->model,
            inputTokens: $analysis->inputTokens + ($research->inputTokens ?? 0),
            outputTokens: $analysis->outputTokens + ($research->outputTokens ?? 0),
            cacheReadTokens: $analysis->cacheReadTokens + ($research->cacheReadTokens ?? 0),
            cacheWriteTokens: $analysis->cacheWriteTokens + ($research->cacheWriteTokens ?? 0),
            webSearches: $analysis->webSearches + ($research->webSearches ?? 0),
        );
    }

    /**
     * Web research on the organisations of the CV. A failure only means an
     * analysis without findings, never a failed analysis.
     */
    private function research(AnalysisRequest $request): ?ModelReply
    {
        try {
            $reply = $this->gateway->json(new ModelCall(
                system: AnalysisPrompt::research(),
                content: [$this->cvBlock($request->cv), BetaTextBlockParam::with(text: 'Renseigne-toi sur les établissements et entreprises cités dans ce CV.')],
                schema: AnalysisSchema::researchSchema(),
                apiKey: $request->apiKey,
                model: $request->model,
                effort: 'low',
                maxTokens: 8000,
                tools: [BetaWebSearchTool20260209::with(maxUses: (int) config('recruitment.web_searches_per_cv'))],
            ));
        } catch (PermanentAnalysisError|TransientAnalysisError $e) {
            report($e);

            return null;
        }

        $valid = Validator::make($reply->data, [
            'research' => ['present', 'array', 'max:8'],
            'research.*.subject' => ['required', 'string', 'max:200'],
            'research.*.kind' => ['required', 'in:school,company,other'],
            'research.*.finding' => ['required', 'string', 'max:800'],
            'research.*.source_url' => ['nullable', 'string', 'max:500', 'starts_with:http://,https://'],
        ]);

        // Des constats non conformes sont écartés ; leur coût reste compté.
        return new ModelReply(
            data: ['research' => $valid->fails() ? [] : array_values($reply->data['research'])],
            model: $reply->model,
            inputTokens: $reply->inputTokens,
            outputTokens: $reply->outputTokens,
            cacheReadTokens: $reply->cacheReadTokens,
            cacheWriteTokens: $reply->cacheWriteTokens,
            webSearches: $reply->webSearches,
        );
    }

    /**
     * Content block carrying the CV.
     */
    private function cvBlock(CvDocument $cv): BetaRequestDocumentBlock|BetaImageBlockParam
    {
        return match ($cv->kind) {
            CvDocument::PDF => BetaRequestDocumentBlock::with(source: BetaBase64PDFSource::with(data: $cv->data), title: 'CV'),
            CvDocument::IMAGE => BetaImageBlockParam::with(source: BetaBase64ImageSource::with(data: $cv->data, mediaType: MediaType::from($cv->mediaType))),
            default => BetaRequestDocumentBlock::with(source: BetaPlainTextSource::with(data: $cv->data), title: 'CV'),
        };
    }
}
