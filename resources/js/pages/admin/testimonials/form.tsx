import { Form } from '@inertiajs/react';
import AdminPage from '@/components/admin/admin-page';
import Field from '@/components/admin/field';
import { FormActions, PublishFields } from '@/components/admin/form-parts';
import ImageField from '@/components/admin/image-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/admin';
import { index, store, update } from '@/routes/admin/testimonials';
import type { Testimonial } from '@/types/admin';

type Props = {
    testimonial: Testimonial | null;
    nextPosition?: number;
};

export default function TestimonialForm({
    testimonial,
    nextPosition = 1,
}: Props) {
    return (
        <AdminPage
            title={
                testimonial
                    ? `Modifier le témoignage de ${testimonial.author}`
                    : 'Nouveau témoignage'
            }
        >
            <Form
                {...(testimonial ? update.form(testimonial.id) : store.form())}
                encType="multipart/form-data"
                className="max-w-2xl space-y-6"
            >
                {({ errors, processing }) => (
                    <>
                        <Field
                            id="quote"
                            label="Témoignage"
                            error={errors.quote}
                        >
                            <Textarea
                                id="quote"
                                name="quote"
                                defaultValue={testimonial?.quote}
                                required
                                maxLength={1000}
                                rows={4}
                            />
                        </Field>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <Field
                                id="author"
                                label="Auteur"
                                hint="Nom ou fonction (ex. « Directeur technique »)."
                                error={errors.author}
                            >
                                <Input
                                    id="author"
                                    name="author"
                                    defaultValue={testimonial?.author}
                                    required
                                    maxLength={120}
                                />
                            </Field>

                            <Field
                                id="role"
                                label="Contexte"
                                hint="Ex. « Villa — Cocody », « Agro-industrie »."
                                error={errors.role}
                            >
                                <Input
                                    id="role"
                                    name="role"
                                    defaultValue={testimonial?.role ?? ''}
                                    maxLength={120}
                                />
                            </Field>
                        </div>

                        <Field
                            id="project"
                            label="Projet concerné"
                            error={errors.project}
                        >
                            <Input
                                id="project"
                                name="project"
                                defaultValue={testimonial?.project ?? ''}
                                maxLength={120}
                            />
                        </Field>

                        <ImageField
                            name="image"
                            label="Photo du projet (optionnelle)"
                            currentUrl={testimonial?.image_url}
                            error={errors.image}
                        />

                        <PublishFields
                            position={testimonial?.position ?? nextPosition}
                            isPublished={testimonial?.is_published ?? true}
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

TestimonialForm.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Témoignages', href: index() },
        { title: props.testimonial ? 'Modifier' : 'Ajouter', href: '#' },
    ],
});
