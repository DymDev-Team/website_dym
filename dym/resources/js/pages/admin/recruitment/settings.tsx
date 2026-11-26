import { Form, router, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Mail, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AdminPage from '@/components/admin/admin-page';
import Field from '@/components/admin/field';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/admin';
import { index as pipeline } from '@/routes/admin/applications';
import {
    destroy as destroyOption,
    store as storeOption,
    update as updateOption,
} from '@/routes/admin/recruitment/options';
import { edit, update } from '@/routes/admin/recruitment/settings';
import {
    test as testAcknowledgment,
    update as updateAcknowledgment,
} from '@/routes/admin/recruitment/settings/acknowledgment';
import {
    apply as applyAutoAdvance,
    update as updateProcess,
} from '@/routes/admin/recruitment/settings/process';
import {
    destroy as destroyStage,
    reorder,
    store as storeStage,
    update as updateStage,
} from '@/routes/admin/recruitment/stages';
import { update as updateStageEmail } from '@/routes/admin/recruitment/stages/email';
import type {
    Labelled,
    Option,
    RecruitmentStage,
    StageRole,
} from '@/types/admin';

type Stage = RecruitmentStage & {
    applications_count: number;
    role: StageRole | null;
    email_subject: string | null;
    email_body: string | null;
};

type Props = {
    settings: {
        ai_enabled: boolean;
        auto_analyze: boolean;
        api_key_masked: string | null;
        model: string;
        effort: string;
        monthly_budget: number;
        custom_instructions: string | null;
        priority_threshold: number;
        consider_threshold: number;
        web_research: boolean;
        acknowledgment_enabled: boolean;
        acknowledgment_subject: string;
        acknowledgment_body: string;
        acknowledgment_reply_to: string | null;
        auto_advance: boolean;
        auto_advance_threshold: number;
        psychotest_question_seconds: number;
        psychotest_validity_days: number;
        psychotest_mix_aptitude: number;
        psychotest_mix_behaviour: number;
        psychotest_mix_trade: number;
        dg_criteria: string[];
        ai_knowledge: string;
        weight_ai: number;
        weight_test: number;
        weight_dg: number;
    };
    contactEmail: string | null;
    models: Option[];
    efforts: string[];
    usage: {
        spent: number;
        completed: number;
        failed: number;
        by_task: { task: string; calls: number; cost: number }[];
    };
    stages: Stage[];
    stageKinds: Option[];
    stageRoles: Record<StageRole, string>;
    autoAdvance: { from: string; to: string | null; pending: number };
    options: { type: string; label: string; items: Labelled[] }[];
};

const effortLabels: Record<string, string> = {
    low: 'Rapide (moins cher)',
    medium: 'Équilibré (recommandé)',
    high: 'Approfondi (plus cher)',
};

const taskLabels: Record<string, string> = {
    cv_analysis: 'Analyse des CV',
    offer_criteria: 'Grilles d’évaluation',
    offer_draft: 'Rédaction d’offres',
    sourcing: 'Recherche dans la base',
    psychotest: 'Tests psychotechniques',
    verdict: 'Avis de recrutement',
};

const money = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
});

function AiSettings({
    settings,
    models,
    efforts,
    usage,
}: Pick<Props, 'settings' | 'models' | 'efforts' | 'usage'>) {
    return (
        <section className="space-y-6">
            <Heading
                variant="small"
                title="Analyse par IA"
                description="Claude lit chaque CV, remplit la fiche, classe le profil et le note pour le poste visé."
            />

            <div className="grid gap-3 rounded-xl border p-4 text-sm sm:grid-cols-3">
                <div>
                    <p className="text-muted-foreground">Dépensé ce mois-ci</p>
                    <p className="text-lg font-semibold">
                        {money.format(usage.spent)}{' '}
                        <span className="text-sm font-normal text-muted-foreground">
                            / {money.format(settings.monthly_budget)}
                        </span>
                    </p>
                </div>
                <div>
                    <p className="text-muted-foreground">CV analysés</p>
                    <p className="text-lg font-semibold">{usage.completed}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Échecs</p>
                    <p className="text-lg font-semibold">{usage.failed}</p>
                </div>
                {usage.by_task.length > 0 && (
                    <ul className="space-y-1 border-t pt-3 text-muted-foreground sm:col-span-3">
                        {usage.by_task.map((t) => (
                            <li
                                key={t.task}
                                className="flex justify-between gap-3"
                            >
                                <span>
                                    {taskLabels[t.task] ?? t.task} · {t.calls}{' '}
                                    appel{t.calls > 1 ? 's' : ''}
                                </span>
                                <span className="tabular-nums">
                                    {money.format(t.cost)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <Form {...update.form()} className="max-w-3xl space-y-6">
                {({ errors, processing }) => (
                    <>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="ai_enabled"
                                    name="ai_enabled"
                                    value="1"
                                    defaultChecked={settings.ai_enabled}
                                />
                                <Label htmlFor="ai_enabled">
                                    Activer l’analyse par IA
                                </Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="auto_analyze"
                                    name="auto_analyze"
                                    value="1"
                                    defaultChecked={settings.auto_analyze}
                                />
                                <Label htmlFor="auto_analyze">
                                    Analyser automatiquement chaque nouveau CV
                                </Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="web_research"
                                    name="web_research"
                                    value="1"
                                    defaultChecked={settings.web_research}
                                />
                                <Label htmlFor="web_research">
                                    Rechercher sur le web les écoles et
                                    entreprises citées (5 recherches au plus par
                                    CV, 0,01 $ chacune ; jamais sur la personne)
                                </Label>
                            </div>
                        </div>

                        <Field
                            id="api_key"
                            label="Clé API Anthropic"
                            hint={
                                settings.api_key_masked
                                    ? `Clé enregistrée : ${settings.api_key_masked}. Laissez vide pour la conserver.`
                                    : 'Créez une clé sur console.anthropic.com. Elle est chiffrée en base et n’est jamais renvoyée au navigateur.'
                            }
                            error={errors.api_key}
                        >
                            <Input
                                id="api_key"
                                name="api_key"
                                type="password"
                                autoComplete="off"
                                placeholder="sk-ant-…"
                            />
                        </Field>
                        {settings.api_key_masked && (
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="remove_api_key"
                                    name="remove_api_key"
                                    value="1"
                                />
                                <Label htmlFor="remove_api_key">
                                    Supprimer la clé enregistrée
                                </Label>
                            </div>
                        )}

                        <div className="grid gap-6 sm:grid-cols-3">
                            <Field
                                id="model"
                                label="Modèle"
                                error={errors.model}
                            >
                                <Select
                                    name="model"
                                    defaultValue={settings.model}
                                >
                                    <SelectTrigger id="model">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {models.map((m) => (
                                            <SelectItem
                                                key={m.value}
                                                value={m.value}
                                            >
                                                {m.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field
                                id="effort"
                                label="Profondeur d’analyse"
                                error={errors.effort}
                            >
                                <Select
                                    name="effort"
                                    defaultValue={settings.effort}
                                >
                                    <SelectTrigger id="effort">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {efforts.map((e) => (
                                            <SelectItem key={e} value={e}>
                                                {effortLabels[e] ?? e}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field
                                id="monthly_budget"
                                label="Plafond mensuel ($)"
                                hint="Au-delà, les analyses sont suspendues jusqu’au mois suivant."
                                error={errors.monthly_budget}
                            >
                                <Input
                                    id="monthly_budget"
                                    name="monthly_budget"
                                    type="number"
                                    min={0}
                                    step="1"
                                    defaultValue={settings.monthly_budget}
                                    required
                                />
                            </Field>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <Field
                                id="priority_threshold"
                                label="« À rencontrer en priorité » à partir de"
                                hint="Note sur 100, si aucun critère indispensable ne manque."
                                error={errors.priority_threshold}
                            >
                                <Input
                                    id="priority_threshold"
                                    name="priority_threshold"
                                    type="number"
                                    min={1}
                                    max={100}
                                    defaultValue={settings.priority_threshold}
                                    required
                                />
                            </Field>
                            <Field
                                id="consider_threshold"
                                label="« À étudier » à partir de"
                                hint="En dessous : « Ne correspond pas »."
                                error={errors.consider_threshold}
                            >
                                <Input
                                    id="consider_threshold"
                                    name="consider_threshold"
                                    type="number"
                                    min={0}
                                    max={99}
                                    defaultValue={settings.consider_threshold}
                                    required
                                />
                            </Field>
                        </div>

                        <Field
                            id="custom_instructions"
                            label="Consignes de l’équipe RH"
                            hint="Ajoutées aux règles de base, sans pouvoir les lever : l’IA n’utilise jamais l’âge, le sexe, l’origine, la photo ou la situation familiale."
                            error={errors.custom_instructions}
                        >
                            <Textarea
                                id="custom_instructions"
                                name="custom_instructions"
                                rows={5}
                                maxLength={5000}
                                defaultValue={
                                    settings.custom_instructions ?? ''
                                }
                                placeholder="Ex. : les habilitations électriques et le CACES sont un vrai plus pour les postes d’atelier."
                            />
                        </Field>

                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner />}
                            Enregistrer les réglages IA
                        </Button>
                    </>
                )}
            </Form>
        </section>
    );
}

function AcknowledgmentSettings({
    settings,
    contactEmail,
}: Pick<Props, 'settings' | 'contactEmail'>) {
    const userEmail = usePage().props.auth.user?.email ?? '';

    return (
        <section className="space-y-6">
            <Heading
                variant="small"
                title="E-mail de confirmation au candidat"
                description="Envoyé automatiquement à chaque candidature reçue par le site, pas aux CV ajoutés par l’équipe."
            />

            <Form
                {...updateAcknowledgment.form()}
                options={{ preserveScroll: true }}
                className="max-w-3xl space-y-6"
            >
                {({ errors, processing }) => (
                    <>
                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="acknowledgment_enabled"
                                name="acknowledgment_enabled"
                                value="1"
                                defaultChecked={settings.acknowledgment_enabled}
                            />
                            <Label htmlFor="acknowledgment_enabled">
                                Envoyer un e-mail de confirmation au candidat
                            </Label>
                        </div>

                        <Field
                            id="acknowledgment_subject"
                            label="Objet"
                            error={errors.acknowledgment_subject}
                        >
                            <Input
                                id="acknowledgment_subject"
                                name="acknowledgment_subject"
                                maxLength={150}
                                defaultValue={settings.acknowledgment_subject}
                                required
                            />
                        </Field>

                        <Field
                            id="acknowledgment_body"
                            label="Texte"
                            hint="{nom} : nom du candidat · {poste} : intitulé de l’offre, ou « Candidature spontanée ». Une ligne vide sépare deux paragraphes."
                            error={errors.acknowledgment_body}
                        >
                            <Textarea
                                id="acknowledgment_body"
                                name="acknowledgment_body"
                                rows={16}
                                maxLength={5000}
                                defaultValue={settings.acknowledgment_body}
                                required
                            />
                        </Field>

                        <Field
                            id="acknowledgment_reply_to"
                            label="Adresse de réponse (facultatif)"
                            hint={`Si le candidat répond à l’e-mail. Laissez vide pour recevoir sa réponse sur l’e-mail de contact du site${contactEmail ? ` (${contactEmail})` : ''}.`}
                            error={errors.acknowledgment_reply_to}
                        >
                            <Input
                                id="acknowledgment_reply_to"
                                name="acknowledgment_reply_to"
                                type="email"
                                maxLength={255}
                                defaultValue={
                                    settings.acknowledgment_reply_to ?? ''
                                }
                                placeholder="rh@dym.ci"
                            />
                        </Field>

                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner />}
                            Enregistrer l’e-mail
                        </Button>
                    </>
                )}
            </Form>

            <Form
                {...testAcknowledgment.form()}
                options={{ preserveScroll: true }}
                className="max-w-3xl border-t pt-6"
            >
                {({ errors, processing }) => (
                    <Field
                        id="test_email"
                        label="Envoyer un e-mail de test à"
                        hint="Le test reprend la version enregistrée : enregistrez d’abord vos modifications."
                        error={errors.test_email}
                    >
                        <div className="flex flex-wrap gap-2">
                            <Input
                                id="test_email"
                                name="test_email"
                                type="email"
                                maxLength={255}
                                defaultValue={userEmail}
                                required
                                className="max-w-sm"
                            />
                            <Button
                                type="submit"
                                variant="outline"
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Envoyer le test
                            </Button>
                        </div>
                    </Field>
                )}
            </Form>
        </section>
    );
}

function DeleteStage({ stage, stages }: { stage: Stage; stages: Stage[] }) {
    const [moveTo, setMoveTo] = useState('');
    const others = stages.filter((s) => s.id !== stage.id);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Supprimer l’étape ${stage.name}`}
                >
                    <Trash2 className="text-destructive" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Supprimer l’étape « {stage.name} » ?
                    </DialogTitle>
                    <DialogDescription>
                        {stage.applications_count > 0
                            ? `${stage.applications_count} candidature(s) s’y trouvent : choisissez l’étape qui les recevra.`
                            : 'Aucune candidature ne s’y trouve.'}
                    </DialogDescription>
                </DialogHeader>
                {stage.applications_count > 0 && (
                    <Select value={moveTo} onValueChange={setMoveTo}>
                        <SelectTrigger aria-label="Étape de destination">
                            <SelectValue placeholder="Déplacer vers…" />
                        </SelectTrigger>
                        <SelectContent>
                            {others.map((s) => (
                                <SelectItem key={s.id} value={String(s.id)}>
                                    {s.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Annuler</Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        disabled={stage.applications_count > 0 && !moveTo}
                        onClick={() =>
                            router.delete(destroyStage.url(stage.id), {
                                data: moveTo ? { move_to: moveTo } : {},
                                preserveScroll: true,
                            })
                        }
                    >
                        Supprimer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function StageFields({ stage, kinds }: { stage?: Stage; kinds: Option[] }) {
    const [color, setColor] = useState(stage?.color ?? '#2563eb');

    return (
        <>
            <input
                type="color"
                name="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className="h-9 w-10 shrink-0 cursor-pointer rounded-md border p-1"
                aria-label="Couleur"
            />
            <Input
                name="name"
                defaultValue={stage?.name}
                required
                maxLength={60}
                placeholder="Nom de l’étape"
                aria-label="Nom de l’étape"
                className="min-w-40 flex-1"
            />
            <Select name="kind" defaultValue={stage?.kind ?? 'open'}>
                <SelectTrigger className="w-36" aria-label="Type">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {kinds.map((k) => (
                        <SelectItem key={k.value} value={k.value}>
                            {k.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </>
    );
}

function StageEmail({ stage }: { stage: Stage }) {
    const [open, setOpen] = useState(false);
    const hasEmail = Boolean(stage.email_subject && stage.email_body);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`E-mail de l’étape ${stage.name}`}
                    title={
                        hasEmail
                            ? 'E-mail proposé à l’arrivée dans cette étape'
                            : 'Aucun e-mail pour cette étape'
                    }
                >
                    <Mail
                        className={
                            hasEmail
                                ? 'text-foreground'
                                : 'text-muted-foreground/40'
                        }
                    />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        E-mail de l’étape « {stage.name} »
                    </DialogTitle>
                    <DialogDescription>
                        Proposé quand un candidat arrive dans cette étape, et
                        modifiable avant l’envoi : rien ne part sans votre clic.
                        Videz les deux champs pour le retirer.
                    </DialogDescription>
                </DialogHeader>
                <Form
                    {...updateStageEmail.form(stage.id)}
                    options={{ preserveScroll: true }}
                    onSuccess={() => setOpen(false)}
                    className="space-y-4"
                >
                    {({ errors, processing }) => (
                        <>
                            <Field
                                id={`email_subject_${stage.id}`}
                                label="Objet"
                                error={errors.email_subject}
                            >
                                <Input
                                    id={`email_subject_${stage.id}`}
                                    name="email_subject"
                                    maxLength={150}
                                    defaultValue={stage.email_subject ?? ''}
                                />
                            </Field>
                            <Field
                                id={`email_body_${stage.id}`}
                                label="Texte"
                                hint="{nom} : nom du candidat · {poste} : intitulé de l’offre, ou « Candidature spontanée ». Une ligne vide sépare deux paragraphes."
                                error={errors.email_body}
                            >
                                <Textarea
                                    id={`email_body_${stage.id}`}
                                    name="email_body"
                                    rows={12}
                                    maxLength={5000}
                                    defaultValue={stage.email_body ?? ''}
                                />
                            </Field>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="ghost">
                                        Annuler
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Enregistrer
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function ProcessSettings({
    settings,
    autoAdvance,
}: Pick<Props, 'settings' | 'autoAdvance'>) {
    return (
        <section className="space-y-6">
            <Heading
                variant="small"
                title="Parcours de recrutement"
                description="Passage automatique après l’analyse IA, test psychotechnique, puis appréciation du DG."
            />

            <Form
                {...updateProcess.form()}
                options={{ preserveScroll: true }}
                className="max-w-3xl space-y-6"
            >
                {({ errors, processing }) => (
                    <>
                        <div className="space-y-3 rounded-xl border p-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <Checkbox
                                    id="auto_advance"
                                    name="auto_advance"
                                    value="1"
                                    defaultChecked={settings.auto_advance}
                                />
                                <Label htmlFor="auto_advance">
                                    Passer automatiquement de «{' '}
                                    {autoAdvance.from} » à «{' '}
                                    {autoAdvance.to ?? '—'} » à partir de
                                </Label>
                                <Input
                                    name="auto_advance_threshold"
                                    type="number"
                                    min={1}
                                    max={100}
                                    defaultValue={
                                        settings.auto_advance_threshold
                                    }
                                    className="w-20"
                                    aria-label="Note IA minimale"
                                    required
                                />
                                <span className="text-sm">/ 100 (note IA)</span>
                            </div>
                            <InputError
                                message={errors.auto_advance_threshold}
                            />
                            {autoAdvance.to === null && (
                                <p className="text-sm text-destructive">
                                    L’étape de destination a été supprimée :
                                    aucun passage automatique n’est possible.
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Chaque CV analysé qui atteint la note change de
                                colonne tout seul. Un candidat déjà déplacé par
                                l’équipe n’est jamais touché.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <Field
                                id="psychotest_question_seconds"
                                label="Temps par question du test (secondes)"
                                error={errors.psychotest_question_seconds}
                            >
                                <Input
                                    id="psychotest_question_seconds"
                                    name="psychotest_question_seconds"
                                    type="number"
                                    min={15}
                                    max={300}
                                    defaultValue={
                                        settings.psychotest_question_seconds
                                    }
                                    required
                                />
                            </Field>
                            <Field
                                id="psychotest_validity_days"
                                label="Validité du lien envoyé (jours)"
                                error={errors.psychotest_validity_days}
                            >
                                <Input
                                    id="psychotest_validity_days"
                                    name="psychotest_validity_days"
                                    type="number"
                                    min={1}
                                    max={60}
                                    defaultValue={
                                        settings.psychotest_validity_days
                                    }
                                    required
                                />
                            </Field>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                Contenu du test psychotechnique (en %, total
                                100)
                            </p>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {(
                                    [
                                        [
                                            'psychotest_mix_aptitude',
                                            'Aptitudes (logique, attention, calcul)',
                                        ],
                                        [
                                            'psychotest_mix_behaviour',
                                            'Comportement au travail',
                                        ],
                                        [
                                            'psychotest_mix_trade',
                                            'Métier et sécurité',
                                        ],
                                    ] as const
                                ).map(([name, label]) => (
                                    <Field
                                        key={name}
                                        id={name}
                                        label={label}
                                        error={errors[name]}
                                    >
                                        <Input
                                            id={name}
                                            name={name}
                                            type="number"
                                            min={0}
                                            max={100}
                                            defaultValue={settings[name]}
                                            required
                                        />
                                    </Field>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Part de chaque volet dans la réserve de
                                questions d’un poste. Une réserve déjà créée
                                garde ses questions : régénérez-la depuis la
                                fiche d’un candidat pour appliquer un
                                changement.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                Poids de chaque note dans la note globale
                            </p>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {(
                                    [
                                        ['weight_ai', 'Note IA (CV)'],
                                        ['weight_test', 'Test psychotechnique'],
                                        ['weight_dg', 'Appréciation DG'],
                                    ] as const
                                ).map(([name, label]) => (
                                    <Field
                                        key={name}
                                        id={name}
                                        label={label}
                                        error={errors[name]}
                                    >
                                        <Input
                                            id={name}
                                            name={name}
                                            type="number"
                                            min={0}
                                            max={10}
                                            defaultValue={settings[name]}
                                            required
                                        />
                                    </Field>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                1, 1, 1 : moyenne simple. Mettez 2 au DG pour
                                que sa note compte double ; 0 pour ignorer une
                                note.
                            </p>
                        </div>

                        <Field
                            id="ai_knowledge"
                            label="Base de connaissances de l’IA"
                            hint="Règles et informations que l’IA respecte quand elle rédige les tests psychotechniques et les offres, une par ligne."
                            error={errors.ai_knowledge}
                        >
                            <Textarea
                                id="ai_knowledge"
                                name="ai_knowledge"
                                rows={5}
                                maxLength={5000}
                                defaultValue={settings.ai_knowledge}
                            />
                        </Field>

                        <Field
                            id="dg_criteria"
                            label="Critères de l’appréciation DG"
                            hint="Un critère par ligne (10 au plus), chacun noté de 1 à 5 : la note DG est sur 100."
                            error={errors.dg_criteria}
                        >
                            <Textarea
                                id="dg_criteria"
                                name="dg_criteria"
                                rows={6}
                                defaultValue={settings.dg_criteria.join('\n')}
                                required
                            />
                        </Field>

                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner />}
                            Enregistrer le parcours
                        </Button>
                    </>
                )}
            </Form>

            {autoAdvance.to !== null && (
                <Form
                    {...applyAutoAdvance.form()}
                    options={{ preserveScroll: true }}
                    className="flex max-w-3xl flex-wrap items-center gap-3 border-t pt-6"
                >
                    {({ processing }) => (
                        <>
                            <p className="text-sm">
                                {autoAdvance.pending === 0
                                    ? `Aucune candidature de « ${autoAdvance.from} » n’atteint ${settings.auto_advance_threshold} / 100.`
                                    : `${autoAdvance.pending} candidature(s) de « ${autoAdvance.from} » atteignent déjà ${settings.auto_advance_threshold} / 100.`}
                            </p>
                            <Button
                                type="submit"
                                variant="outline"
                                disabled={
                                    processing ||
                                    autoAdvance.pending === 0 ||
                                    !settings.auto_advance
                                }
                            >
                                {processing && <Spinner />}
                                Les déplacer maintenant
                            </Button>
                        </>
                    )}
                </Form>
            )}
        </section>
    );
}

function Stages({
    stages,
    kinds,
    roles,
}: {
    stages: Stage[];
    kinds: Option[];
    roles: Record<StageRole, string>;
}) {
    const errors = usePage().props.errors as Record<string, string>;

    const move = (index: number, offset: number) => {
        const ids = stages.map((s) => s.id);
        [ids[index], ids[index + offset]] = [ids[index + offset], ids[index]];
        router.put(reorder.url(), { ids }, { preserveScroll: true });
    };

    return (
        <section className="space-y-4">
            <Heading
                variant="small"
                title="Étapes du pipeline"
                description="Les colonnes du recrutement, dans l’ordre. La première reçoit les nouvelles candidatures et doit être de type « En cours »."
            />
            <InputError message={errors.stages ?? errors.move_to} />

            <ul className="max-w-3xl space-y-2">
                {stages.map((stage, index) => (
                    <li key={stage.id} className="flex items-center gap-1">
                        <Form
                            {...updateStage.form(stage.id)}
                            options={{ preserveScroll: true }}
                            className="flex flex-1 flex-wrap items-center gap-2"
                        >
                            {({ processing }) => (
                                <>
                                    <StageFields stage={stage} kinds={kinds} />
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        size="sm"
                                        disabled={processing}
                                    >
                                        Enregistrer
                                    </Button>
                                </>
                            )}
                        </Form>
                        {stage.role && (
                            <span
                                className="rounded bg-muted px-1.5 py-0.5 text-xs whitespace-nowrap text-muted-foreground"
                                title="Étape utilisée par le parcours de recrutement"
                            >
                                {roles[stage.role]}
                            </span>
                        )}
                        <span
                            className="w-8 text-center text-xs text-muted-foreground tabular-nums"
                            title="Candidatures dans cette étape"
                        >
                            {stage.applications_count}
                        </span>
                        <StageEmail stage={stage} />
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={index === 0}
                            onClick={() => move(index, -1)}
                            aria-label="Monter"
                        >
                            <ArrowUp />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={index === stages.length - 1}
                            onClick={() => move(index, 1)}
                            aria-label="Descendre"
                        >
                            <ArrowDown />
                        </Button>
                        <DeleteStage stage={stage} stages={stages} />
                    </li>
                ))}
            </ul>

            <Form
                {...storeStage.form()}
                options={{ preserveScroll: true }}
                resetOnSuccess
                className="flex max-w-3xl flex-wrap items-center gap-2 border-t pt-4"
            >
                {({ processing }) => (
                    <>
                        <StageFields kinds={kinds} />
                        <Button type="submit" size="sm" disabled={processing}>
                            <Plus />
                            Ajouter l’étape
                        </Button>
                    </>
                )}
            </Form>
        </section>
    );
}

function OptionList({
    type,
    label,
    items,
}: {
    type: string;
    label: string;
    items: Labelled[];
}) {
    return (
        <div className="space-y-3 rounded-xl border p-4">
            <h3 className="font-medium">{label}</h3>
            <ul className="space-y-2">
                {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-2">
                        <Form
                            {...updateOption.form(item.id)}
                            options={{ preserveScroll: true }}
                            className="flex flex-1 gap-2"
                        >
                            <Input
                                name="label"
                                defaultValue={item.label}
                                required
                                maxLength={120}
                                aria-label={`Libellé ${item.label}`}
                            />
                            <Button type="submit" variant="outline" size="sm">
                                OK
                            </Button>
                        </Form>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Supprimer ${item.label}`}
                            onClick={() =>
                                router.delete(destroyOption.url(item.id), {
                                    preserveScroll: true,
                                })
                            }
                        >
                            <Trash2 className="text-destructive" />
                        </Button>
                    </li>
                ))}
            </ul>
            <Form
                {...storeOption.form()}
                options={{ preserveScroll: true }}
                resetOnSuccess
                className="flex gap-2 border-t pt-3"
            >
                {({ errors }) => (
                    <div className="flex-1 space-y-1">
                        <div className="flex gap-2">
                            <input type="hidden" name="type" value={type} />
                            <Input
                                name="label"
                                required
                                maxLength={120}
                                placeholder="Nouvel élément"
                                aria-label={`Ajouter à ${label}`}
                            />
                            <Button type="submit" size="sm">
                                <Plus />
                                Ajouter
                            </Button>
                        </div>
                        <InputError message={errors.label} />
                    </div>
                )}
            </Form>
        </div>
    );
}

export default function RecruitmentSettings({
    settings,
    contactEmail,
    models,
    efforts,
    usage,
    stages,
    stageKinds,
    stageRoles,
    autoAdvance,
    options,
}: Props) {
    return (
        <AdminPage
            title="Réglages du recrutement"
            description="Tout le module se personnalise ici : IA, parcours, e-mails au candidat, étapes du pipeline et listes."
        >
            <div className="space-y-12">
                <AiSettings
                    settings={settings}
                    models={models}
                    efforts={efforts}
                    usage={usage}
                />
                <ProcessSettings
                    settings={settings}
                    autoAdvance={autoAdvance}
                />
                <AcknowledgmentSettings
                    settings={settings}
                    contactEmail={contactEmail}
                />
                <Stages stages={stages} kinds={stageKinds} roles={stageRoles} />
                <section className="space-y-4">
                    <Heading
                        variant="small"
                        title="Listes"
                        description="Les familles de métiers servent au classement des CV par l’IA ; les sources indiquent la provenance des candidatures."
                    />
                    <div className="grid max-w-5xl gap-4 lg:grid-cols-2">
                        {options.map((o) => (
                            <OptionList key={o.type} {...o} />
                        ))}
                    </div>
                </section>
            </div>
        </AdminPage>
    );
}

RecruitmentSettings.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Recrutement', href: pipeline() },
        { title: 'Réglages', href: edit() },
    ],
};
