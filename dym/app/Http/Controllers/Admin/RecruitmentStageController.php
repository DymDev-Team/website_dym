<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ApplicationEventType;
use App\Enums\StageKind;
use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\RecruitmentStage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * Pipeline stages. New applications always enter the first stage, which must
 * therefore stay an open one.
 */
class RecruitmentStageController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        RecruitmentStage::query()->create([
            ...$this->validated($request),
            'position' => (int) RecruitmentStage::query()->max('position') + 1,
        ]);

        return $this->saved('Étape ajoutée.');
    }

    public function update(Request $request, RecruitmentStage $stage): RedirectResponse
    {
        DB::transaction(function () use ($request, $stage) {
            $stage->update($this->validated($request));
            $this->ensureFirstStageIsOpen();
        });

        return $this->saved('Étape modifiée.');
    }

    /**
     * Save the order of the columns.
     */
    public function reorder(Request $request): RedirectResponse
    {
        $ids = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', Rule::exists(RecruitmentStage::class, 'id')],
        ])['ids'];

        DB::transaction(function () use ($ids) {
            foreach (array_values($ids) as $position => $id) {
                RecruitmentStage::query()->whereKey($id)->update(['position' => $position]);
            }

            $this->ensureFirstStageIsOpen();
        });

        return $this->saved('Ordre des étapes enregistré.');
    }

    /**
     * Delete a stage, moving its applications to another one first.
     */
    public function destroy(Request $request, RecruitmentStage $stage): RedirectResponse
    {
        $count = $stage->applications()->count();

        $request->validate([
            'move_to' => [Rule::requiredIf($count > 0), 'nullable', 'integer', Rule::exists(RecruitmentStage::class, 'id'), Rule::notIn([$stage->id])],
        ], [
            'move_to.required' => 'Choisissez l’étape qui recevra les candidatures de celle-ci.',
        ]);

        $target = $request->filled('move_to') ? RecruitmentStage::query()->findOrFail($request->integer('move_to')) : null;

        DB::transaction(function () use ($stage, $target, $request) {
            if ($target !== null) {
                $stage->applications()->each(function (JobApplication $application) use ($stage, $target, $request) {
                    $application->update(['stage_id' => $target->id]);
                    $application->record(ApplicationEventType::StageChanged, ['from' => $stage->name, 'to' => $target->name], $request->user());
                });
            }

            $stage->delete();
            $this->ensureFirstStageIsOpen();
        });

        return $this->saved('Étape supprimée.');
    }

    /**
     * @return array{name: string, color: string, kind: string}
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:60'],
            'color' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'kind' => ['required', Rule::enum(StageKind::class)],
        ]);
    }

    /**
     * Abort the transaction when no open stage would receive new applications.
     */
    private function ensureFirstStageIsOpen(): void
    {
        if (RecruitmentStage::query()->ordered()->first()?->kind !== StageKind::Open) {
            throw ValidationException::withMessages([
                'stages' => 'La première étape doit être de type « En cours » : elle reçoit les nouvelles candidatures.',
            ]);
        }
    }

    private function saved(string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return to_route('admin.recruitment.settings.edit');
    }
}
