import { router, useForm } from '@inertiajs/react';
import { Copy, Trash2, Upload } from 'lucide-react';
import { useRef } from 'react';
import AdminPage from '@/components/admin/admin-page';
import MediaBrowser from '@/components/admin/media-browser';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { dashboard } from '@/routes/admin';
import { destroy, index, store } from '@/routes/admin/media';
import type { MediaItem } from '@/types/admin';
import { optimizeImage } from '@/lib/optimize-image';

function UploadButton() {
    const input = useRef<HTMLInputElement>(null);
    const form = useForm<{ files: File[] }>({ files: [] });

    const errors = Object.values(form.errors as Record<string, string>);

    return (
        <div className="grid justify-items-end gap-1">
            <input
                ref={input}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                multiple
                hidden
                onChange={async (e) => {
                    const target = e.currentTarget;
                    const selected = Array.from(target.files ?? []);

                    if (selected.length === 0) {
                        return;
                    }

                    const files = await Promise.all(selected.map(optimizeImage));
                    form.transform(() => ({ files }));
                    const uploadUrl = new URL(store.url(), window.location.origin);
                    if (import.meta.env.PROD) {
                        uploadUrl.protocol = 'https:';
                    }

                    form.post(uploadUrl.href, {
                        preserveScroll: true,
                        forceFormData: true,
                        onFinish: () => {
                            if (target) {
                                target.value = '';
                            }
                        },
                    });
                }}
            />
            <Button
                type="button"
                onClick={() => input.current?.click()}
                disabled={form.processing}
            >
                {form.processing ? <Spinner /> : <Upload className="size-4" />}
                Ajouter des images
            </Button>
            {errors.length > 0 && <InputError message={errors[0]} />}
        </div>
    );
}

function ItemActions({ item }: { item: MediaItem }) {
    const copy = () => {
        const url = new URL(item.url, window.location.origin).toString();
        navigator.clipboard?.writeText(url).catch(() => {});
    };

    const remove = () => {
        if (!window.confirm(`Supprimer définitivement « ${item.name} » ?`)) {
            return;
        }

        router.delete(destroy.url(), {
            data: { path: item.path },
            preserveScroll: true,
        });
    };

    return (
        <div className="mt-1 flex gap-1">
            <button
                type="button"
                onClick={copy}
                className="inline-flex cursor-pointer items-center gap-1 text-muted-foreground hover:text-foreground"
                title="Copier le lien de l’image"
            >
                <Copy className="size-3" />
                Lien
            </button>
            {item.source === 'upload' && item.used_by.length === 0 && (
                <button
                    type="button"
                    onClick={remove}
                    className="ml-auto inline-flex cursor-pointer items-center gap-1 text-muted-foreground hover:text-destructive"
                    title="Supprimer l’image"
                >
                    <Trash2 className="size-3" />
                    Supprimer
                </button>
            )}
        </div>
    );
}

export default function Media({ items }: { items: MediaItem[] }) {
    return (
        <AdminPage
            title="Médiathèque"
            description="Toutes les images du serveur. Elles se choisissent depuis chaque champ image (bouton « Médiathèque »). Seules les images envoyées et non utilisées peuvent être supprimées ; une image dont le poids est en couleur dépasse 1 Mo et ralentit le site."
        >
            <div className="mb-6 flex justify-end">
                <UploadButton />
            </div>
            <MediaBrowser
                items={items}
                actions={(item) => <ItemActions item={item} />}
            />
        </AdminPage>
    );
}

Media.layout = {
    breadcrumbs: [
        { title: 'Administration', href: dashboard() },
        { title: 'Médiathèque', href: index() },
    ],
};
