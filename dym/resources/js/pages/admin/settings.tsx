import { Form } from '@inertiajs/react';
import AdminPage from '@/components/admin/admin-page';
import Field from '@/components/admin/field';
import { FormActions } from '@/components/admin/form-parts';
import Heading from '@/components/heading';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/admin';
import { edit, update } from '@/routes/admin/settings';
import type { SiteSettings } from '@/types/admin';

const socials: { key: keyof SiteSettings; label: string }[] = [
    { key: 'linkedin_url', label: 'LinkedIn' },
    { key: 'facebook_url', label: 'Facebook' },
    { key: 'whatsapp_url', label: 'WhatsApp' },
    { key: 'youtube_url', label: 'YouTube' },
];

export default function Settings({ settings }: { settings: SiteSettings }) {
    return (
        <AdminPage
            title="Paramètres du site"
            description="Coordonnées et réseaux sociaux affichés dans le pied de page."
        >
            <Form
                {...update.form()}
                className="max-w-2xl space-y-6"
                options={{ preserveScroll: true }}
            >
                {({ errors, processing }) => (
                    <>
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
