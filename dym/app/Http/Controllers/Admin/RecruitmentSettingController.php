<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AnalysisStatus;
use App\Enums\RecruitmentOptionType;
use App\Enums\StageKind;
use App\Enums\StageRole;
use App\Http\Controllers\Controller;
use App\Models\AiCall;
use App\Models\ApplicationAnalysis;
use App\Models\JobOffer;
use App\Models\RecruitmentOption;
use App\Models\RecruitmentSetting;
use App\Models\RecruitmentStage;
use App\Models\Setting;
use App\Notifications\ApplicationReceived;
use App\Recruitment\AutoAdvance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class RecruitmentSettingController extends Controller
{
    /**
     * Pipeline stages, lists and AI settings of the recruitment module.
     */
    public function edit(): Response
    {
        $settings = RecruitmentSetting::values();
        $month = ApplicationAnalysis::query()->where('created_at', '>=', now()->startOfMonth());

        return Inertia::render('admin/recruitment/settings', [
            'settings' => [
                ...Arr::except($settings, 'api_key'),
                'api_key_masked' => RecruitmentSetting::maskedApiKey(),
            ],
            'contactEmail' => Setting::values()['email'],
            'models' => collect(Config::array('recruitment.models'))->map(fn (array $model, string $id) => ['value' => $id, 'label' => $model['label']])->values(),
            'efforts' => config('recruitment.efforts'),
            'usage' => [
                'spent' => round(AiCall::spentThisMonth(), 2),
                'completed' => (clone $month)->where('status', AnalysisStatus::Completed)->count(),
                'failed' => (clone $month)->where('status', AnalysisStatus::Failed)->count(),
                // Dépense du mois par usage : analyses de CV, offres, recherche dans la base.
                'by_task' => AiCall::query()
                    ->where('created_at', '>=', now()->startOfMonth())
                    ->groupBy('task')
                    ->selectRaw('task, COUNT(*) as calls, SUM(cost) as cost')
                    ->get()
                    ->map(fn (AiCall $call) => ['task' => $call->task, 'calls' => (int) $call->getAttribute('calls'), 'cost' => round((float) $call->cost, 2)]),
            ],
            'stages' => RecruitmentStage::query()->ordered()->withCount('applications')->get(),
            'stageKinds' => StageKind::options(),
            'stageRoles' => collect(StageRole::cases())->mapWithKeys(fn (StageRole $role) => [$role->value => $role->label()]),
            'autoAdvance' => [
                'from' => RecruitmentStage::initial()->name,
                'to' => RecruitmentStage::withRole(StageRole::Review)?->name,
                'pending' => AutoAdvance::pending(),
            ],
            'options' => collect(RecruitmentOptionType::cases())->map(fn (RecruitmentOptionType $type) => [
                'type' => $type->value,
                'label' => $type->label(),
                'items' => RecruitmentOption::query()->ofType($type)->get(['id', 'label']),
            ]),
        ]);
    }

    /**
     * Update the AI settings. A blank key keeps the current one.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ai_enabled' => ['boolean'],
            'auto_analyze' => ['boolean'],
            'web_research' => ['boolean'],
            'api_key' => ['nullable', 'string', 'max:255', 'starts_with:sk-ant-'],
            'remove_api_key' => ['boolean'],
            'model' => ['required', Rule::in(array_keys(config('recruitment.models')))],
            'effort' => ['required', Rule::in(config('recruitment.efforts'))],
            'monthly_budget' => ['required', 'numeric', 'min:0', 'max:100000'],
            'custom_instructions' => ['nullable', 'string', 'max:5000'],
            'priority_threshold' => ['required', 'integer', 'between:1,100'],
            'consider_threshold' => ['required', 'integer', 'between:0,99', 'lt:priority_threshold'],
        ], [
            'api_key.starts_with' => 'Une clé API Anthropic commence par « sk-ant- ».',
            'consider_threshold.lt' => 'Le seuil « à étudier » doit être inférieur au seuil « à rencontrer ».',
        ]);

        $values = [
            'ai_enabled' => $request->boolean('ai_enabled') ? '1' : '0',
            'auto_analyze' => $request->boolean('auto_analyze') ? '1' : '0',
            'web_research' => $request->boolean('web_research') ? '1' : '0',
            'model' => $validated['model'],
            'effort' => $validated['effort'],
            'monthly_budget' => (string) $validated['monthly_budget'],
            'custom_instructions' => $validated['custom_instructions'] ?? null,
            'priority_threshold' => (string) $validated['priority_threshold'],
            'consider_threshold' => (string) $validated['consider_threshold'],
        ];

        if ($request->boolean('remove_api_key')) {
            $values['api_key'] = null;
        } elseif (filled($validated['api_key'] ?? null)) {
            $values['api_key'] = trim($validated['api_key']);
        }

        RecruitmentSetting::store($values);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Réglages du recrutement enregistrés.']);

        return to_route('admin.recruitment.settings.edit');
    }

    /**
     * Assessment process: automatic move to review, psychotechnical test and
     * the criteria of the managing director's appraisal.
     */
    public function updateProcess(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'auto_advance' => ['boolean'],
            'auto_advance_threshold' => ['required', 'integer', 'between:1,100'],
            'psychotest_duration' => ['required', 'integer', 'between:5,180'],
            'psychotest_validity_days' => ['required', 'integer', 'between:1,60'],
            'dg_criteria' => ['required', 'string', 'max:2000', function (string $attribute, mixed $value, \Closure $fail) {
                $lines = RecruitmentSetting::lines((string) $value);

                if ($lines === [] || count($lines) > 10 || collect($lines)->contains(fn (string $line) => mb_strlen($line) > 80)) {
                    $fail('Indiquez de 1 à 10 critères, un par ligne, de 80 caractères au plus.');
                }
            }],
        ], [
            'dg_criteria.required' => 'Indiquez au moins un critère.',
        ]);

        RecruitmentSetting::store([
            'auto_advance' => $request->boolean('auto_advance') ? '1' : '0',
            'auto_advance_threshold' => (string) $validated['auto_advance_threshold'],
            'psychotest_duration' => (string) $validated['psychotest_duration'],
            'psychotest_validity_days' => (string) $validated['psychotest_validity_days'],
            'dg_criteria' => implode("\n", RecruitmentSetting::lines($validated['dg_criteria'])),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Parcours de recrutement enregistré.']);

        return to_route('admin.recruitment.settings.edit');
    }

    /**
     * Move now the applications already waiting that reach the threshold.
     */
    public function applyAutoAdvance(): RedirectResponse
    {
        $moved = AutoAdvance::applyToAll();

        Inertia::flash('toast', ['type' => 'success', 'message' => $moved === 0
            ? 'Aucune candidature à déplacer.'
            : "{$moved} candidature(s) déplacée(s)."]);

        return to_route('admin.recruitment.settings.edit');
    }

    /**
     * Update the acknowledgment e-mail sent to candidates who apply on the site.
     */
    public function updateAcknowledgment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'acknowledgment_enabled' => ['boolean'],
            'acknowledgment_subject' => ['required', 'string', 'max:150'],
            'acknowledgment_body' => ['required', 'string', 'max:5000'],
            'acknowledgment_reply_to' => ['nullable', 'email', 'max:255'],
        ], [
            'acknowledgment_subject.required' => 'Indiquez l’objet de l’e-mail.',
            'acknowledgment_body.required' => 'Indiquez le texte de l’e-mail.',
            'acknowledgment_reply_to.email' => 'Cette adresse e-mail n’est pas valide.',
        ]);

        RecruitmentSetting::store([
            'acknowledgment_enabled' => $request->boolean('acknowledgment_enabled') ? '1' : '0',
            'acknowledgment_subject' => trim($validated['acknowledgment_subject']),
            'acknowledgment_body' => trim($validated['acknowledgment_body']),
            'acknowledgment_reply_to' => $validated['acknowledgment_reply_to'] ?? null,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'E-mail de confirmation enregistré.']);

        return to_route('admin.recruitment.settings.edit');
    }

    /**
     * Send the saved acknowledgment to the address typed by the admin (their
     * own by default), addressed to them and to the latest open offer, to
     * check its wording and the mailer.
     */
    public function testAcknowledgment(Request $request): RedirectResponse
    {
        $email = $request->validate(['test_email' => ['required', 'email', 'max:255']], [
            'test_email.required' => 'Indiquez l’adresse qui recevra le test.',
            'test_email.email' => 'Cette adresse e-mail n’est pas valide.',
        ])['test_email'];
        $offer = JobOffer::query()->open()->latest()->first();
        $mailer = (string) config('mail.default');

        // « log » et « array » n'envoient rien : le test ne doit pas annoncer un envoi.
        if (in_array($mailer, ['log', 'array'], true)) {
            Inertia::flash('toast', ['type' => 'error', 'message' => "Aucun e-mail n’est parti : le serveur est réglé sur MAIL_MAILER={$mailer}. Corrigez le fichier .env du serveur."]);

            return to_route('admin.recruitment.settings.edit');
        }

        try {
            Notification::route('mail', $email)->notify(new ApplicationReceived($request->user()->name, $offer?->title));
            $toast = ['type' => 'success', 'message' => "E-mail de test envoyé à {$email} par {$mailer}. S’il n’arrive pas, regardez les courriers indésirables."];
        } catch (Throwable $e) {
            report($e);
            // Raison précise (clé refusée, domaine non validé…) : la page est réservée aux admins.
            $toast = ['type' => 'error', 'message' => 'L’envoi a échoué : '.Str::limit($e->getMessage(), 300)];
        }

        Inertia::flash('toast', $toast);

        return to_route('admin.recruitment.settings.edit');
    }
}
