import { Form } from '@inertiajs/react';
import AdminPage from '@/components/admin/admin-page';
import Field from '@/components/admin/field';
import { FormActions, PublishFields } from '@/components/admin/form-parts';
import ImageField from '@/components/admin/image-field';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes/admin';
import { index, store, update } from '@/routes/admin/partners';
import type { Partner } from '@/types/admin';

type Props = {
    partner: Partner | null;
    nextPosition?: number;
};

export default function PartnerForm({ partner, nextPosition = 1 }: Props) {
    return (
        <AdminPage
            title={
                partner ? `Modifier « ${partner.name} »` : 'Nouveau partenaire'
            }
        >
            <Form
                {...(partner ? update.form(partner.id) : store.form())}
                encType="multipart/form-data"
                className="max-w-2xl space-y-6"
            >
                {({ errors, processing }) => (
                    <>
                        <Field id="name" label="Nom" error={errors.name}>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={partner?.name}
                                required
                                maxLength={120}
                            />
                        </Field>

                        <ImageField
                            name="logo"
                            label="Logo"
                            currentUrl={partner?.logo_url}
                            required
                            contain
                            error={errors.logo}
                        />

                        <Field
                            id="website_url"
                            label="Site web (optionnel)"
                            error={errors.website_url}
                        >
                            <Input
                                id="website_url"
                                name="website_url"
                                type="url"
                                placeholder="https://"
                                defaultValue={partner?.website_url ?? ''}
                                maxLength={255}
                            />
                        </Field>

                        <PublishFields
                            position={partner?.position ?? nextPosition}
                            isPublished={partner?.is_published ?? true}
                            errors={errors}
                        />

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

PartnerForm.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Partenaires', href: index() },
        { title: props.partner ? 'Modifier' : 'Ajouter', href: '#' },
    ],
});
