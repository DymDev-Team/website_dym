import { Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Loader2,
    Pencil,
    UserPlus,
    UserSearch,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import AdminPage from '@/components/admin/admin-page';
import { postJson, ScoreBadge } from '@/components/admin/recruitment';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes/admin';
import {
    index as pipeline,
    show as showApplication,
} from '@/routes/admin/applications';
import { edit, index } from '@/routes/admin/job-offers';
import { add, next, show, start } from '@/routes/admin/job-offers/sourcing';
import type { SourcingMatch } from '@/types/admin';

type Props = {
    offer: {
        id: number;
        slug: string;
        title: string;
        location: string;
        contract_type: string;
        has_criteria: boolean;
        sourcing_started_at: string | null;
    };
    matches: SourcingMatch[];
    showAll: boolean;
    minScore: number;
    eligible: number;
    remaining: number;
    aiBlockedReason: string | null;
};

type NextChunk = { processed: number; remaining: number; busy: boolean };

const dateTime = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
});

const wait = (ms: number) =>
    new Promise((resolve) => window.setTimeout(resolve, ms));

export default function Sourcing({
    offer,
    matches,
    showAll,
    minScore,
    eligible,
    remaining,
    aiBlockedReason,
}: Props) {
    const [running, setRunning] = useState(false);
    const [left, setLeft] = useState(remaining);
    const cancelled = useRef(false);
    const canRun = !aiBlockedReason && eligible > 0;

    const refresh = () => router.reload({ only: ['matches', 'remaining'] });

    // Les profils sont notés par lots, une requête après l'autre, tant que
    // la page reste ouverte : le serveur n'a besoin d'aucune tâche de fond.
    const drive = async () => {
        setRunning(true);

        while (!cancelled.current) {
            let chunk: NextChunk;

            try {
                chunk = await postJson<NextChunk>(next.url(offer.slug));
            } catch (error) {
                toast.error((error as Error).message);
                break;
            }

            setLeft(chunk.remaining);

            if (chunk.processed > 0) {
                refresh();
            }

            if (chunk.remaining === 0) {
                toast.success('Recherche terminée.');
                break;
            }

            if (chunk.busy) {
                await wait(5000);
            }
        }

        setRunning(false);
    };

    // Reprend une recherche interrompue (page fermée en cours de route).
    useEffect(() => {
        cancelled.current = false;

        if (remaining > 0 && canRun) {
            void drive();
        }

        return () => {
            cancelled.current = true;
        };
        // Lancé une seule fois, à l'ouverture de la page.
    }, []);

    const launch = () => {
        router.post(start.url(offer.slug), undefined, {
            preserveScroll: true,
            onSuccess: (page) => {
                setLeft((page.props as unknown as Props).remaining);
                void drive();
            },
        });
    };

    const progress = eligible > 0 ? ((eligible - left) / eligible) * 100 : 0;

    return (
        <AdminPage
            title="Chercher dans la base de CV"
            description={`Candidats déjà connus qui pourraient convenir au poste « ${offer.title} ». L’IA compare leurs profils, sans nom ni coordonnées.`}
            actions={
                <>
                    <Button variant="outline" asChild>
                        <Link href={edit(offer.slug)}>
                            <Pencil />
                            Modifier l’offre
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link
                            href={pipeline({
                                query: { offer: String(offer.id) },
                            })}
                        >
                            Pipeline du poste
                            <ArrowRight />
                        </Link>
                    </Button>
                </>
            }
        >
            {aiBlockedReason && (
                <div className="flex items-center gap-3 rounded-lg border border-amber-500/40 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                    <AlertTriangle className="size-4 shrink-0" />
                    {aiBlockedReason}
                </div>
            )}

            {!offer.has_criteria && (
                <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                    Astuce : ajoutez une grille d’évaluation à l’offre pour un
                    classement plus précis.
                </p>
            )}

            <section className="space-y-3 rounded-xl border p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm">
                        <p className="font-medium">
                            {eligible} profil{eligible > 1 ? 's' : ''} analysé
                            {eligible > 1 ? 's' : ''} dans la base
                        </p>
                        <p className="text-muted-foreground">
                            {offer.sourcing_started_at
                                ? `Dernière recherche lancée le ${dateTime.format(new Date(offer.sourcing_started_at))}.`
                                : 'Aucune recherche lancée pour ce poste.'}
                        </p>
                    </div>
                    <Button onClick={launch} disabled={running || !canRun}>
                        {running ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <UserSearch />
                        )}
                        {offer.sourcing_started_at
                            ? 'Relancer la recherche'
                            : 'Lancer la recherche'}
                    </Button>
                </div>

                {running && (
                    <div className="space-y-1">
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${Math.max(progress, 4)}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {left} profil{left > 1 ? 's' : ''} restant
                            {left > 1 ? 's' : ''}. Gardez la page ouverte ; si
                            vous la fermez, la recherche reprendra à la
                            prochaine ouverture.
                        </p>
                    </div>
                )}
            </section>

            <div className="flex items-center gap-3">
                <Checkbox
                    id="show-all"
                    checked={showAll}
                    onCheckedChange={(checked) =>
                        router.get(
                            show.url(offer.slug),
                            checked === true ? { all: 1 } : {},
                            { preserveScroll: true, preserveState: true },
                        )
                    }
                />
                <Label htmlFor="show-all" className="font-normal">
                    Afficher aussi les profils notés sous {minScore}
                </Label>
            </div>

            {matches.length === 0 ? (
                <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                    {offer.sourcing_started_at
                        ? 'Aucun profil de la base ne correspond assez à ce poste pour le moment.'
                        : 'Lancez la recherche pour voir les profils de la base qui correspondent.'}
                </div>
            ) : (
                <ul className="divide-y overflow-hidden rounded-xl border">
                    {matches.map((match) => {
                        const c = match.candidate;

                        return (
                            <li
                                key={match.id}
                                className="flex flex-wrap items-start gap-4 p-4"
                            >
                                <ScoreBadge score={match.score} />
                                <div className="min-w-0 flex-1 space-y-1.5">
                                    <p className="font-medium">
                                        {c.display_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {[
                                            c.job_family,
                                            c.seniority,
                                            c.years_experience !== null &&
                                                `${c.years_experience} an(s)`,
                                            c.location,
                                        ]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </p>
                                    <p className="text-sm">{match.reason}</p>
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
                                </div>
                                {c.application_id ? (
                                    <Button variant="outline" size="sm" asChild>
                                        <Link
                                            href={showApplication(
                                                c.application_id,
                                            )}
                                        >
                                            Dans le pipeline
                                            <ArrowRight />
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            router.post(
                                                add.url({
                                                    job_offer: offer.slug,
                                                    candidate: c.id,
                                                }),
                                                undefined,
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        <UserPlus />
                                        Ajouter au pipeline
                                    </Button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </AdminPage>
    );
}

Sourcing.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Offres d’emploi', href: index() },
        { title: props.offer.title, href: edit(props.offer.slug) },
        { title: 'Base de CV', href: '#' },
    ],
});
