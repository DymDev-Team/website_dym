import { router } from '@inertiajs/react';
import { CheckCircle2, FileUp, Loader2, Upload, XCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { postJson, runNextAnalysis } from '@/components/admin/recruitment';
import type { NextAnalysis } from '@/components/admin/recruitment';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { store } from '@/routes/admin/applications';
import type { Labelled } from '@/types/admin';

type Props = {
    offers: { id: number; title: string }[];
    sources: Labelled[];
    defaultOffer?: string;
};

type Item = {
    file: File;
    state: 'waiting' | 'uploading' | 'done' | 'error';
    error?: string;
};

const NONE = 'none';
const ACCEPT = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp';
const MAX_BYTES = 10 * 1024 * 1024;

export default function CvUploadDialog({
    offers,
    sources,
    defaultOffer,
}: Props) {
    const input = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Item[]>([]);
    const [offer, setOffer] = useState(
        defaultOffer && /^\d+$/.test(defaultOffer) ? defaultOffer : NONE,
    );
    const [source, setSource] = useState(
        String(sources.find((s) => s.label === 'Ajout manuel')?.id ?? NONE),
    );
    const [phase, setPhase] = useState<
        'select' | 'uploading' | 'analyzing' | 'done'
    >('select');
    const [progress, setProgress] = useState({ done: 0, total: 0 });
    const [notice, setNotice] = useState<string | null>(null);

    const busy = phase === 'uploading' || phase === 'analyzing';

    const addFiles = (files: FileList | null) => {
        if (!files) {
            return;
        }

        setItems((current) => [
            ...current,
            ...Array.from(files).map((file): Item =>
                file.size > MAX_BYTES
                    ? { file, state: 'error', error: 'Plus de 10 Mo' }
                    : { file, state: 'waiting' },
            ),
        ]);
    };

    const update = (index: number, patch: Partial<Item>) =>
        setItems((current) =>
            current.map((item, i) =>
                i === index ? { ...item, ...patch } : item,
            ),
        );

    const reset = () => {
        setItems([]);
        setPhase('select');
        setProgress({ done: 0, total: 0 });
        setNotice(null);
    };

    // Envoi des fichiers un par un, puis analyses une par une : chaque
    // requête reste courte, sans tâche de fond côté serveur.
    const start = async () => {
        setPhase('uploading');
        let uploaded = 0;

        for (const [index, item] of items.entries()) {
            if (item.state !== 'waiting') {
                continue;
            }

            update(index, { state: 'uploading' });
            const body = new FormData();
            body.append('cv', item.file);

            if (offer !== NONE) {
                body.append('job_offer_id', offer);
            }

            if (source !== NONE) {
                body.append('source_id', source);
            }

            try {
                await postJson(store.url(), body);
                update(index, { state: 'done' });
                uploaded++;
            } catch (error) {
                update(index, {
                    state: 'error',
                    error: (error as Error).message,
                });
            }
        }

        if (uploaded > 0) {
            await analyze();
        }

        setPhase('done');
        router.reload();
    };

    const analyze = async () => {
        setPhase('analyzing');
        let done = 0;

        for (;;) {
            let result: NextAnalysis;

            try {
                result = await runNextAnalysis();
            } catch {
                setNotice(
                    'L’analyse a été interrompue. Elle reprendra à l’ouverture du pipeline.',
                );

                return;
            }

            if (result.blocked) {
                setNotice(`Analyse impossible : ${result.blocked}`);

                return;
            }

            if (result.processed === null) {
                return;
            }

            done++;
            setProgress({ done, total: done + result.remaining });

            if (result.remaining === 0) {
                return;
            }
        }
    };

    const onDrop = (event: DragEvent) => {
        event.preventDefault();

        if (!busy) {
            addFiles(event.dataTransfer.files);
        }
    };

    const waiting = items.filter((i) => i.state === 'waiting').length;

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (busy) {
                    return;
                }

                setOpen(value);

                if (!value) {
                    reset();
                }
            }}
        >
            <DialogTrigger asChild>
                <Button>
                    <Upload />
                    Ajouter des CV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Ajouter des CV</DialogTitle>
                    <DialogDescription>
                        Chaque CV crée une fiche candidat. L’IA lit le CV,
                        remplit les coordonnées, classe le profil et le note
                        pour le poste choisi.
                    </DialogDescription>
                </DialogHeader>

                {phase === 'select' && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label>Poste visé</Label>
                            <Select value={offer} onValueChange={setOffer}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NONE}>
                                        Aucun (base de CV)
                                    </SelectItem>
                                    {offers.map((o) => (
                                        <SelectItem
                                            key={o.id}
                                            value={String(o.id)}
                                        >
                                            {o.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Source</Label>
                            <Select value={source} onValueChange={setSource}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NONE}>
                                        Non précisée
                                    </SelectItem>
                                    {sources.map((s) => (
                                        <SelectItem
                                            key={s.id}
                                            value={String(s.id)}
                                        >
                                            {s.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {phase === 'select' && (
                    <button
                        type="button"
                        onClick={() => input.current?.click()}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={onDrop}
                        className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:bg-muted/40"
                    >
                        <FileUp className="size-6" />
                        Glissez les CV ici ou cliquez pour les choisir
                        <span className="text-xs">
                            PDF, Word, JPG, PNG · 10 Mo maximum par fichier
                        </span>
                    </button>
                )}
                <input
                    ref={input}
                    type="file"
                    multiple
                    accept={ACCEPT}
                    className="hidden"
                    onChange={(event) => {
                        addFiles(event.target.files);
                        event.target.value = '';
                    }}
                />

                {items.length > 0 && (
                    <ul className="max-h-56 divide-y overflow-y-auto rounded-lg border text-sm">
                        {items.map((item, index) => (
                            <li
                                key={`${item.file.name}-${index}`}
                                className="flex items-center gap-3 px-3 py-2"
                            >
                                {item.state === 'uploading' && (
                                    <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                                )}
                                {item.state === 'done' && (
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                                )}
                                {item.state === 'error' && (
                                    <XCircle className="size-4 shrink-0 text-destructive" />
                                )}
                                {item.state === 'waiting' && (
                                    <FileUp className="size-4 shrink-0 text-muted-foreground" />
                                )}
                                <span className="min-w-0 flex-1 truncate">
                                    {item.file.name}
                                </span>
                                {item.error && (
                                    <span className="shrink-0 text-xs text-destructive">
                                        {item.error}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                {phase === 'analyzing' && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                                <Loader2 className="size-4 animate-spin" />
                                Analyse des CV par l’IA…
                            </span>
                            {progress.total > 0 && (
                                <span className="text-muted-foreground tabular-nums">
                                    {progress.done} / {progress.total}
                                </span>
                            )}
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full bg-primary transition-all"
                                style={{
                                    width: `${progress.total ? (progress.done / progress.total) * 100 : 5}%`,
                                }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Gardez cette fenêtre ouverte. Si vous la fermez,
                            l’analyse reprendra à votre prochaine visite.
                        </p>
                    </div>
                )}

                {notice && (
                    <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                        {notice}
                    </p>
                )}

                <DialogFooter>
                    {phase === 'done' ? (
                        <Button
                            onClick={() => {
                                setOpen(false);
                                reset();
                            }}
                        >
                            Terminer
                        </Button>
                    ) : (
                        <Button
                            onClick={start}
                            disabled={busy || waiting === 0}
                        >
                            {busy && <Loader2 className="animate-spin" />}
                            {phase === 'select'
                                ? `Ajouter ${waiting || ''} CV`
                                : 'Traitement…'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
