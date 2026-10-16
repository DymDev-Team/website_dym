import { Form } from '@inertiajs/react';
import AdminPage from '@/components/admin/admin-page';
import Field from '@/components/admin/field';
import { FormActions, PublishFields } from '@/components/admin/form-parts';
import ImageField from '@/components/admin/image-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/admin';
import { index, store, update } from '@/routes/admin/brands';
import type { Brand } from '@/types/admin';

type Props = {
    brand: Brand | null;
    nextPosition?: number;
};

export default function BrandForm({ brand, nextPosition = 1 }: Props) {
    return (
        <AdminPage
            title={
                brand ? `Modifier « ${brand.name} »` : 'Nouvelle marque'
            }
        >
            <Form
                {...(brand ? update.form(brand.id) : store.form())}
                encType="multipart/form-data"
                className="max-w-2xl space-y-6"
            >
                {({ errors, processing }) => (
                    <>
                        <Field id="name" label="Nom" error={errors.name}>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={brand?.name}
                                required
                                maxLength={120}
                            />
                        </Field>

                        <ImageField
                            name="logo"
                            label="Logo"
                            currentUrl={brand?.logo_url}
                            required
                            contain
                            error={errors.logo}
                        />

                        <Field
                            id="description"
                            label="Description (optionnelle)"
                            error={errors.description}
                        >
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={brand?.description ?? ''}
                                maxLength={600}
                                rows={4}
                            />
                        </Field>

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
                                defaultValue={brand?.website_url ?? ''}
                                maxLength={255}
                            />
                        </Field>

                        <PublishFields
                            position={brand?.position ?? nextPosition}
                            isPublished={brand?.is_published ?? true}
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

BrandForm.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Marques', href: index() },
        { title: props.brand ? 'Modifier' : 'Ajouter', href: '#' },
    ],
});
