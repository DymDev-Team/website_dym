import { Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Library,
    Search,
    Settings2,
    Sparkles,
    UserSearch,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { DragEvent, FormEvent } from 'react';
import AdminPage from '@/components/admin/admin-page';
import CvUploadDialog from '@/components/admin/cv-upload-dialog';
import {
    AnalysisPending,
    RecommendationBadge,
    ScoreBadge,
    StageDot,
    seniorityLabels,
    useAnalysisDriver,
} from '@/components/admin/recruitment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes/admin';
import { index, show, update } from '@/routes/admin/applications';
import { index as candidates } from '@/routes/admin/candidates';
import { show as sourcing } from '@/routes/admin/job-offers/sourcing';
import { missing } from '@/routes/admin/recruitment/analyses';
import { edit as settings } from '@/routes/admin/recruitment/settings';
import type {
    Labelled,
    Option,
    PipelineCard,
    PipelineStage,
} from '@/types/admin';

type Filters = { offer: string; search: string; recommendation: string };

type Props = {
    stages: PipelineStage[];
    offers: {
        id: number;
        title: string;
        slug: string;
        is_published: boolean;
        closes_at: string | null;
    }[];
    sources: Labelled[];
    recommendations: Option[];
    filters: Filters;
    activeAnalyses: number;
    missingAnalyses: number;
    aiBlockedReason: string | null;
};

const ALL = 'all';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });

function Card({ card }: { card: PipelineCard }) {
    const { candidate } = card;
    const details = [
        candidate.job_family,
        candidate.seniority && seniorityLabels[candidate.seniority],
        candidate.years_experience !== null &&
            `${candidate.years_experience} an${candidate.years_experience > 1 ? 's' : ''}`,
    ].filter(Boolean);

    return (
        <Link
            href={show(card.id)}
            draggable
            onDragStart={(event: DragEvent) => {
                event.dataTransfer.setData('text/plain', String(card.id));
                event.dataTransfer.effectAllowed = 'move';
            }}
            className="block cursor-grab space-y-2 rounded-lg border bg-background p-3 shadow-xs transition-colors hover:border-foreground/30 active:cursor-grabbing"
        >
            <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                    <p
                        className={cn(
                            'truncate text-sm',
                            card.viewed ? 'font-medium' : 'font-semibold',
                        )}
                    >
                        {!card.viewed && (
                            <span className="mr-1.5 inline-block size-2 rounded-full bg-primary align-middle" />
                        )}
                        {candidate.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {card.offer ?? 'Sans poste visé'} ·{' '}
                        {dateFormat.format(new Date(card.created_at))}
                    </p>
                </div>
                <ScoreBadge score={card.score} />
            </div>

            {candidate.summary && (
                <p className="line-clamp-2 text-xs text-muted-foreground">
                    {candidate.summary}
                </p>
            )}

            {details.length > 0 && (
                <p className="truncate text-xs">{details.join(' · ')}</p>
            )}

            <div className="flex flex-wrap items-center gap-2">
                <RecommendationBadge recommendation={card.recommendation} />
                <AnalysisPending status={card.analysis_status} />
                {card.analysis_status === 'failed' && (
                    <span className="text-xs text-destructive">
                        Analyse échouée
                    </span>
                )}
            </div>
        </Link>
    );
}

export default function Pipeline({
    stages,
    offers,
    sources,
    recommendations,
    filters,
    activeAnalyses,
    missingAnalyses,
    aiBlockedReason,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const selectedOffer = offers.find((o) => String(o.id) === filters.offer);
    const [dropTarget, setDropTarget] = useState<number | null>(null);

    const filter = (patch: Partial<Filters>) => {
        router.get(
            index.url(),
            { ...filters, ...patch },
            { preserveState: true, preserveScroll: true },
        );
    };

    const refresh = () =>
        router.reload({
            only: ['stages', 'activeAnalyses', 'missingAnalyses'],
        });

    // La page fait avancer les analyses en attente, et se rafraîchit pour
    // montrer celles qui se terminent ailleurs.
    useAnalysisDriver(activeAnalyses > 0 && !aiBlockedReason, refresh);

    useEffect(() => {
        if (activeAnalyses === 0) {
            return;
        }

        const timer = window.setInterval(refresh, 8000);

        return () => window.clearInterval(timer);
    }, [activeAnalyses]);

    const drop = (event: DragEvent, stageId: number) => {
        event.preventDefault();
        setDropTarget(null);
        const id = Number(event.dataTransfer.getData('text/plain'));
        const card = stages
            .flatMap((s) => s.applications)
            .find((a) => a.id === id);

        if (!card || card.stage_id === stageId) {
            return;
        }

        router.patch(
            update.url(id),
            { stage_id: stageId },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <AdminPage
            title="Recrutement"
            description="Chaque CV est lu et noté par l’IA. Glissez une carte pour changer d’étape ; la décision reste toujours humaine."
            actions={
                <>
                    <Button variant="outline" asChild>
                        <Link href={candidates()}>
                            <Library />
                            Base de CV
                        </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                        <Link href={settings()} aria-label="Réglages">
                            <Settings2 />
                        </Link>
                    </Button>
                    <CvUploadDialog
                        offers={offers}
                        sources={sources}
                        defaultOffer={filters.offer}
                    />
                </>
            }
        >
            {aiBlockedReason && (
                <div className="flex items-center gap-3 rounded-lg border border-amber-500/40 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span className="flex-1">
                        {aiBlockedReason} Les CV sont enregistrés mais pas
                        analysés.
                    </span>
                    <Link
                        href={settings()}
                        className="font-medium underline underline-offset-4"
                    >
                        Réglages
                    </Link>
                </div>
            )}

            {!aiBlockedReason && missingAnalyses > 0 && (
                <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3 text-sm">
                    <Sparkles className="size-4 shrink-0 text-primary" />
                    <span className="flex-1">
                        {missingAnalyses === 1
                            ? '1 CV n’a pas encore été analysé (reçu avant l’activation de l’IA ou pendant une pause).'
                            : `${missingAnalyses} CV n’ont pas encore été analysés (reçus avant l’activation de l’IA ou pendant une pause).`}
                    </span>
                    <Button
                        size="sm"
                        onClick={() =>
                            router.post(missing.url(), undefined, {
                                preserveScroll: true,
                            })
                        }
                    >
                        Les analyser
                    </Button>
                </div>
            )}

            <div className="flex flex-wrap gap-3">
                <Select
                    value={filters.offer || ALL}
                    onValueChange={(v) => filter({ offer: v === ALL ? '' : v })}
                >
                    <SelectTrigger className="w-72" aria-label="Poste">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>Tous les postes</SelectItem>
                        <SelectItem value="spontaneous">
                            Sans poste visé
                        </SelectItem>
                        {offers.map((o) => (
                            <SelectItem key={o.id} value={String(o.id)}>
                                {o.title}
                                {!o.is_published && ' (non publiée)'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.recommendation || ALL}
                    onValueChange={(v) =>
                        filter({ recommendation: v === ALL ? '' : v })
                    }
                >
                    <SelectTrigger className="w-60" aria-label="Avis de l’IA">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>Tous les avis</SelectItem>
                        {recommendations.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                                {r.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <form
                    onSubmit={(event: FormEvent) => {
                        event.preventDefault();
                        filter({ search });
                    }}
                    className="relative w-full sm:w-72"
                >
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Nom, compétence…"
                        className="pl-9"
                        aria-label="Rechercher"
                    />
                </form>

                {selectedOffer && (
                    <Button variant="outline" asChild>
                        <Link href={sourcing(selectedOffer.slug)}>
                            <UserSearch />
                            Chercher dans la base de CV
                        </Link>
                    </Button>
                )}

                {activeAnalyses > 0 && !aiBlockedReason && (
                    <span className="self-center text-sm text-muted-foreground">
                        {activeAnalyses} analyse
                        {activeAnalyses > 1 ? 's' : ''} en cours…
                    </span>
                )}
            </div>

            <div className="-mx-4 flex flex-1 gap-4 overflow-x-auto px-4 pb-4 md:-mx-6 md:px-6">
                {stages.map((stage) => (
                    <section
                        key={stage.id}
                        onDragOver={(event) => {
                            event.preventDefault();
                            setDropTarget(stage.id);
                        }}
                        onDragLeave={() => setDropTarget(null)}
                        onDrop={(event) => drop(event, stage.id)}
                        className={cn(
                            'flex w-72 shrink-0 flex-col rounded-xl bg-muted/50 p-2 transition-colors',
                            dropTarget === stage.id &&
                                'bg-muted ring-2 ring-primary/40',
                        )}
                    >
                        <header className="flex items-center gap-2 px-2 py-2">
                            <StageDot color={stage.color} />
                            <h2 className="flex-1 truncate text-sm font-semibold">
                                {stage.name}
                            </h2>
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {stage.total}
                            </span>
                        </header>
                        <div className="flex min-h-24 flex-col gap-2">
                            {stage.applications.map((card) => (
                                <Card key={card.id} card={card} />
                            ))}
                            {stage.total > stage.applications.length && (
                                <p className="px-2 py-1 text-xs text-muted-foreground">
                                    + {stage.total - stage.applications.length}{' '}
                                    autres : affinez avec les filtres.
                                </p>
                            )}
                        </div>
                    </section>
                ))}
            </div>
        </AdminPage>
    );
}

Pipeline.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Recrutement', href: index() },
    ],
};
