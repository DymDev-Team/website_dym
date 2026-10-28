import { Form } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { MouseEvent } from 'react';
import { toast } from 'sonner';
import AdminPage from '@/components/admin/admin-page';
import Field from '@/components/admin/field';
import { FormActions } from '@/components/admin/form-parts';
import {
    CriteriaEditor,
    QuestionsEditor,
    toEditedQuestions,
} from '@/components/admin/offer-editors';
import type { EditedQuestion } from '@/components/admin/offer-editors';
import { postJson } from '@/components/admin/recruitment';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/admin';
import { index, store, update } from '@/routes/admin/job-offers';
import {
    criteria as suggestCriteria,
    draft as writeDraft,
} from '@/routes/admin/job-offers/assistant';
import type { Criterion, JobOffer, OfferQuestion, Option } from '@/types/admin';

type Props = {
    offer: JobOffer | null;
    questionTypes: Option[];
    aiBlockedReason: string | null;
};

type Draft = Pick<
    JobOffer,
    | 'title'
    | 'department'
    | 'contract_type'
    | 'location'
    | 'summary'
    | 'description'
    | 'requirements'
> & { criteria: Criterion[]; questions: OfferQuestion[] };

const contractTypes = [
    'CDI',
    'CDD',
    'Stage',
    'Alternance',
    'Intérim',
    'Prestation',
];
const departments = [
    'Atelier',
    'Bureau d’études',
    'Chantier',
    'Administration',
    'Commercial',
];

export default function JobOfferForm({
    offer,
    questionTypes,
    aiBlockedReason,
}: Props) {
    // Un brouillon de l'IA remplace les valeurs initiales : le formulaire
    // est recréé avec ces valeurs (clé), sans rien enregistrer.
    const [draft, setDraft] = useState<Draft | null>(null);
    const [version, setVersion] = useState(0);
    const [criteria, setCriteria] = useState<Criterion[]>(
        offer?.criteria ?? [],
    );
    const [questions, setQuestions] = useState<EditedQuestion[]>(
        toEditedQuestions(offer?.questions),
    );
    const [suggesting, setSuggesting] = useState(false);
    const initial = draft ?? offer;

    const [writing, setWriting] = useState(false);

    const applyDraft = (value: Draft) => {
        setDraft(value);
        setCriteria(value.criteria);
        setQuestions(toEditedQuestions(value.questions));
        setVersion((v) => v + 1);
    };

    // L'IA rédige toute l'offre à partir de l'intitulé, et de ce qui est
    // déjà saisi : rien n'est enregistré avant « Enregistrer ».
    const writeAll = async (event: MouseEvent<HTMLButtonElement>) => {
        const form = event.currentTarget.form;

        if (!form) {
            return;
        }

        const values = new FormData(form);
        const labels: Record<string, string> = {
            title: 'Intitulé',
            contract_type: 'Contrat',
            department: 'Service',
            location: 'Lieu',
            summary: 'Résumé',
            description: 'Missions',
            requirements: 'Profil recherché',
        };
        const brief = Object.entries(labels)
            .map(([key, label]) => {
                const value = values.get(key);

                return typeof value === 'string' && value.trim() !== ''
                    ? `${label} : ${value.trim()}`
                    : null;
            })
            .filter(Boolean)
            .join('\n');

        const body = new FormData();
        body.append('brief', brief);
        setWriting(true);

        try {
            const { draft: written } = await postJson<{ draft: Draft }>(
                writeDraft.url(),
                body,
            );
            applyDraft(written);
            toast.success('Offre rédigée : relisez, ajustez puis enregistrez.');
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setWriting(false);
        }
    };

    const suggest = async (event: MouseEvent<HTMLButtonElement>) => {
        const form = event.currentTarget.form;

        if (!form) {
            return;
        }

        const values = new FormData(form);
        const body = new FormData();

        for (const key of ['title', 'summary', 'description', 'requirements']) {
            const value = values.get(key);
            body.append(key, typeof value === 'string' ? value : '');
        }

        setSuggesting(true);

        try {
            const result = await postJson<{ criteria: Criterion[] }>(
                suggestCriteria.url(),
                body,
            );
            setCriteria(result.criteria);
            toast.success('Grille proposée : ajustez-la puis enregistrez.');
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setSuggesting(false);
        }
    };

    return (
        <AdminPage
            title={
                offer
                    ? `Modifier « ${offer.title} »`
                    : 'Nouvelle offre d’emploi'
            }
        >
            <Form
                key={version}
                {...(offer ? update.form(offer.slug) : store.form())}
                className="max-w-3xl space-y-6"
            >
                {({ errors, processing }) => (
                    <>
                        <Field
                            id="title"
                            label="Intitulé du poste"
                            error={errors.title}
                        >
                            <Input
                                id="title"
                                name="title"
                                defaultValue={initial?.title}
                                required
                                maxLength={160}
                                placeholder="Soudeur TIG / MIG"
                            />
                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={writeAll}
                                    disabled={writing || !!aiBlockedReason}
                                    title={aiBlockedReason ?? undefined}
                                >
                                    {writing ? <Spinner /> : <Sparkles />}
                                    {writing
                                        ? 'Rédaction en cours…'
                                        : 'Tout rédiger avec l’IA'}
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                    {aiBlockedReason ??
                                        'À partir de l’intitulé : résumé, missions, profil, grille et questions.'}
                                </span>
                            </div>
                        </Field>

                        <div className="grid gap-6 sm:grid-cols-3">
                            <Field
                                id="contract_type"
                                label="Contrat"
                                error={errors.contract_type}
                            >
                                <Input
                                    id="contract_type"
                                    name="contract_type"
                                    list="contract-types"
                                    defaultValue={
                                        initial?.contract_type ?? 'CDI'
                                    }
                                    required
                                    maxLength={60}
                                />
                                <datalist id="contract-types">
                                    {contractTypes.map((c) => (
                                        <option key={c} value={c} />
                                    ))}
                                </datalist>
                            </Field>

                            <Field
                                id="department"
                                label="Service"
                                error={errors.department}
                            >
                                <Input
                                    id="department"
                                    name="department"
                                    list="departments"
                                    defaultValue={initial?.department ?? ''}
                                    maxLength={80}
                                />
                                <datalist id="departments">
                                    {departments.map((d) => (
                                        <option key={d} value={d} />
                                    ))}
                                </datalist>
                            </Field>

                            <Field
                                id="location"
                                label="Lieu"
                                error={errors.location}
                            >
                                <Input
                                    id="location"
                                    name="location"
                                    defaultValue={
                                        initial?.location ?? 'Abidjan'
                                    }
                                    required
                                    maxLength={120}
                                />
                            </Field>
                        </div>

                        <Field
                            id="summary"
                            label="Résumé"
                            hint="Une ou deux phrases affichées dans la liste des offres."
                            error={errors.summary}
                        >
                            <Textarea
                                id="summary"
                                name="summary"
                                defaultValue={initial?.summary ?? ''}
                                maxLength={500}
                                rows={2}
                            />
                        </Field>

                        <Field
                            id="description"
                            label="Missions"
                            hint="Séparez les paragraphes par une ligne vide."
                            error={errors.description}
                        >
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={initial?.description ?? ''}
                                rows={8}
                            />
                        </Field>

                        <Field
                            id="requirements"
                            label="Profil recherché"
                            hint="Une compétence ou exigence par ligne : elles s’affichent sous forme de liste."
                            error={errors.requirements}
                        >
                            <Textarea
                                id="requirements"
                                name="requirements"
                                defaultValue={initial?.requirements ?? ''}
                                rows={6}
                            />
                        </Field>

                        <CriteriaEditor
                            value={criteria}
                            onChange={setCriteria}
                            errors={errors}
                            onSuggest={suggest}
                            suggesting={suggesting}
                            aiBlockedReason={aiBlockedReason}
                        />

                        <QuestionsEditor
                            value={questions}
                            onChange={setQuestions}
                            errors={errors}
                            types={questionTypes}
                        />

                        <div className="grid gap-6 sm:grid-cols-2">
                            <Field
                                id="closes_at"
                                label="Date limite (optionnelle)"
                                hint="L’offre disparaît du site après cette date."
                                error={errors.closes_at}
                            >
                                <Input
                                    id="closes_at"
                                    name="closes_at"
                                    type="date"
                                    defaultValue={offer?.closes_at ?? ''}
                                />
                            </Field>

                            <Field
                                id="slug"
                                label="Adresse de la page"
                                hint="Laissez vide pour la générer depuis l’intitulé."
                                error={errors.slug}
                            >
                                <Input
                                    id="slug"
                                    name="slug"
                                    defaultValue={offer?.slug}
                                    maxLength={180}
                                />
                            </Field>
                        </div>

                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="is_published"
                                name="is_published"
                                defaultChecked={offer?.is_published ?? true}
                            />
                            <Label htmlFor="is_published">
                                Publier sur la page Carrière
                            </Label>
                        </div>

                        <FormActions
                            processing={processing}
                            cancelHref={index()}
                        />
                    </>
                )}
            </Form>
        </AdminPage>
    );
}

JobOfferForm.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Offres d’emploi', href: index() },
        { title: props.offer ? 'Modifier' : 'Publier', href: '#' },
    ],
});
