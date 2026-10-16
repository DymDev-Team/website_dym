import { Form } from '@inertiajs/react';
import { useState } from 'react';
import AdminPage from '@/components/admin/admin-page';
import Field from '@/components/admin/field';
import { FormActions } from '@/components/admin/form-parts';
import { LegalContent } from '@/components/site/legal-content';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/admin';
import { index, update } from '@/routes/admin/legal-pages';

type Props = {
    page: { slug: string; title: string; body: string };
};

const placeholders = ['email', 'phone', 'address'];

export default function LegalPageForm({ page }: Props) {
    const [body, setBody] = useState(page.body);

    return (
        <AdminPage title={`Modifier « ${page.title} »`}>
            <div className="grid gap-8 xl:grid-cols-2">
                <Form {...update.form(page.slug)} className="space-y-6">
                    {({ errors, processing }) => (
                        <>
                            <Field
                                id="title"
                                label="Titre"
                                error={errors.title}
                            >
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={page.title}
                                    required
                                    maxLength={160}
                                />
                            </Field>

                            <Field
                                id="body"
                                label="Contenu"
                                error={errors.body}
                            >
                                <Textarea
                                    id="body"
                                    name="body"
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    required
                                    rows={28}
                                    className="font-mono text-xs leading-relaxed"
                                />
                            </Field>

                            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                                <p className="font-medium text-foreground">
                                    Mise en forme
                                </p>
                                <ul className="mt-2 list-disc space-y-1 pl-5">
                                    <li>
                                        <code>## Titre</code> pour un titre de
                                        section
                                    </li>
                                    <li>
                                        <code>- élément</code> pour une liste
                                    </li>
                                    <li>
                                        Une ligne vide sépare deux paragraphes
                                    </li>
                                    <li>
                                        {placeholders.map((p, i) => (
                                            <span key={p}>
                                                {i > 0 && ', '}
                                                <code>{`{{${p}}}`}</code>
                                            </span>
                                        ))}{' '}
                                        sont remplacés par les coordonnées de
                                        Admin › Paramètres
                                    </li>
                                </ul>
                            </div>

                            <FormActions
                                processing={processing}
                                cancelHref={index()}
                            />
                        </>
                    )}
                </Form>

                <section
                    aria-label="Aperçu"
                    className="xl:sticky xl:top-4 xl:self-start"
                >
                    <p className="mb-2 text-sm font-medium">Aperçu</p>
                    <div className="max-h-[80vh] overflow-y-auto rounded-xl border bg-[#f5f2ec] p-6 text-[#141414]">
                        <LegalContent body={body} />
                    </div>
                </section>
            </div>
        </AdminPage>
    );
}

LegalPageForm.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Pages légales', href: index() },
        { title: props.page.title, href: '#' },
    ],
});
