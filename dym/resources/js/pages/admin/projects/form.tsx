import { Form } from '@inertiajs/react';
import AdminPage from '@/components/admin/admin-page';
import Field from '@/components/admin/field';
import { FormActions, PublishFields } from '@/components/admin/form-parts';
import ImageField from '@/components/admin/image-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/admin';
import { index, store, update } from '@/routes/admin/projects';
import type { Project } from '@/types/admin';

type Props = {
    project: Project | null;
    nextPosition?: number;
};

const categories = [
    'Chaudronnerie',
    'Usinage',
    'Menuiserie métallique',
    'Art & décoration',
    'Habillage de façade',
    'Mobilier découpé',
];

export default function ProjectForm({ project, nextPosition = 1 }: Props) {
    return (
        <AdminPage
            title={
                project
                    ? `Modifier « ${project.title} »`
                    : 'Nouvelle réalisation'
            }
        >
            <Form
                {...(project ? update.form(project.id) : store.form())}
                encType="multipart/form-data"
                className="max-w-2xl space-y-6"
            >
                {({ errors, processing }) => (
                    <>
                        <Field id="title" label="Titre" error={errors.title}>
                            <Input
                                id="title"
                                name="title"
                                defaultValue={project?.title}
                                required
                                maxLength={120}
                            />
                        </Field>

                        <Field
                            id="category"
                            label="Catégorie"
                            error={errors.category}
                        >
                            <Input
                                id="category"
                                name="category"
                                list="project-categories"
                                defaultValue={project?.category}
                                required
                                maxLength={80}
                            />
                            <datalist id="project-categories">
                                {categories.map((c) => (
                                    <option key={c} value={c} />
                                ))}
                            </datalist>
                        </Field>

                        <Field
                            id="description"
                            label="Description (optionnelle)"
                            hint="Note interne, non affichée pour l’instant sur la page d’accueil."
                            error={errors.description}
                        >
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={project?.description ?? ''}
                                maxLength={2000}
                                rows={3}
                            />
                        </Field>

                        <ImageField
                            name="image"
                            label="Photo"
                            currentUrl={project?.image_url}
                            required
                            error={errors.image ?? errors.image_media}
                        />

                        <PublishFields
                            position={project?.position ?? nextPosition}
                            isPublished={project?.is_published ?? true}
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

ProjectForm.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Réalisations', href: index() },
        { title: props.project ? 'Modifier' : 'Ajouter', href: '#' },
    ],
});
