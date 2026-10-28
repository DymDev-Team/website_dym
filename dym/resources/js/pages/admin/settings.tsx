import { Form } from '@inertiajs/react';
import { useState } from 'react';
import AdminPage from '@/components/admin/admin-page';
import Field from '@/components/admin/field';
import { FormActions } from '@/components/admin/form-parts';
import Heading from '@/components/heading';
import ImageField from '@/components/admin/image-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/admin';
import { edit, update } from '@/routes/admin/settings';
import type { SiteSettings } from '@/types/admin';

type SocialKey = 'whatsapp_url' | 'facebook_url' | 'linkedin_url' | 'instagram_url' | 'youtube_url';

const socials: { key: SocialKey; label: string }[] = [
    { key: 'whatsapp_url', label: 'WhatsApp' },
    { key: 'facebook_url', label: 'Facebook' },
    { key: 'linkedin_url', label: 'LinkedIn' },
    { key: 'instagram_url', label: 'Instagram' },
    { key: 'youtube_url', label: 'YouTube' },
];

const colorGroups = [
    { title: 'Page d’accueil', fields: [
        ['header', 'En-tête'], ['hero', 'Bannière principale'], ['intro', 'Présentation'], ['activities', 'Activités'],
        ['projects', 'Réalisations'], ['equipment', 'Équipements'], ['equipment_2', 'Équipements (2ᵉ section)'],['process', 'Notre approche'],
        ['testimonials', 'Témoignages'], ['news', 'Actualités'], ['partners', 'Partenaires'], ['footer', 'Pied de page'],
    ] },
    { title: 'Page Activités', fields: [['activities_page_cards', 'Cartes des activités'], ['activities_page_products', 'Ouvrages fabriqués'], ['activities_page_cta', 'Bandeau de contact']] },
    { title: 'Pages détail activité', fields: [['activity_page_hero', 'Présentation de l’activité'], ['activity_page_details', 'Savoir-faire'], ['activity_page_related', 'Autres activités']] },
    { title: 'Page Réalisations', fields: [['projects_page_list', 'Liste des réalisations']] },
    { title: 'Page Actualités', fields: [['news_page_list', 'Liste des actualités']] },
    { title: 'Page Article', fields: [['post_page_content', 'Article'], ['post_page_related', 'Articles associés']] },
    { title: 'Page Marques', fields: [['brands_page_list', 'Liste des marques']] },
    { title: 'Page Carrière', fields: [['career_page_intro', 'Présentation'], ['career_page_values', 'Nos engagements'], ['career_page_jobs', 'Offres d’emploi'], ['career_page_application', 'Candidature']] },
    { title: 'Page Offre d’emploi', fields: [['job_page_intro', 'Présentation de l’offre'], ['job_page_details', 'Détails et candidature']] },
    { title: 'Page Demande de devis', fields: [['quote_page_form', 'Formulaire de devis']] },
    { title: 'Pages légales', fields: [['legal_page_heading', 'Titre de la page'], ['legal_page_content', 'Contenu']] },
].map((group) => ({ ...group, fields: group.fields as [string, string][] }));

function SectionColorField({
    id,
    name,
    value,
    placeholder = '#ffffff',
}: {
    id: string;
    name: string;
    value: string;
    placeholder?: string;
}) {
    const [color, setColor] = useState(value);
    const pickerValue = /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#ffffff';

    return (
        <div className="flex gap-2">
            <Input
                aria-label={`Sélecteur de couleur pour ${name}`}
                type="color"
                value={pickerValue}
                onChange={(event) => setColor(event.target.value)}
                className="h-11 w-14 cursor-pointer p-1"
            />
            <Input
                id={id}
                name={id}
                type="text"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                placeholder={placeholder}
                maxLength={7}
                autoComplete="off"
                aria-label={`Code couleur hexadécimal pour ${name}`}
                className="font-mono uppercase"
            />
        </div>
    );
}

export default function Settings({ settings }: { settings: SiteSettings }) {
    return (
        <AdminPage
            title="Paramètres du site"
            description="Coordonnées et réseaux sociaux affichés dans le pied de page."
        >
            <Form
                {...update.form()}
                encType="multipart/form-data"
                className="max-w-2xl space-y-6"
                options={{ preserveScroll: true }}
            >
                {({ errors, processing }) => (
                    <>
                        <Heading variant="small" title="Logo du site" description="Choisissez le logo affiché dans l’en-tête sur toutes les pages publiques." />
                        <ImageField name="logo" label="Logo" currentUrl={settings.logo_url} error={errors.logo ?? errors.logo_media} />

                        <div className="space-y-5 border-t pt-6">
                            <Heading variant="small" title="Couleur des sections" description="Choisissez la couleur de fond de chaque section, sur toutes les pages du site. Les pages détail activité, article et offre partagent leur réglage." />
                            <div className="space-y-6">
                                {colorGroups.map((group) => (
                                    <div key={group.title}>
                                        <h3 className="mb-3 text-sm font-semibold">{group.title}</h3>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {group.fields.map(([key, label]) => {
                                                const field = `section_color_${key}` as keyof SiteSettings;
                                                return <Field key={key} id={field} label={label} error={errors[field]}><SectionColorField id={field} name={label} value={settings.section_colors[key] ?? '#ffffff'} /></Field>;
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-5 border-t pt-6">
                            <Heading variant="small" title="Couleur des libellés par section" description="Chaque couleur s’applique uniquement aux libellés et liens de la section choisie, carré et flèche compris. Laissez vide pour conserver les couleurs de cette section." />
                            {colorGroups.map((group) => (
                                <div key={group.title}>
                                    <h3 className="mb-3 text-sm font-semibold">{group.title}</h3>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {group.fields.map(([key, label]) => {
                                            const field = `section_label_color_${key}`;
                                            return <Field key={key} id={field} label={label} error={errors[field]}><SectionColorField id={field} name={label} value={settings.section_label_colors[key] ?? ''} placeholder="Couleurs de la section" /></Field>;
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-6" />
                        <Field
                            id="tagline"
                            label="Présentation courte"
                            error={errors.tagline}
                        >
                            <Textarea
                                id="tagline"
                                name="tagline"
                                defaultValue={settings.tagline ?? ''}
                                maxLength={300}
                                rows={2}
                            />
                        </Field>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <Field
                                id="phone"
                                label="Téléphone"
                                error={errors.phone}
                            >
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    defaultValue={settings.phone ?? ''}
                                    maxLength={40}
                                />
                            </Field>
                            <Field
                                id="email"
                                label="E-mail"
                                error={errors.email}
                            >
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={settings.email ?? ''}
                                />
                            </Field>
                        </div>

                        <Field
                            id="address"
                            label="Adresse"
                            error={errors.address}
                        >
                            <Input
                                id="address"
                                name="address"
                                defaultValue={settings.address ?? ''}
                                maxLength={255}
                            />
                        </Field>

                        <div className="space-y-6 pt-4">
                            <Heading
                                variant="small"
                                title="Réseaux sociaux"
                                description="Laissez vide pour masquer l’icône correspondante."
                            />
                            <div className="grid gap-6 sm:grid-cols-2">
                                {socials.map(({ key, label }) => (
                                    <Field
                                        key={key}
                                        id={key}
                                        label={label}
                                        error={errors[key]}
                                    >
                                        <Input
                                            id={key}
                                            name={key}
                                            type="url"
                                            placeholder="https://"
                                            defaultValue={settings[key] ?? ''}
                                        />
                                    </Field>
                                ))}
                            </div>
                        </div>

                        <FormActions
                            processing={processing}
                            cancelHref={dashboard()}
                        />
                    </>
                )}
            </Form>
        </AdminPage>
    );
}

Settings.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Paramètres', href: edit() },
    ],
};
