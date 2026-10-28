import { Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import AdminPage from '@/components/admin/admin-page';
import { ScoreBadge, StageDot } from '@/components/admin/recruitment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes/admin';
import { index as pipeline, show } from '@/routes/admin/applications';
import { index } from '@/routes/admin/candidates';
import type { CandidateRow, Labelled, Option, Paginated } from '@/types/admin';

type Filters = { search: string; job_family: string; seniority: string };

type Props = {
    candidates: Paginated<CandidateRow>;
    jobFamilies: Labelled[];
    seniorities: Option[];
    filters: Filters;
};

const ALL = 'all';

export default function CandidatesIndex({
    candidates,
    jobFamilies,
    seniorities,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search);

    const filter = (patch: Partial<Filters>) => {
        router.get(
            index.url(),
            { ...filters, ...patch },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AdminPage
            title="Base de CV"
            description="Tous les candidats, classés par l’IA. Recherchez par nom, compétence ou mot du résumé."
        >
            <div className="flex flex-wrap gap-3">
                <form
                    onSubmit={(event: FormEvent) => {
                        event.preventDefault();
                        filter({ search });
                    }}
                    className="relative w-full sm:w-80"
                >
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Soudure TIG, AutoCAD, Koné…"
                        className="pl-9"
                        aria-label="Rechercher"
                    />
                </form>

                <Select
                    value={filters.job_family || ALL}
                    onValueChange={(v) =>
                        filter({ job_family: v === ALL ? '' : v })
                    }
                >
                    <SelectTrigger className="w-60" aria-label="Métier">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>Tous les métiers</SelectItem>
                        {jobFamilies.map((f) => (
                            <SelectItem key={f.id} value={String(f.id)}>
                                {f.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.seniority || ALL}
                    onValueChange={(v) =>
                        filter({ seniority: v === ALL ? '' : v })
                    }
                >
                    <SelectTrigger className="w-56" aria-label="Niveau">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>Tous les niveaux</SelectItem>
                        {seniorities.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                                {s.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {candidates.data.length === 0 ? (
                <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                    Aucun candidat pour ces critères.
                </div>
            ) : (
                <ul className="divide-y overflow-hidden rounded-xl border">
                    {candidates.data.map((c) => (
                        <li key={c.id} className="space-y-2 p-4">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="font-medium">
                                        {c.display_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {[
                                            c.job_family,
                                            c.seniority,
                                            c.location,
                                            c.email,
                                        ]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </p>
                                </div>
                            </div>

                            {c.summary && (
                                <p className="line-clamp-2 text-sm">
                                    {c.summary}
                                </p>
                            )}

                            {c.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {c.skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="rounded-md bg-muted px-2 py-0.5 text-xs"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                {c.applications.map((a) => (
                                    <Link
                                        key={a.id}
                                        href={show(a.id)}
                                        className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs hover:bg-muted"
                                    >
                                        <StageDot color={a.stage.color} />
                                        {a.offer ?? 'Sans poste visé'} ·{' '}
                                        {a.stage.name}
                                        <ScoreBadge score={a.score} />
                                    </Link>
                                ))}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {candidates.last_page > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Page {candidates.current_page} sur{' '}
                        {candidates.last_page} · {candidates.total} candidats
                    </span>
                    <div className="flex gap-2">
                        {candidates.prev_page_url && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={candidates.prev_page_url}>
                                    Précédent
                                </Link>
                            </Button>
                        )}
                        {candidates.next_page_url && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={candidates.next_page_url}>
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

CandidatesIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Recrutement', href: pipeline() },
        { title: 'Base de CV', href: index() },
    ],
};
