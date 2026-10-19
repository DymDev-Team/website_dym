import { Images } from 'lucide-react';
import { useEffect, useState } from 'react';
import MediaBrowser from '@/components/admin/media-browser';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { browse, index } from '@/routes/admin/media';
import type { MediaItem } from '@/types/admin';

type Props = {
    selected?: string | null;
    onSelect: (item: MediaItem) => void;
};

// Bouton « Médiathèque » : choisir une image déjà présente sur le serveur.
export default function MediaPicker({ selected, onSelect }: Props) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<MediaItem[] | null>(null);
    const [error, setError] = useState(false);

    // Liste rechargée à chaque ouverture : une image a pu être ajoutée entre-temps.
    useEffect(() => {
        if (!open) {
            return;
        }

        let cancelled = false;
        setError(false);

        fetch(browse.url(), {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        })
            .then((r) => (r.ok ? r.json() : Promise.reject(r)))
            .then((data: { items: MediaItem[] }) => {
                if (!cancelled) {
                    setItems(data.items);
                }
            })
            .catch(() => !cancelled && setError(true));

        return () => {
            cancelled = true;
        };
    }, [open]);

    return (
        <>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
            >
                <Images className="size-4" />
                Médiathèque
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-5xl">
                    <DialogHeader>
                        <DialogTitle>Choisir une image</DialogTitle>
                        <DialogDescription>
                            Cliquez sur une image pour l’utiliser. Pour en
                            ajouter, utilisez le champ d’envoi ou la{' '}
                            <a
                                href={index.url()}
                                target="_blank"
                                rel="noreferrer"
                                className="underline underline-offset-4 hover:text-dym"
                            >
                                médiathèque
                            </a>
                            .
                        </DialogDescription>
                    </DialogHeader>

                    {error ? (
                        <p className="py-10 text-center text-sm text-destructive">
                            Impossible de charger la médiathèque. Réessayez.
                        </p>
                    ) : items === null ? (
                        <div className="grid place-items-center py-16">
                            <Spinner />
                        </div>
                    ) : (
                        <MediaBrowser
                            items={items}
                            selected={selected}
                            onSelect={(item) => {
                                onSelect(item);
                                setOpen(false);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
