import { Form } from '@inertiajs/react';
import AdminPage from '@/components/admin/admin-page';
import Field from '@/components/admin/field';
import { FormActions, PublishFields } from '@/components/admin/form-parts';
import ImageField from '@/components/admin/image-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/admin';
import { index, store, update } from '@/routes/admin/activities';
import type { Activity } from '@/types/admin';

type Props = {
    activity: Activity | null;
    nextPosition?: number;
};

export default function ActivityForm({ activity, nextPosition = 1 }: Props) {
    return (
        <AdminPage
            title={
                activity
                    ? `Modifier « ${activity.title} »`
                    : 'Nouvelle activité'
            }
        >
            <Form
                {...(activity ? update.form(activity.id) : store.form())}
                encType="multipart/form-data"
                className="max-w-2xl space-y-6"
            >
                {({ errors, processing }) => (
                    <>
                        <Field
                            id="title"
                            label="Titre"
                            hint="Le dernier mot passe à la ligne sur le site (ex. « Chaudronnerie industrielle »)."
                            error={errors.title}
                        >
                            <Input
                                id="title"
                                name="title"
                                defaultValue={activity?.title}
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
                                defaultValue={activity?.description}
                                required
                                maxLength={500}
                                rows={3}
                            />
                        </Field>

                        <Field
                            id="detail_content"
                            label="Contenu de la page détaillée"
                            hint="Présentez cette activité en plusieurs paragraphes. Les retours à la ligne sont conservés."
                            error={errors.detail_content}
                        >
                            <Textarea
                                id="detail_content"
                                name="detail_content"
                                defaultValue={activity?.detail_content ?? ''}
                                maxLength={20000}
                                rows={10}
                            />
                        </Field>

                        <ImageField
                            name="detail_image"
                            label="Image de la page détaillée"
                            currentUrl={activity?.detail_image_url}
                            error={errors.detail_image ?? errors.detail_image_media}
                        />

                        <Field id="detail_image_alt" label="Description de l’image détaillée" error={errors.detail_image_alt}>
                            <Input id="detail_image_alt" name="detail_image_alt" defaultValue={activity?.detail_image_alt ?? ''} maxLength={255} />
                        </Field>

                        <ImageField
                            name="image"
                            label="Photo"
                            currentUrl={activity?.image_url}
                            required
                            error={errors.image ?? errors.image_media}
                        />

                        <Field
                            id="image_alt"
                            label="Description de la photo"
                            hint="Texte lu par les lecteurs d’écran et les moteurs de recherche."
                            error={errors.image_alt}
                        >
                            <Input
                                id="image_alt"
                                name="image_alt"
                                defaultValue={activity?.image_alt ?? ''}
                                maxLength={255}
                            />
                        </Field>

                        <PublishFields
                            position={activity?.position ?? nextPosition}
                            isPublished={activity?.is_published ?? true}
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

ActivityForm.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Activités', href: index() },
        { title: props.activity ? 'Modifier' : 'Ajouter', href: '#' },
    ],
});
