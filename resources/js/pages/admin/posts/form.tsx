import { Form } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import AdminPage from '@/components/admin/admin-page';
import Field from '@/components/admin/field';
import { FormActions } from '@/components/admin/form-parts';
import ImageField from '@/components/admin/image-field';
import { postStatus } from '@/components/admin/post-status';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { show } from '@/routes/posts';
import { dashboard } from '@/routes/admin';
import { index, store, update } from '@/routes/admin/posts';
import type { Post } from '@/types/admin';

type Props = {
    post: Post | null;
    categories: string[];
};

const defaultCategories = [
    'Chantier',
    'Événement',
    'Réalisation',
    'Entreprise',
];

// Valeur attendue par <input type="datetime-local"> (heure locale, sans secondes).
const toLocalInput = (value: string | Date) => {
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60_000;

    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export default function PostForm({ post, categories }: Props) {
    const suggestions = [...new Set([...defaultCategories, ...categories])];
    const isLive = post ? postStatus(post).visible : false;

    return (
        <AdminPage
            title={post ? 'Modifier l’actualité' : 'Nouvelle actualité'}
            actions={
                post &&
                isLive && (
                    <Button variant="outline" asChild>
                        <a
                            href={show(post.slug).url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <ExternalLink />
                            Voir sur le site
                        </a>
                    </Button>
                )
            }
        >
            <Form
                {...(post ? update.form(post.slug) : store.form())}
                encType="multipart/form-data"
                className="max-w-3xl space-y-6"
            >
                {({ errors, processing }) => (
                    <>
                        <Field id="title" label="Titre" error={errors.title}>
                            <Input
                                id="title"
                                name="title"
                                defaultValue={post?.title}
                                required
                                maxLength={160}
                            />
                        </Field>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <Field
                                id="category"
                                label="Catégorie"
                                error={errors.category}
                            >
                                <Input
                                    id="category"
                                    name="category"
                                    list="post-categories"
                                    defaultValue={post?.category}
                                    required
                                    maxLength={60}
                                />
                                <datalist id="post-categories">
                                    {suggestions.map((c) => (
                                        <option key={c} value={c} />
                                    ))}
                                </datalist>
                            </Field>

                            <Field
                                id="slug"
                                label="Adresse de la page"
                                hint="Laissez vide pour la générer depuis le titre."
                                error={errors.slug}
                            >
                                <Input
                                    id="slug"
                                    name="slug"
                                    defaultValue={post?.slug}
                                    maxLength={180}
                                    placeholder="titre-de-l-actualite"
                                />
                            </Field>
                        </div>

                        <ImageField
                            name="image"
                            label="Image principale"
                            currentUrl={post?.image_url}
                            required
                            error={errors.image}
                        />

                        <Field
                            id="excerpt"
                            label="Résumé"
                            hint="Une ou deux phrases affichées en introduction."
                            error={errors.excerpt}
                        >
                            <Textarea
                                id="excerpt"
                                name="excerpt"
                                defaultValue={post?.excerpt ?? ''}
                                maxLength={500}
                                rows={2}
                            />
                        </Field>

                        <Field
                            id="body"
                            label="Contenu"
                            hint="Séparez les paragraphes par une ligne vide."
                            error={errors.body}
                        >
                            <Textarea
                                id="body"
                                name="body"
                                defaultValue={post?.body ?? ''}
                                rows={12}
                            />
                        </Field>

                        <Field
                            id="published_at"
                            label="Date de publication"
                            hint="Vide = brouillon. Une date future programme la publication."
                            error={errors.published_at}
                        >
                            <Input
                                id="published_at"
                                name="published_at"
                                type="datetime-local"
                                className="max-w-xs"
                                defaultValue={
                                    post
                                        ? post.published_at
                                            ? toLocalInput(post.published_at)
                                            : ''
                                        : toLocalInput(new Date())
                                }
                            />
                        </Field>

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

PostForm.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Actualités', href: index() },
        { title: props.post ? 'Modifier' : 'Rédiger', href: '#' },
    ],
});
