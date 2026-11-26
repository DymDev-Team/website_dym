import { Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Copy,
    Download,
    Library,
    ListChecks,
    Search,
    Settings2,
    Sparkles,
    MessageCircle,
    UserSearch,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { DragEvent, FormEvent } from 'react';
import { toast } from 'sonner';
import AdminPage from '@/components/admin/admin-page';
import CandidateEmailDialog from '@/components/admin/candidate-email-dialog';
import { copyRows, downloadCsv } from '@/components/admin/contacts-export';
import type { ContactRow } from '@/components/admin/contacts-export';
import CvUploadDialog from '@/components/admin/cv-upload-dialog';
import WhatsappShareDialog from '@/components/admin/whatsapp-share-dialog';
import {
    AnalysisPending,
    RecommendationBadge,
    ScoreBadge,
    StageDot,
    StepScore,
    VerdictBadge,
    postJson,
    seniorityLabels,
    useAnalysisDriver,
} from '@/components/admin/recruitment';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes/admin';
import { contacts, index, show, update } from '@/routes/admin/applications';
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

type Filters = {
    offer: string;
    search: string;
    recommendation: string;
    sort: 'score' | 'recent';
};

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
    perStage: number;
};

const ALL = 'all';

// Cartes cochées une à une, ou tout le résultat du filtre (cartes non
// chargées comprises).
type Selection = { all: true } | { all: false; ids: number[] };

const none: Selection = { all: false, ids: [] };

const plural = (count: number, word: string) =>
    `${count} ${word}${count > 1 ? 's' : ''}`;

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });

function Card({
    card,
    selecting,
    checked,
    onToggle,
}: {
    card: PipelineCard;
    selecting: boolean;
    checked: boolean;
    onToggle: () => void;
}) {
    const { candidate } = card;
    const details = [
        candidate.job_family,
        candidate.seniority && seniorityLabels[candidate.seniority],
        candidate.years_experience !== null &&
            `${candidate.years_experience} an${candidate.years_experience > 1 ? 's' : ''}`,
    ].filter(Boolean);

    const content = (
        <>
            <div className="flex items-start gap-2">
                {selecting && (
                    <Checkbox
                        checked={checked}
                        onCheckedChange={onToggle}
                        aria-label={`Sélectionner ${candidate.name}`}
                        className="mt-0.5"
                    />
                )}
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
                {card.test_score !== null && (
                    <StepScore label="Test" score={card.test_score} />
                )}
                {card.dg_score !== null && (
                    <StepScore label="DG" score={card.dg_score} />
                )}
                {card.global_score !== null && (
                    <StepScore label="Global" score={card.global_score} />
                )}
                <VerdictBadge verdict={card.verdict} />
                <AnalysisPending status={card.analysis_status} />
                {card.analysis_status === 'failed' && (
                    <span className="text-xs text-destructive">
                        Analyse échouée
                    </span>
                )}
            </div>
        </>
    );

    // En sélection, un clic coche la carte au lieu d'ouvrir la fiche.
    if (selecting) {
        return (
            <label
                className={cn(
                    'block cursor-pointer space-y-2 rounded-lg border bg-background p-3 shadow-xs transition-colors hover:border-foreground/30',
                    checked && 'border-primary ring-2 ring-primary/30',
                )}
            >
                {content}
            </label>
        );
    }

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
            {content}
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
    perStage,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [loadingStage, setLoadingStage] = useState<number | null>(null);

    // Charge la suite d'une colonne ; les autres gardent leurs cartes.
    const showMore = (stageId: number) => {
        const shown = Object.fromEntries(
            stages
                .filter((s) => s.applications.length > perStage)
                .map((s) => [s.id, s.applications.length]),
        );
        shown[stageId] =
            (stages.find((s) => s.id === stageId)?.applications.length ?? 0) +
            perStage;

        router.get(
            index.url(),
            { ...filters, shown },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['stages'],
                onStart: () => setLoadingStage(stageId),
                onFinish: () => setLoadingStage(null),
            },
        );
    };
    const selectedOffer = offers.find((o) => String(o.id) === filters.offer);
    const [dropTarget, setDropTarget] = useState<number | null>(null);
    // E-mail proposé après un déplacement vers une étape qui en a un.
    const [email, setEmail] = useState<{
        applicationId: number;
        stageId: number;
    } | null>(null);

    const [selecting, setSelecting] = useState(false);
    const [selection, setSelection] = useState<Selection>(none);
    const [exporting, setExporting] = useState<'export' | 'copy' | null>(null);
    const [sharing, setSharing] = useState(false);
    const loadedIds = stages.flatMap((s) => s.applications.map((a) => a.id));
    const total = stages.reduce((sum, s) => sum + s.total, 0);
    const count = selection.all ? total : selection.ids.length;
    const isSelected = (id: number) =>
        selection.all || selection.ids.includes(id);

    // Décocher une carte quand tout le filtre est sélectionné repart des
    // cartes affichées.
    const toggle = (id: number) =>
        setSelection((current) => {
            const ids = current.all ? loadedIds : current.ids;

            return {
                all: false,
                ids: ids.includes(id)
                    ? ids.filter((other) => other !== id)
                    : [...ids, id],
            };
        });

    const toggleStage = (stage: PipelineStage, on: boolean) =>
        setSelection((current) => {
            const ids = current.all ? loadedIds : current.ids;
            const stageIds = stage.applications.map((a) => a.id);

            return {
                all: false,
                ids: on
                    ? [...new Set([...ids, ...stageIds])]
                    : ids.filter((id) => !stageIds.includes(id)),
            };
        });

    const stageChecked = (stage: PipelineStage) => {
        const checked = stage.applications.filter((a) =>
            isSelected(a.id),
        ).length;

        if (checked === 0) {
            return false;
        }

        return checked === stage.applications.length ? true : 'indeterminate';
    };

    const stopSelecting = () => {
        setSelecting(false);
        setSelection(none);
    };

    // Requête des infos de la sélection, pour l'action demandée.
    const selectionBody = (action: string) => {
        const body = new FormData();
        body.append('action', action);

        if (selection.all) {
            body.append('all', '1');
            (['offer', 'search', 'recommendation'] as const).forEach(
                (key) => filters[key] && body.append(key, filters[key]),
            );
        } else {
            selection.ids.forEach((id) => body.append('ids[]', String(id)));
        }

        return body;
    };

    const exportContacts = async (action: 'export' | 'copy') => {
        const body = selectionBody(action);

        setExporting(action);

        try {
            const { rows } = await postJson<{ rows: ContactRow[] }>(
                contacts.url(),
                body,
            );

            if (action === 'export') {
                downloadCsv(rows);
                toast.success(
                    `${plural(rows.length, 'candidature')} exportée${rows.length > 1 ? 's' : ''}.`,
                );

                return;
            }

            try {
                await copyRows(rows);
                toast.success(
                    `Coordonnées copiées (${plural(rows.length, 'candidature')}).`,
                );
            } catch {
                toast.error(
                    'Le navigateur a refusé la copie : utilisez « Exporter ».',
                );
            }
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : 'Export impossible.',
            );
        } finally {
            setExporting(null);
        }
    };

    const filter = (patch: Partial<Filters>) => {
        // Un autre filtre change les candidatures concernées ; le tri, non.
        if (Object.keys(patch).some((key) => key !== 'sort')) {
            setSelection(none);
        }

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
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    if (stages.find((s) => s.id === stageId)?.has_email) {
                        setEmail({ applicationId: id, stageId });
                    }
                },
            },
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

                <Select
                    value={filters.sort}
                    onValueChange={(v) =>
                        filter({ sort: v as Filters['sort'] })
                    }
                >
                    <SelectTrigger className="w-52" aria-label="Trier par">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="score">Meilleure note</SelectItem>
                        <SelectItem value="recent">
                            Dernières candidatures
                        </SelectItem>
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

                <Button
                    variant={selecting ? 'secondary' : 'outline'}
                    onClick={() =>
                        selecting ? stopSelecting() : setSelecting(true)
                    }
                >
                    <ListChecks />
                    {selecting ? 'Terminer la sélection' : 'Sélectionner'}
                </Button>

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
                            {selecting && (
                                <Checkbox
                                    checked={stageChecked(stage)}
                                    disabled={stage.applications.length === 0}
                                    onCheckedChange={(value) =>
                                        toggleStage(stage, value === true)
                                    }
                                    aria-label={`Tout cocher : ${stage.name}`}
                                />
                            )}
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
                                <Card
                                    key={card.id}
                                    card={card}
                                    selecting={selecting}
                                    checked={isSelected(card.id)}
                                    onToggle={() => toggle(card.id)}
                                />
                            ))}
                            {stage.total > stage.applications.length && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={loadingStage === stage.id}
                                    onClick={() => showMore(stage.id)}
                                    className="text-muted-foreground"
                                >
                                    {loadingStage === stage.id && <Spinner />}
                                    Voir{' '}
                                    {Math.min(
                                        stage.total - stage.applications.length,
                                        perStage,
                                    )}{' '}
                                    de plus (
                                    {stage.total - stage.applications.length}{' '}
                                    restants)
                                </Button>
                            )}
                        </div>
                    </section>
                ))}
            </div>

            {selecting && (
                <div className="sticky bottom-4 z-10 flex max-w-full flex-wrap items-center gap-2 self-center rounded-xl border bg-background p-2 pl-4 shadow-lg">
                    <span className="text-sm">
                        {selection.all
                            ? `Les ${plural(total, 'candidature')} du filtre sont sélectionnées`
                            : count === 0
                              ? 'Cochez des candidatures'
                              : `${plural(count, 'candidature')} sélectionnée${count > 1 ? 's' : ''}`}
                    </span>
                    {!selection.all && count < total && (
                        <Button
                            variant="link"
                            size="sm"
                            onClick={() => setSelection({ all: true })}
                        >
                            Tout sélectionner ({total})
                        </Button>
                    )}
                    {count > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelection(none)}
                        >
                            Effacer
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={count === 0 || exporting !== null}
                        onClick={() => exportContacts('copy')}
                    >
                        {exporting === 'copy' ? <Spinner /> : <Copy />}
                        Copier
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={count === 0}
                        onClick={() => setSharing(true)}
                    >
                        <MessageCircle />
                        WhatsApp
                    </Button>
                    <Button
                        size="sm"
                        disabled={count === 0 || exporting !== null}
                        onClick={() => exportContacts('export')}
                    >
                        {exporting === 'export' ? <Spinner /> : <Download />}
                        Exporter (CSV)
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={stopSelecting}
                        aria-label="Fermer la sélection"
                    >
                        <X />
                    </Button>
                </div>
            )}

            {sharing && (
                <WhatsappShareDialog
                    count={count}
                    body={selectionBody}
                    open
                    onOpenChange={(open) => !open && setSharing(false)}
                />
            )}

            {email && (
                <CandidateEmailDialog
                    applicationId={email.applicationId}
                    stageId={email.stageId}
                    open
                    onOpenChange={(open) => !open && setEmail(null)}
                />
            )}
        </AdminPage>
    );
}

Pipeline.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Recrutement', href: index() },
    ],
};
