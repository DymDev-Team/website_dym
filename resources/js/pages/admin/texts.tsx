import { useForm } from '@inertiajs/react';
import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import AdminPage from '@/components/admin/admin-page';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/admin';
import { edit, update } from '@/routes/admin/texts';

type TextField = {
    key: string;
    label: string;
    help: string | null;
    multiline: boolean;
    default: string;
    value: string;
};

type TextPage = {
    key: string;
    label: string;
    sections: { key: string; label: string; fields: TextField[] }[];
};

const fieldsOf = (page: TextPage) => page.sections.flatMap((s) => s.fields);

function PageForm({ page }: { page: TextPage }) {
    const fields = fieldsOf(page);
    const form = useForm<{ values: Record<string, string> }>({
        values: Object.fromEntries(fields.map((f) => [f.key, f.value])),
    });

    const set = (key: string, value: string) =>
        form.setData('values', { ...form.data.values, [key]: value });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform((data) => ({
            texts: fields.map((f) => ({
                key: f.key,
                value: data.values[f.key],
            })),
        }));
        form.put(update.url(), {
            preserveScroll: true,
            onSuccess: () => form.setDefaults(),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            {page.sections.map((section) => (
                <section key={section.key} className="border bg-card">
                    <h2 className="hx-mono border-b px-5 py-3 text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                        {section.label}
                    </h2>
                    <div className="grid gap-5 p-5">
                        {section.fields.map((field) => {
                            const value = form.data.values[field.key] ?? '';
                            const changed = value.trim() !== field.default;
                            const error = (
                                form.errors as Record<string, string>
                            )[`texts.${fields.indexOf(field)}.value`];
                            const Control = field.multiline ? Textarea : Input;

                            return (
                                <div key={field.key} className="grid gap-2">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={field.key}>
                                            {field.label}
                                        </Label>
                                        {changed && (
                                            <>
                                                <span
                                                    className="size-1.5 bg-dym"
                                                    title="Texte modifié"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        set(
                                                            field.key,
                                                            field.default,
                                                        )
                                                    }
                                                    className="ml-auto inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-dym"
                                                >
                                                    <RotateCcw className="size-3" />
                                                    Texte d’origine
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    <Control
                                        id={field.key}
                                        value={value}
                                        onChange={(e) =>
                                            set(field.key, e.target.value)
                                        }
                                        maxLength={2000}
                                        rows={
                                            field.multiline
                                                ? Math.min(
                                                      6,
                                                      Math.max(
                                                          2,
                                                          Math.ceil(
                                                              value.length / 90,
                                                          ) +
                                                              value.split('\n')
                                                                  .length -
                                                              1,
                                                      ),
                                                  )
                                                : undefined
                                        }
                                        placeholder={field.default}
                                    />
                                    {field.help && (
                                        <p className="text-xs text-muted-foreground">
                                            {field.help}
                                        </p>
                                    )}
                                    <InputError message={error} />
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}

            <div className="sticky bottom-0 flex items-center gap-3 border-t bg-background/95 py-4 backdrop-blur">
                <Button
                    type="submit"
                    disabled={form.processing || !form.isDirty}
                >
                    {form.processing && <Spinner />}
                    Enregistrer « {page.label} »
                </Button>
                {form.isDirty && (
                    <span className="text-sm text-muted-foreground">
                        Modifications non enregistrées
                    </span>
                )}
            </div>
        </form>
    );
}

export default function Texts({ pages }: { pages: TextPage[] }) {
    const [active, setActive] = useState(pages[0]?.key);
    const page = pages.find((p) => p.key === active) ?? pages[0];

    return (
        <AdminPage
            title="Textes du site"
            description="Titres, paragraphes et boutons des pages publiques. Un champ vidé reprend son texte d’origine. Sur les titres, chaque ligne s’affiche sur une nouvelle ligne ; un point final s’affiche en orange."
        >
            <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                <nav className="flex gap-1 overflow-x-auto lg:sticky lg:top-4 lg:flex-col">
                    {pages.map((p) => {
                        const count = fieldsOf(p).filter(
                            (f) => f.value !== f.default,
                        ).length;

                        return (
                            <button
                                key={p.key}
                                type="button"
                                onClick={() => setActive(p.key)}
                                className={`flex shrink-0 cursor-pointer items-center justify-between gap-3 border-l-2 px-3 py-2 text-left text-sm transition-colors ${
                                    p.key === page.key
                                        ? 'border-dym bg-card font-medium'
                                        : 'border-transparent text-muted-foreground hover:bg-card hover:text-foreground'
                                }`}
                            >
                                {p.label}
                                {count > 0 && (
                                    <span className="text-xs text-dym">
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {page && <PageForm key={page.key} page={page} />}
            </div>
        </AdminPage>
    );
}

Texts.layout = {
    breadcrumbs: [
        { title: 'Administration', href: dashboard() },
        { title: 'Textes du site', href: edit() },
    ],
};
