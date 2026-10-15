import { Link, router } from '@inertiajs/react';
import { Calculator, Paperclip } from 'lucide-react';
import AdminPage from '@/components/admin/admin-page';
import QuoteStatusBadge from '@/components/admin/quote-status';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes/admin';
import { index, show } from '@/routes/admin/quotes';
import type {
    Paginated,
    QuoteRequest,
    QuoteStatusOption,
} from '@/types/admin';

type Props = {
    quotes: Paginated<QuoteRequest>;
    statuses: QuoteStatusOption[];
    filters: { status: string };
};

const ALL = 'all';

const dateFormat = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

export default function QuotesIndex({ quotes, statuses, filters }: Props) {
    const filter = (value: string) => {
        router.get(
            index.url(),
            { status: value === ALL ? '' : value },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AdminPage
            title="Demandes de devis"
            description="Demandes reçues depuis la page Devis du site. Ouvrir une nouvelle demande la passe « En cours d’étude »."
        >
            <div className="flex flex-wrap gap-3">
                <Select value={filters.status || ALL} onValueChange={filter}>
                    <SelectTrigger
                        className="w-52"
                        aria-label="Filtrer par statut"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>Tous les statuts</SelectItem>
                        {statuses.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                                {s.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {quotes.data.length === 0 ? (
                <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                    Aucune demande de devis pour ces critères.
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border">
                    <ul className="divide-y">
                        {quotes.data.map((q) => (
                            <li key={q.id}>
                                <Link
                                    href={show(q.id)}
                                    className="flex flex-wrap items-center gap-4 p-3 hover:bg-muted/40 sm:px-4"
                                >
                                    <div className="grid size-10 shrink-0 place-items-center rounded-md bg-muted">
                                        <Calculator className="size-4 text-muted-foreground" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className={`flex items-center gap-2 truncate ${q.status === 'new' ? 'font-semibold' : 'font-medium'}`}
                                        >
                                            {q.name}
                                            {q.company && (
                                                <span className="font-normal text-muted-foreground">
                                                    · {q.company}
                                                </span>
                                            )}
                                            {q.attachment_name && (
                                                <Paperclip
                                                    className="size-3.5 text-muted-foreground"
                                                    aria-label="Pièce jointe"
                                                />
                                            )}
                                        </p>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {q.activity ?? 'Activité non précisée'}{' '}
                                            ·{' '}
                                            {dateFormat.format(
                                                new Date(q.created_at),
                                            )}
                                        </p>
                                    </div>
                                    <QuoteStatusBadge
                                        status={q.status}
                                        statuses={statuses}
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {quotes.last_page > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Page {quotes.current_page} sur {quotes.last_page} ·{' '}
                        {quotes.total} demandes
                    </span>
                    <div className="flex gap-2">
                        {quotes.prev_page_url && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={quotes.prev_page_url}>
                                    Précédent
                                </Link>
                            </Button>
                        )}
                        {quotes.next_page_url && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={quotes.next_page_url}>Suivant</Link>
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </AdminPage>
    );
}

QuotesIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Demandes de devis', href: index() },
    ],
};
