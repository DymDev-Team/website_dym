import { Link, router } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import AdminPage from '@/components/admin/admin-page';
import ApplicationStatusBadge from '@/components/admin/application-status';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes/admin';
import { index, show } from '@/routes/admin/applications';
import type {
    JobApplication,
    JobOffer,
    Paginated,
    StatusOption,
} from '@/types/admin';

type Props = {
    applications: Paginated<JobApplication>;
    offers: Pick<JobOffer, 'id' | 'title'>[];
    statuses: StatusOption[];
    filters: { status: string; offer: string };
};

const ALL = 'all';

const dateFormat = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

export default function ApplicationsIndex({
    applications,
    offers,
    statuses,
    filters,
}: Props) {
    const filter = (key: 'status' | 'offer', value: string) => {
        router.get(
            index.url(),
            { ...filters, [key]: value === ALL ? '' : value },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AdminPage
            title="Candidatures"
            description="Candidatures reçues depuis la page Carrière. Ouvrir une nouvelle candidature la passe « En cours d’étude »."
        >
            <div className="flex flex-wrap gap-3">
                <Select
                    value={filters.status || ALL}
                    onValueChange={(v) => filter('status', v)}
                >
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

                <Select
                    value={filters.offer || ALL}
                    onValueChange={(v) => filter('offer', v)}
                >
                    <SelectTrigger
                        className="w-72"
                        aria-label="Filtrer par offre"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>Toutes les offres</SelectItem>
                        <SelectItem value="spontaneous">
                            Candidatures spontanées
                        </SelectItem>
                        {offers.map((o) => (
                            <SelectItem key={o.id} value={String(o.id)}>
                                {o.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {applications.data.length === 0 ? (
                <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                    Aucune candidature pour ces critères.
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border">
                    <ul className="divide-y">
                        {applications.data.map((a) => (
                            <li key={a.id}>
                                <Link
                                    href={show(a.id)}
                                    className="flex flex-wrap items-center gap-4 p-3 hover:bg-muted/40 sm:px-4"
                                >
                                    <div className="grid size-10 shrink-0 place-items-center rounded-md bg-muted">
                                        <FileText className="size-4 text-muted-foreground" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className={`truncate ${a.status === 'new' ? 'font-semibold' : 'font-medium'}`}
                                        >
                                            {a.name}
                                        </p>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {a.job_offer?.title ??
                                                'Candidature spontanée'}{' '}
                                            ·{' '}
                                            {dateFormat.format(
                                                new Date(a.created_at),
                                            )}
                                        </p>
                                    </div>
                                    <ApplicationStatusBadge
                                        status={a.status}
                                        statuses={statuses}
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {applications.last_page > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Page {applications.current_page} sur{' '}
                        {applications.last_page} · {applications.total}{' '}
                        candidatures
                    </span>
                    <div className="flex gap-2">
                        {applications.prev_page_url && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={applications.prev_page_url}>
                                    Précédent
                                </Link>
                            </Button>
                        )}
                        {applications.next_page_url && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={applications.next_page_url}>
                                    Suivant
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </AdminPage>
    );
}

ApplicationsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Candidatures', href: index() },
    ],
};
