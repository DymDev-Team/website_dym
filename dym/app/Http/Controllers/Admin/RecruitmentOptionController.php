<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RecruitmentOptionType;
use App\Http\Controllers\Controller;
use App\Models\RecruitmentOption;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Editable lists of the recruitment module (job families, sources).
 */
class RecruitmentOptionController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::enum(RecruitmentOptionType::class)],
            'label' => ['required', 'string', 'max:120', Rule::unique(RecruitmentOption::class)->where('type', $request->input('type'))],
        ]);

        RecruitmentOption::query()->create([
            ...$validated,
            'position' => (int) RecruitmentOption::query()->where('type', $validated['type'])->max('position') + 1,
        ]);

        return $this->saved('Élément ajouté.');
    }

    public function update(Request $request, RecruitmentOption $option): RedirectResponse
    {
        $option->update($request->validate([
            'label' => ['required', 'string', 'max:120', Rule::unique(RecruitmentOption::class)->where('type', $option->type->value)->ignore($option)],
        ]));

        return $this->saved('Élément renommé.');
    }

    /**
     * Candidates and applications using it simply lose the value.
     */
    public function destroy(RecruitmentOption $option): RedirectResponse
    {
        $option->delete();

        return $this->saved('Élément supprimé.');
    }

    private function saved(string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return to_route('admin.recruitment.settings.edit');
    }
}
