import { Form } from '@inertiajs/react';
import AdminPage from '@/components/admin/admin-page';
import Field from '@/components/admin/field';
import { FormActions, PublishFields } from '@/components/admin/form-parts';
import ImageField from '@/components/admin/image-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/admin';
import { index, store, update } from '@/routes/admin/equipment';
import type { Equipment } from '@/types/admin';

type Props = {
    equipment: Equipment | null;
    nextPosition?: number;
};

export default function EquipmentForm({ equipment, nextPosition = 1 }: Props) {
    return (
        <AdminPage
            title={
                equipment
                    ? `Modifier « ${equipment.name} »`
                    : 'Nouvel équipement'
            }
        >
            <Form
                {...(equipment ? update.form(equipment.id) : store.form())}
                encType="multipart/form-data"
                className="max-w-2xl space-y-6"
            >
                {({ errors, processing }) => (
                    <>
                        <Field id="name" label="Nom" error={errors.name}>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={equipment?.name}
                                required
                                maxLength={120}
                            />
                        </Field>

                        <Field
                            id="description"
                            label="Description"
                            error={errors.description}
                        >
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={equipment?.description}
                                required
                                maxLength={500}
                                rows={3}
                            />
                        </Field>

                        <ImageField
                            name="image"
                            label="Photo"
                            currentUrl={equipment?.image_url}
                            required
                            error={errors.image ?? errors.image_media}
                        />

                        <PublishFields
                            position={equipment?.position ?? nextPosition}
                            isPublished={equipment?.is_published ?? true}
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

EquipmentForm.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Équipements', href: index() },
        { title: props.equipment ? 'Modifier' : 'Ajouter', href: '#' },
    ],
});
