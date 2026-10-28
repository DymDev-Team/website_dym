<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Recruitment\Exceptions\PermanentAnalysisError;
use App\Recruitment\Exceptions\TransientAnalysisError;
use App\Recruitment\OfferAssistant;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * AI suggestions for the offer form; nothing is saved here.
 */
class OfferAssistantController extends Controller
{
    public function __construct(private OfferAssistant $assistant) {}

    /**
     * Evaluation grid suggested from the offer being edited.
     */
    public function criteria(Request $request): JsonResponse
    {
        $offer = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'summary' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:20000'],
            'requirements' => ['nullable', 'string', 'max:5000'],
        ], [
            'title.required' => 'Indiquez d’abord l’intitulé du poste.',
        ]);

        return $this->respond(fn () => ['criteria' => $this->assistant->suggestCriteria($offer)]);
    }

    /**
     * Complete offer written from a short brief.
     */
    public function draft(Request $request): JsonResponse
    {
        $brief = $request->validate([
            'brief' => ['required', 'string', 'min:3', 'max:25000'],
        ], [
            'brief.required' => 'Indiquez au moins l’intitulé du poste.',
            'brief.min' => 'Indiquez au moins l’intitulé du poste.',
        ])['brief'];

        return $this->respond(fn () => ['draft' => $this->assistant->draft($brief)]);
    }

    /**
     * @param  Closure(): array<string, mixed>  $suggest
     */
    private function respond(Closure $suggest): JsonResponse
    {
        if (function_exists('set_time_limit')) {
            @set_time_limit((int) config('recruitment.timeout') + 60);
        }

        try {
            return response()->json($suggest());
        } catch (PermanentAnalysisError|TransientAnalysisError $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
