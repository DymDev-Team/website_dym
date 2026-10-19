import { Check, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import type { MediaItem } from '@/types/admin';

const PAGE_SIZE = 60;
// Au-delà, l'image ralentit le site : signalée dans la grille.
const HEAVY_BYTES = 1024 * 1024;

type Filter = 'all' | 'upload' | 'site' | 'unused';

const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'upload', label: 'Envoyées' },
    { key: 'site', label: 'Fournies avec le site' },
    { key: 'unused', label: 'Non utilisées' },
];

export function formatSize(bytes: number): string {
    if (bytes >= 1024 * 1024) {
        return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`;
    }

    return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}

type Props = {
    items: MediaItem[];
    selected?: string | null;
    onSelect?: (item: MediaItem) => void;
    actions?: (item: MediaItem) => ReactNode;
};

// Grille filtrable des images de la médiathèque (page dédiée et sélecteur).
export default function MediaBrowser({
    items,
    selected,
    onSelect,
    actions,
}: Props) {
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<Filter>('all');
    const [folder, setFolder] = useState('');
    const [limit, setLimit] = useState(PAGE_SIZE);

    const folders = useMemo(
        () => [...new Set(items.map((i) => i.folder))].sort(),
        [items],
    );

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();

        return items.filter(
            (i) =>
                (filter === 'all' ||
                    (filter === 'unused'
                        ? i.used_by.length === 0
                        : i.source === filter)) &&
                (folder === '' || i.folder === folder) &&
                (q === '' || `${i.folder}/${i.name}`.toLowerCase().includes(q)),
        );
    }, [items, query, filter, folder]);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-52 flex-1">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setLimit(PAGE_SIZE);
                        }}
                        placeholder="Rechercher un nom de fichier…"
                        className="pl-9"
                    />
                </div>
                <select
                    value={folder}
                    onChange={(e) => {
                        setFolder(e.target.value);
                        setLimit(PAGE_SIZE);
                    }}
                    className="h-9 border bg-background px-3 text-sm"
                    aria-label="Dossier"
                >
                    <option value="">Tous les dossiers</option>
                    {folders.map((f) => (
                        <option key={f} value={f}>
                            {f || '(racine)'}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-wrap gap-1">
                {filters.map((f) => (
                    <button
                        key={f.key}
                        type="button"
                        onClick={() => {
                            setFilter(f.key);
                            setLimit(PAGE_SIZE);
                        }}
                        className={`cursor-pointer border px-3 py-1.5 text-xs transition-colors ${
                            filter === f.key
                                ? 'border-dym bg-card font-medium text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
                <span className="ml-auto self-center text-xs text-muted-foreground">
                    {visible.length} image{visible.length > 1 ? 's' : ''}
                </span>
            </div>

            {visible.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                    Aucune image ne correspond.
                </p>
            ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                    {visible.slice(0, limit).map((item) => {
                        const isSelected = selected === item.path;
                        const Thumb = onSelect ? 'button' : 'div';

                        return (
                            <li
                                key={item.path}
                                className={`group flex flex-col border bg-card ${isSelected ? 'border-dym ring-2 ring-dym/40' : ''}`}
                            >
                                <Thumb
                                    {...(onSelect
                                        ? {
                                              type: 'button' as const,
                                              onClick: () => onSelect(item),
                                              title: `Choisir ${item.name}`,
                                          }
                                        : {})}
                                    className={`relative grid aspect-square place-items-center overflow-hidden bg-muted ${onSelect ? 'cursor-pointer' : ''}`}
                                >
                                    <img
                                        src={item.url}
                                        alt=""
                                        loading="lazy"
                                        decoding="async"
                                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                                    />
                                    {isSelected && (
                                        <span className="absolute top-2 right-2 grid size-6 place-items-center bg-dym text-white">
                                            <Check className="size-4" />
                                        </span>
                                    )}
                                </Thumb>
                                <div className="grid gap-1 p-2 text-xs">
                                    <p
                                        className="truncate font-medium"
                                        title={`${item.folder}/${item.name}`}
                                    >
                                        {item.name}
                                    </p>
                                    <p className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
                                        <span
                                            className={
                                                item.size > HEAVY_BYTES
                                                    ? 'font-medium text-dym'
                                                    : ''
                                            }
                                            title={
                                                item.size > HEAVY_BYTES
                                                    ? 'Image lourde : ralentit le chargement du site'
                                                    : undefined
                                            }
                                        >
                                            {formatSize(item.size)}
                                        </span>
                                        <span
                                            title={
                                                item.used_by.join('\n') ||
                                                undefined
                                            }
                                        >
                                            {item.used_by.length > 0
                                                ? `Utilisée ×${item.used_by.length}`
                                                : 'Non utilisée'}
                                        </span>
                                    </p>
                                    {actions?.(item)}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {visible.length > limit && (
                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => setLimit((l) => l + PAGE_SIZE)}
                        className="cursor-pointer border px-4 py-2 text-sm hover:border-dym"
                    >
                        Afficher plus ({visible.length - limit} restantes)
                    </button>
                </div>
            )}
        </div>
    );
}
