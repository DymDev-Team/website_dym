import { Form } from '@inertiajs/react';
import AdminPage from '@/components/admin/admin-page';
import Field from '@/components/admin/field';
import { FormActions } from '@/components/admin/form-parts';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/admin';
import { index, store, update } from '@/routes/admin/job-offers';
import type { JobOffer } from '@/types/admin';

type Props = {
    offer: JobOffer | null;
};

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

export default function JobOfferForm({ offer }: Props) {
    return (
        <AdminPage
            title={
                offer
                    ? `Modifier « ${offer.title} »`
                    : 'Nouvelle offre d’emploi'
            }
        >
            <Form
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
                                defaultValue={offer?.title}
                                required
                                maxLength={160}
                                placeholder="Soudeur TIG / MIG"
                            />
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
                                    defaultValue={offer?.contract_type ?? 'CDI'}
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
                                    defaultValue={offer?.department ?? ''}
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
                                    defaultValue={offer?.location ?? 'Abidjan'}
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
                                defaultValue={offer?.summary ?? ''}
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
                                defaultValue={offer?.description ?? ''}
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
                                defaultValue={offer?.requirements ?? ''}
                                rows={6}
                            />
                        </Field>

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
