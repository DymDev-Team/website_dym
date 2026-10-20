import { useForm } from '@inertiajs/react';
import { RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AdminPage from '@/components/admin/admin-page';
import MediaPicker from '@/components/admin/media-picker';
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
    type: 'text' | 'image';
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

type TextsForm = {
    values: Record<string, string>;
    images: Record<string, File>;
    // Image choisie dans la médiathèque, par clé de champ.
    media: Record<string, { path: string; url: string }>;
    resets: string[];
};

// Photo remplaçable : aperçu, envoi d'un fichier, retour à la photo d'origine.
function ImageTextField({
    field,
    file,
    picked,
    reset,
    error,
    onFile,
    onPick,
    onReset,
}: {
    field: TextField;
    file: File | undefined;
    picked: { path: string; url: string } | undefined;
    reset: boolean;
    error?: string;
    onFile: (file: File | null) => void;
    onPick: (media: { path: string; url: string }) => void;
    onReset: () => void;
}) {
    const preview = useMemo(
        () => (file ? URL.createObjectURL(file) : null),
        [file],
    );

    useEffect(
        () => () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        },
        [preview],
    );

    const src = preview ?? picked?.url ?? (reset ? field.default : field.value);
    const changed = src !== field.default;

    return (
        <div className="grid gap-2">
            <div className="flex items-center gap-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                {changed && (
                    <>
                        <span
                            className="size-1.5 bg-dym"
                            title="Photo modifiée"
                        />
                        <button
                            type="button"
                            onClick={onReset}
                            className="ml-auto inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-dym"
                        >
                            <RotateCcw className="size-3" />
                            Photo d’origine
                        </button>
                    </>
                )}
            </div>
            <div className="flex flex-wrap items-center gap-4">
                <img
                    src={src}
                    alt=""
                    className="aspect-[3/2] w-40 shrink-0 border bg-muted object-cover"
                />
                <Input
                    key={file ? 'file' : 'empty'}
                    id={field.key}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="max-w-sm"
                    onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                />
                <MediaPicker
                    selected={picked?.path}
                    onSelect={(item) =>
                        onPick({ path: item.path, url: item.url })
                    }
                />
            </div>
            <p className="text-xs text-muted-foreground">
                JPG, PNG ou WebP, 5 Mo max. Format paysage conseillé (3:2).
            </p>
            <InputError message={error} />
        </div>
    );
}

function PageForm({ page }: { page: TextPage }) {
    const fields = fieldsOf(page);
    const textFields = fields.filter((f) => f.type !== 'image');
    const imageFields = fields.filter((f) => f.type === 'image');
    const form = useForm<TextsForm>({
        values: Object.fromEntries(textFields.map((f) => [f.key, f.value])),
        images: {},
        media: {},
        resets: [],
    });

    const set = (key: string, value: string) =>
        form.setData('values', { ...form.data.values, [key]: value });

    // Ordre d'envoi des photos, pour relier les erreurs « images.N.file ».
    const sentImages = imageFields
        .map((f) => f.key)
        .filter((key) => form.data.images[key]);

    const setImage = (key: string, file: File | null) => {
        const images = { ...form.data.images };

        if (file) {
            images[key] = file;
        } else {
            delete images[key];
        }

        const media = { ...form.data.media };
        delete media[key];

        form.setData((data) => ({
            ...data,
            images,
            media,
            resets: data.resets.filter((k) => k !== key),
        }));
    };

    const pickImage = (key: string, picked: { path: string; url: string }) => {
        const images = { ...form.data.images };
        delete images[key];

        form.setData((data) => ({
            ...data,
            images,
            media: { ...data.media, [key]: picked },
            resets: data.resets.filter((k) => k !== key),
        }));
    };

    const resetImage = (field: TextField) => {
        const images = { ...form.data.images };
        delete images[field.key];
        const media = { ...form.data.media };
        delete media[field.key];

        form.setData((data) => ({
            ...data,
            images,
            media,
            // Seule une photo déjà envoyée doit être supprimée côté serveur.
            resets:
                field.value !== field.default
                    ? [...new Set([...data.resets, field.key])]
                    : data.resets,
        }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform((data) => ({
            // Fichiers : POST + _method, car PUT ne transporte pas le multipart.
            _method: 'put',
            texts: textFields.map((f) => ({
                key: f.key,
                value: data.values[f.key],
            })),
            images: sentImages.map((key) => ({
                key,
                file: data.images[key],
            })),
            media: Object.entries(data.media).map(([key, m]) => ({
                key,
                path: m.path,
            })),
            reset_images: data.resets,
        }));
        form.post(update.url(), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                form.setDefaults({
                    ...form.data,
                    images: {},
                    media: {},
                    resets: [],
                });
                form.reset('images', 'media', 'resets');
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Raccourcis : une page comme l'accueil compte une dizaine de sections. */}
            {page.sections.length > 1 && (
                <nav
                    aria-label="Sections de la page"
                    className="flex flex-wrap gap-2"
                >
                    {page.sections.map((section) => (
                        <a
                            key={section.key}
                            href={`#section-${page.key}-${section.key}`}
                            className="border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-dym hover:text-foreground"
                        >
                            {section.label}
                        </a>
                    ))}
                </nav>
            )}

            {page.sections.map((section) => (
                <section
                    key={section.key}
                    id={`section-${page.key}-${section.key}`}
                    className="scroll-mt-4 border bg-card"
                >
                    <h2 className="hx-mono border-b px-5 py-3 text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                        {section.label}
                    </h2>
                    <div className="grid gap-5 p-5">
                        {section.fields.map((field) => {
                            const errors = form.errors as Record<
                                string,
                                string
                            >;

                            if (field.type === 'image') {
                                const index = sentImages.indexOf(field.key);

                                return (
                                    <ImageTextField
                                        key={field.key}
                                        field={field}
                                        file={form.data.images[field.key]}
                                        picked={form.data.media[field.key]}
                                        reset={form.data.resets.includes(
                                            field.key,
                                        )}
                                        error={
                                            index >= 0
                                                ? errors[`images.${index}.file`]
                                                : undefined
                                        }
                                        onFile={(file) =>
                                            setImage(field.key, file)
                                        }
                                        onPick={(m) => pickImage(field.key, m)}
                                        onReset={() => resetImage(field)}
                                    />
                                );
                            }

                            const value = form.data.values[field.key] ?? '';
                            const changed = value.trim() !== field.default;
                            const error =
                                errors[
                                    `texts.${textFields.indexOf(field)}.value`
                                ];
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
            description="Titres, paragraphes, boutons et photos des pages publiques. Un champ vidé reprend son texte d’origine. Sur les titres, chaque ligne s’affiche sur une nouvelle ligne ; un point final s’affiche dans la couleur DYM."
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
