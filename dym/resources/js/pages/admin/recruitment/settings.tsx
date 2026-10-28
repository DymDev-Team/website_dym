import { Form, router, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
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
    destroy as destroyStage,
    reorder,
    store as storeStage,
    update as updateStage,
} from '@/routes/admin/recruitment/stages';
import type { Labelled, Option, RecruitmentStage } from '@/types/admin';

type Stage = RecruitmentStage & { applications_count: number };

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
    };
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

function Stages({ stages, kinds }: { stages: Stage[]; kinds: Option[] }) {
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
                        <span
                            className="w-8 text-center text-xs text-muted-foreground tabular-nums"
                            title="Candidatures dans cette étape"
                        >
                            {stage.applications_count}
                        </span>
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
    models,
    efforts,
    usage,
    stages,
    stageKinds,
    options,
}: Props) {
    return (
        <AdminPage
            title="Réglages du recrutement"
            description="Tout le module se personnalise ici : IA, étapes du pipeline et listes."
        >
            <div className="space-y-12">
                <AiSettings
                    settings={settings}
                    models={models}
                    efforts={efforts}
                    usage={usage}
                />
                <Stages stages={stages} kinds={stageKinds} />
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
