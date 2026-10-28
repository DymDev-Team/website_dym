import { Form, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Download,
    Loader2,
    Mail,
    MapPin,
    Phone,
    RefreshCw,
    Sparkles,
} from 'lucide-react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import AdminPage from '@/components/admin/admin-page';
import DeleteButton from '@/components/admin/delete-button';
import Field from '@/components/admin/field';
import {
    RecommendationBadge,
    ScoreBadge,
    StageDot,
    useAnalysisDriver,
} from '@/components/admin/recruitment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes/admin';
import {
    analyze,
    cv,
    destroy,
    index,
    show,
    update,
} from '@/routes/admin/applications';
import { store as storeNote } from '@/routes/admin/applications/notes';
import {
    destroy as destroyCandidate,
    update as updateCandidate,
} from '@/routes/admin/candidates';
import { edit as editOffer } from '@/routes/admin/job-offers';
import { edit as settings } from '@/routes/admin/recruitment/settings';
import type {
    ApplicationEvent,
    ApplicationFile,
    Labelled,
    RecruitmentStage,
} from '@/types/admin';

type Props = {
    application: ApplicationFile;
    matchedOffers: { id: number; title: string; slug: string }[];
    stages: RecruitmentStage[];
    offers: { id: number; title: string }[];
    sources: Labelled[];
    aiBlockedReason: string | null;
};

const NONE = 'none';

const dateTime = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
});

const money = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 3,
});

function Section({
    title,
    actions,
    children,
}: {
    title: string;
    actions?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="space-y-4 rounded-xl border p-5">
            <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">{title}</h2>
                {actions}
            </div>
            {children}
        </section>
    );
}

function List({ title, items }: { title: string; items: string[] }) {
    if (items.length === 0) {
        return null;
    }

    return (
        <div>
            <p className="mb-1.5 text-sm font-medium">{title}</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {items.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

function Chips({ items }: { items: string[] }) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {items.map((item) => (
                <span
                    key={item}
                    className="rounded-md bg-muted px-2 py-0.5 text-xs"
                >
                    {item}
                </span>
            ))}
        </div>
    );
}

function eventLabel(event: ApplicationEvent): ReactNode {
    const data = event.data ?? {};

    switch (event.type) {
        case 'received':
            return 'Candidature reçue depuis le site';
        case 'added_manually':
            return 'CV ajouté depuis l’admin';
        case 'sourced':
            return data.score === null || data.score === undefined
                ? 'Ajouté depuis la base de CV'
                : `Ajouté depuis la base de CV (correspondance ${data.score} / 100)`;
        case 'stage_changed':
            return `Étape : ${data.from} → ${data.to}`;
        case 'note':
            return (
                <span className="whitespace-pre-line text-foreground">
                    {data.body}
                </span>
            );
        case 'analysis_requested':
            return 'Analyse IA demandée';
        case 'analysis_completed':
            return data.score === null || data.score === undefined
                ? 'Analyse IA terminée'
                : `Analyse IA terminée : ${data.score} / 100`;
        case 'analysis_failed':
            return `Analyse IA en échec : ${data.error}`;
        case 'candidate_merged':
            return 'Rattaché à la fiche existante du candidat (même e-mail)';
    }
}

function Analysis({
    application,
    matchedOffers,
    aiBlockedReason,
}: Pick<Props, 'application' | 'matchedOffers' | 'aiBlockedReason'>) {
    const analysis = application.analysis;
    const attempt = application.latest_attempt;
    const running =
        attempt?.status === 'pending' || attempt?.status === 'processing';

    const relaunch = (
        <Button
            variant="outline"
            size="sm"
            disabled={running}
            onClick={() =>
                router.post(analyze.url(application.id), undefined, {
                    preserveScroll: true,
                })
            }
        >
            <RefreshCw />
            {analysis || attempt ? 'Relancer l’analyse' : 'Analyser le CV'}
        </Button>
    );

    const blocked = aiBlockedReason && (
        <p>
            {aiBlockedReason}{' '}
            <Link
                href={settings()}
                className="font-medium text-foreground underline underline-offset-4"
            >
                Ouvrir les réglages
            </Link>
        </p>
    );

    // Tentative plus récente que le résultat affiché : en cours, ou en échec.
    const status = running ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            {analysis
                ? 'Nouvelle analyse en cours : le résultat ci-dessous sera remplacé.'
                : 'L’IA lit le CV. Le résultat s’affichera dans quelques instants.'}
        </p>
    ) : (
        attempt && (
            <div className="space-y-1 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
                <p>
                    {attempt.status_label} :{' '}
                    {attempt.error ?? 'raison inconnue.'}
                    {analysis && ' Le résultat précédent reste affiché.'}
                </p>
                {blocked}
            </div>
        )
    );

    if (!analysis?.result) {
        return (
            <Section title="Analyse IA" actions={relaunch}>
                {status || (
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>Ce CV n’a pas encore été analysé.</p>
                        {blocked}
                    </div>
                )}
            </Section>
        );
    }

    const result = analysis.result;
    const evaluation = result.evaluation;

    return (
        <Section title="Analyse IA" actions={relaunch}>
            {status}

            {analysis.job_offer_id !== application.job_offer_id && (
                <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                    {analysis.offer
                        ? `Analyse faite pour le poste « ${analysis.offer} ».`
                        : 'Analyse faite sans poste visé.'}{' '}
                    Relancez-la pour noter le candidat sur le poste actuel.
                </p>
            )}

            {result.warnings.length > 0 && (
                <div className="flex gap-3 rounded-lg border border-amber-500/40 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <ul className="space-y-1">
                        {result.warnings.map((w) => (
                            <li key={w}>{w}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex gap-4">
                {evaluation && (
                    <ScoreBadge score={evaluation.score} size="lg" />
                )}
                <div className="min-w-0 flex-1 space-y-2">
                    {evaluation && (
                        <RecommendationBadge
                            recommendation={evaluation.recommendation}
                        />
                    )}
                    <p className="text-sm">{result.summary}</p>
                </div>
            </div>

            {evaluation && (
                <>
                    <div className="space-y-3">
                        {evaluation.criteria.map((criterion) => (
                            <div key={criterion.name} className="space-y-1">
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <span className="font-medium">
                                        {criterion.name}
                                    </span>
                                    <span className="text-muted-foreground tabular-nums">
                                        {criterion.score} / 10
                                    </span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full bg-primary"
                                        style={{
                                            width: `${criterion.score * 10}%`,
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    « {criterion.evidence} »
                                </p>
                            </div>
                        ))}
                    </div>

                    {evaluation.model_score !== undefined &&
                        evaluation.model_score !== evaluation.score && (
                            <p className="text-xs text-muted-foreground">
                                Note calculée sur la grille de l’offre
                                (estimation directe de l’IA :{' '}
                                {evaluation.model_score} / 100).
                            </p>
                        )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <List
                            title="Points forts"
                            items={evaluation.strengths}
                        />
                        <List
                            title="Points à vérifier"
                            items={evaluation.concerns}
                        />
                    </div>
                    <List
                        title="Questions d’entretien suggérées"
                        items={evaluation.interview_questions}
                    />
                </>
            )}

            {result.offer_matches.length > 0 && (
                <div>
                    <p className="mb-2 text-sm font-medium">
                        Correspond aussi à
                    </p>
                    <ul className="space-y-2">
                        {result.offer_matches.map((match) => {
                            const offer = matchedOffers.find(
                                (o) => o.id === match.offer_id,
                            );

                            return (
                                <li
                                    key={match.offer_id}
                                    className="flex items-start gap-3 text-sm"
                                >
                                    <ScoreBadge score={match.score} />
                                    <div>
                                        {offer ? (
                                            <Link
                                                href={index({
                                                    query: {
                                                        offer: String(offer.id),
                                                    },
                                                })}
                                                className="font-medium hover:underline"
                                            >
                                                {offer.title}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">
                                                Offre supprimée
                                            </span>
                                        )}
                                        <p className="text-muted-foreground">
                                            {match.reason}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {result.research && result.research.length > 0 && (
                <div>
                    <p className="mb-2 text-sm font-medium">
                        Recherches sur le parcours
                    </p>
                    <ul className="space-y-2 text-sm">
                        {result.research.map((item) => (
                            <li key={item.subject}>
                                <span className="font-medium">
                                    {item.subject}
                                </span>{' '}
                                <span className="text-xs text-muted-foreground">
                                    (
                                    {item.kind === 'school'
                                        ? 'formation'
                                        : item.kind === 'company'
                                          ? 'entreprise'
                                          : 'organisme'}
                                    )
                                </span>
                                <p className="text-muted-foreground">
                                    {item.finding}{' '}
                                    {item.source_url && (
                                        <a
                                            href={item.source_url}
                                            target="_blank"
                                            rel="noreferrer noopener"
                                            className="underline underline-offset-4"
                                        >
                                            Source
                                        </a>
                                    )}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {result.assessment && (
                <div className="space-y-3 rounded-lg bg-muted/60 p-4">
                    <p className="text-sm font-semibold">
                        Avis général sur le candidat
                    </p>
                    <p className="text-sm">{result.assessment.overall}</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <List
                            title="Atouts"
                            items={result.assessment.strengths}
                        />
                        <List
                            title="Réserves"
                            items={result.assessment.concerns}
                        />
                    </div>
                    {result.assessment.suggested_roles.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="text-sm font-medium">
                                Postes qui pourraient lui convenir
                            </p>
                            <Chips items={result.assessment.suggested_roles} />
                        </div>
                    )}
                </div>
            )}

            <p className="border-t pt-3 text-xs text-muted-foreground">
                <Sparkles className="mr-1 inline size-3" />
                {analysis.model} ·{' '}
                {analysis.finished_at &&
                    dateTime.format(new Date(analysis.finished_at))}{' '}
                · {money.format(analysis.cost)} · Avis indicatif : la décision
                revient à l’équipe.
            </p>
        </Section>
    );
}

export default function ApplicationShow({
    application,
    matchedOffers,
    stages,
    offers,
    sources,
    aiBlockedReason,
}: Props) {
    const { candidate } = application;
    const profile = candidate.profile;
    const attempt = application.latest_attempt;
    const running =
        attempt?.status === 'pending' || attempt?.status === 'processing';

    const refresh = () =>
        router.reload({ only: ['application', 'matchedOffers'] });

    // Lance l'analyse de ce CV en priorité, puis rafraîchit la fiche tant
    // qu'elle n'est pas terminée (elle peut aussi tourner ailleurs).
    useAnalysisDriver(running && !aiBlockedReason, refresh, attempt?.id);

    useEffect(() => {
        if (!running) {
            return;
        }

        const timer = window.setInterval(refresh, 6000);

        return () => window.clearInterval(timer);
    }, [running]);

    const change = (field: string, value: string) => {
        router.patch(
            update.url(application.id),
            { [field]: value === NONE ? null : value },
            { preserveScroll: true },
        );
    };

    return (
        <AdminPage
            title={candidate.display_name}
            description={[
                profile?.headline,
                application.job_offer
                    ? `Candidat au poste « ${application.job_offer.title} »`
                    : 'Sans poste visé',
                `reçu le ${dateTime.format(new Date(application.created_at))}`,
            ]
                .filter(Boolean)
                .join(' · ')}
            actions={
                <DeleteButton
                    action={destroy.form(application.id)}
                    label={`la candidature de ${candidate.display_name}`}
                    description="Cette candidature et son CV seront supprimés. La fiche du candidat est conservée s’il a d’autres candidatures."
                />
            }
        >
            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                <div className="min-w-0 space-y-6">
                    <Analysis
                        application={application}
                        matchedOffers={matchedOffers}
                        aiBlockedReason={aiBlockedReason}
                    />

                    {(candidate.summary ||
                        (candidate.skills?.length ?? 0) > 0) && (
                        <Section title="Profil">
                            <dl className="grid gap-3 text-sm sm:grid-cols-3">
                                {[
                                    ['Famille de métier', candidate.job_family],
                                    ['Niveau', candidate.seniority],
                                    [
                                        'Expérience',
                                        candidate.years_experience !== null &&
                                            `${candidate.years_experience} an(s)`,
                                    ],
                                ].map(([label, value]) => (
                                    <div key={String(label)}>
                                        <dt className="text-muted-foreground">
                                            {label}
                                        </dt>
                                        <dd className="font-medium">
                                            {value || '—'}
                                        </dd>
                                    </div>
                                ))}
                            </dl>

                            {candidate.skills &&
                                candidate.skills.length > 0 && (
                                    <div className="space-y-1.5">
                                        <p className="text-sm font-medium">
                                            Compétences
                                        </p>
                                        <Chips items={candidate.skills} />
                                    </div>
                                )}

                            {profile && (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <List
                                        title="Langues"
                                        items={profile.languages}
                                    />
                                    <List
                                        title="Certifications et habilitations"
                                        items={profile.certifications}
                                    />
                                </div>
                            )}

                            {profile && profile.experiences.length > 0 && (
                                <div>
                                    <p className="mb-2 text-sm font-medium">
                                        Expériences
                                    </p>
                                    <ol className="space-y-3 border-l pl-4">
                                        {profile.experiences.map((e, i) => (
                                            <li key={i} className="text-sm">
                                                <p className="font-medium">
                                                    {e.title}
                                                    {e.company &&
                                                        ` · ${e.company}`}
                                                </p>
                                                {e.period && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {e.period}
                                                    </p>
                                                )}
                                                {e.highlights && (
                                                    <p className="mt-1 text-muted-foreground">
                                                        {e.highlights}
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                            {profile && profile.education.length > 0 && (
                                <List
                                    title="Formation"
                                    items={profile.education.map((e) =>
                                        [e.degree, e.institution, e.year]
                                            .filter(Boolean)
                                            .join(' · '),
                                    )}
                                />
                            )}
                        </Section>
                    )}

                    {application.answers && application.answers.length > 0 && (
                        <Section title="Réponses aux questions">
                            <dl className="space-y-3 text-sm">
                                {application.answers.map((answer) => (
                                    <div key={answer.id}>
                                        <dt className="text-muted-foreground">
                                            {answer.label}
                                        </dt>
                                        <dd className="font-medium whitespace-pre-line">
                                            {answer.answer}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </Section>
                    )}

                    {application.message && (
                        <Section title="Message du candidat">
                            <p className="text-sm whitespace-pre-line">
                                {application.message}
                            </p>
                        </Section>
                    )}

                    <Section title="Notes et historique">
                        <Form
                            {...storeNote.form(application.id)}
                            options={{ preserveScroll: true }}
                            resetOnSuccess
                            className="space-y-2"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <Textarea
                                        name="body"
                                        rows={3}
                                        required
                                        maxLength={5000}
                                        placeholder="Ajouter une note interne (entretien, appel, avis…)"
                                        aria-label="Note interne"
                                    />
                                    {errors.body && (
                                        <p className="text-sm text-destructive">
                                            {errors.body}
                                        </p>
                                    )}
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={processing}
                                    >
                                        {processing && <Spinner />}
                                        Ajouter la note
                                    </Button>
                                </>
                            )}
                        </Form>

                        <ol className="space-y-3">
                            {application.events.map((event) => (
                                <li
                                    key={event.id}
                                    className="border-l-2 pl-3 text-sm"
                                >
                                    <p className="text-muted-foreground">
                                        {eventLabel(event)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {dateTime.format(
                                            new Date(event.created_at),
                                        )}
                                        {event.user && ` · ${event.user}`}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </Section>
                </div>

                <aside className="space-y-4">
                    <section className="space-y-3 rounded-xl border p-5">
                        {candidate.email && (
                            <a
                                href={`mailto:${candidate.email}`}
                                className="flex items-center gap-3 text-sm hover:underline"
                            >
                                <Mail className="size-4 text-muted-foreground" />
                                {candidate.email}
                            </a>
                        )}
                        {candidate.phone && (
                            <a
                                href={`tel:${candidate.phone}`}
                                className="flex items-center gap-3 text-sm hover:underline"
                            >
                                <Phone className="size-4 text-muted-foreground" />
                                {candidate.phone}
                            </a>
                        )}
                        {candidate.location && (
                            <p className="flex items-center gap-3 text-sm">
                                <MapPin className="size-4 text-muted-foreground" />
                                {candidate.location}
                            </p>
                        )}
                        <Button className="w-full" asChild>
                            <a href={cv(application.id).url}>
                                <Download />
                                Télécharger le CV
                            </a>
                        </Button>
                        <p className="truncate text-center text-xs text-muted-foreground">
                            {application.cv_name}
                        </p>
                    </section>

                    <section className="space-y-4 rounded-xl border p-5">
                        <div className="grid gap-2">
                            <Label htmlFor="stage">Étape</Label>
                            <Select
                                value={String(application.stage_id)}
                                onValueChange={(v) => change('stage_id', v)}
                            >
                                <SelectTrigger id="stage" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {stages.map((s) => (
                                        <SelectItem
                                            key={s.id}
                                            value={String(s.id)}
                                        >
                                            <StageDot color={s.color} />
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="offer">Poste visé</Label>
                            <Select
                                value={String(application.job_offer_id ?? NONE)}
                                onValueChange={(v) => change('job_offer_id', v)}
                            >
                                <SelectTrigger id="offer" className="w-full">
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
                            <p className="text-xs text-muted-foreground">
                                Changer de poste relance l’analyse.
                                {application.job_offer && (
                                    <>
                                        {' '}
                                        <Link
                                            href={editOffer(
                                                application.job_offer.slug,
                                            )}
                                            className="underline underline-offset-4"
                                        >
                                            Voir l’offre
                                        </Link>
                                    </>
                                )}
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="source">Source</Label>
                            <Select
                                value={String(application.source_id ?? NONE)}
                                onValueChange={(v) => change('source_id', v)}
                            >
                                <SelectTrigger id="source" className="w-full">
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
                            {application.added_by && (
                                <p className="text-xs text-muted-foreground">
                                    Ajouté par {application.added_by}
                                </p>
                            )}
                        </div>
                    </section>

                    <section className="rounded-xl border p-5">
                        <h2 className="mb-3 text-sm font-semibold">
                            Coordonnées
                        </h2>
                        <Form
                            {...updateCandidate.form(candidate.id)}
                            options={{ preserveScroll: true }}
                            className="space-y-3"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {(
                                        [
                                            ['name', 'Nom', 'text'],
                                            ['email', 'E-mail', 'email'],
                                            ['phone', 'Téléphone', 'tel'],
                                            ['location', 'Ville', 'text'],
                                        ] as const
                                    ).map(([name, label, type]) => (
                                        <Field
                                            key={name}
                                            id={`candidate-${name}`}
                                            label={label}
                                            error={errors[name]}
                                        >
                                            <Input
                                                id={`candidate-${name}`}
                                                name={name}
                                                type={type}
                                                defaultValue={
                                                    candidate[name] ?? ''
                                                }
                                            />
                                        </Field>
                                    ))}
                                    <Button
                                        type="submit"
                                        size="sm"
                                        variant="outline"
                                        disabled={processing}
                                    >
                                        {processing && <Spinner />}
                                        Enregistrer
                                    </Button>
                                </>
                            )}
                        </Form>
                    </section>

                    {application.other_applications.length > 0 && (
                        <section className="space-y-3 rounded-xl border p-5">
                            <h2 className="text-sm font-semibold">
                                Autres candidatures
                            </h2>
                            <ul className="space-y-2">
                                {application.other_applications.map((o) => (
                                    <li key={o.id}>
                                        <Link
                                            href={show(o.id)}
                                            className="flex items-center gap-2 text-sm hover:underline"
                                        >
                                            <StageDot color={o.stage.color} />
                                            <span className="min-w-0 flex-1 truncate">
                                                {o.offer ?? 'Sans poste visé'}
                                            </span>
                                            <ScoreBadge score={o.score} />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <section className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 p-5">
                        <p className="text-sm text-muted-foreground">
                            Supprimer le candidat, toutes ses candidatures et
                            ses CV (droit à l’effacement).
                        </p>
                        <DeleteButton
                            action={destroyCandidate.form(candidate.id)}
                            label={`le candidat ${candidate.display_name}`}
                            description="Toutes ses candidatures, analyses et CV seront définitivement supprimés."
                        />
                    </section>
                </aside>
            </div>
        </AdminPage>
    );
}

ApplicationShow.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Recrutement', href: index() },
        { title: props.application.candidate.display_name, href: '#' },
    ],
});
