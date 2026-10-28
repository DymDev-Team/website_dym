import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { ImageIcon, Pencil } from 'lucide-react';
import type { ReactNode } from 'react';
import DeleteButton from '@/components/admin/delete-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { RouteFormDefinition } from '@/wayfinder';

export type ContentRow = {
    id: number;
    title: string;
    subtitle?: ReactNode;
    imageUrl?: string | null;
    position?: number;
    status: { label: string; visible: boolean };
    editHref: NonNullable<InertiaLinkProps['href']>;
    destroyAction: RouteFormDefinition<'post'>;
    // Boutons propres à un type de contenu, avant « Modifier ».
    actions?: ReactNode;
};

type Props = {
    rows: ContentRow[];
    empty: string;
    containImages?: boolean;
    deleteDescription?: string;
};

export default function ContentTable({
    rows,
    empty,
    containImages = false,
    deleteDescription,
}: Props) {
    if (rows.length === 0) {
        return (
            <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                {empty}
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border">
            <ul className="divide-y">
                {rows.map((row) => (
                    <li
                        key={row.id}
                        className="flex items-center gap-4 p-3 sm:px-4"
                    >
                        {row.position !== undefined && (
                            <span className="w-6 shrink-0 text-center font-mono text-xs text-muted-foreground tabular-nums">
                                {row.position}
                            </span>
                        )}

                        {row.imageUrl !== undefined && (
                            <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted">
                                {row.imageUrl ? (
                                    <img
                                        src={row.imageUrl}
                                        alt=""
                                        loading="lazy"
                                        className={`size-full ${containImages ? 'object-contain p-1.5' : 'object-cover'}`}
                                    />
                                ) : (
                                    <ImageIcon className="size-5 text-muted-foreground" />
                                )}
                            </div>
                        )}

                        <div className="min-w-0 flex-1">
                            <Link
                                href={row.editHref}
                                className="block truncate font-medium hover:underline"
                            >
                                {row.title}
                            </Link>
                            {row.subtitle && (
                                <div className="mt-0.5 truncate text-sm text-muted-foreground">
                                    {row.subtitle}
                                </div>
                            )}
                        </div>

                        <Badge
                            variant={
                                row.status.visible ? 'secondary' : 'outline'
                            }
                            className="hidden sm:inline-flex"
                        >
                            {row.status.label}
                        </Badge>

                        <div className="flex shrink-0 items-center">
                            {row.actions}
                            <Button variant="ghost" size="icon" asChild>
                                <Link
                                    href={row.editHref}
                                    aria-label={`Modifier ${row.title}`}
                                >
                                    <Pencil />
                                </Link>
                            </Button>
                            <DeleteButton
                                action={row.destroyAction}
                                label={row.title}
                                description={deleteDescription}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export const publishedStatus = (isPublished: boolean) => ({
    label: isPublished ? 'Publié' : 'Masqué',
    visible: isPublished,
});
