import { Form, router, usePage } from '@inertiajs/react';
import {
    Check,
    Copy,
    Mail,
    MessageCircle,
    Plus,
    Sparkles,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import DeleteButton from '@/components/admin/delete-button';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { update as updateDgReview } from '@/routes/admin/applications/dg-review';
import {
    destroy as destroyTest,
    prepare,
    send,
    update as updateTest,
} from '@/routes/admin/applications/psychotest';
import type {
    ApplicationFile,
    Psychotest,
    PsychotestQuestion,
} from '@/types/admin';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' });
const dateTime = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
});

const sourceLabels: Record<PsychotestQuestion['source'], string> = {
    offer: 'Poste',
    candidate: 'Candidat',
    manual: 'Ajoutée',
};

function Box({
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

function firstError(errors: Record<string, string>, prefix: string) {
    return Object.entries(errors).find(([key]) => key.startsWith(prefix))?.[1];
}

/**
 * Psychotechnical test of the application: prepared with the AI, reviewed,
 * sent by WhatsApp or e-mail, then its score and the candidate's answers.
 */
export function PsychotestSection({
    application,
    aiBlockedReason,
}: {
    application: ApplicationFile;
    aiBlockedReason: string | null;
}) {
    const test = application.psychotest;
    const remove = test && (
        <DeleteButton
            action={destroyTest.form(application.id)}
            label="ce test psychotechnique"
            description="Le test et les réponses éventuelles du candidat seront supprimés. Vous pourrez en préparer un autre."
        />
    );

    return (
        <Box title="Test psychotechnique" actions={remove}>
            {test === null ? (
                <PrepareTest
                    applicationId={application.id}
                    analysed={application.analysis !== null}
                    aiBlockedReason={aiBlockedReason}
                />
            ) : test.status === 'draft' ? (
                <>
                    <QuestionEditor
                        key={test.questions.map((q) => q.id).join()}
                        applicationId={application.id}
                        questions={test.questions}
                    />
                    <SendTest application={application} test={test} />
                </>
            ) : test.status === 'completed' ? (
                <TestResult test={test} />
            ) : (
                <div className="space-y-4">
                    <p className="text-sm">
                        {test.status === 'expired' ? (
                            <span className="text-destructive">
                                {test.started_at
                                    ? 'Temps écoulé : le candidat a commencé le test sans l’envoyer.'
                                    : 'Lien expiré : le candidat n’a pas passé le test.'}{' '}
                                Supprimez-le pour en préparer un autre.
                            </span>
                        ) : test.status === 'started' ? (
                            `Le candidat a commencé le test le ${dateTime.format(new Date(test.started_at!))}.`
                        ) : (
                            `Envoyé le ${dateTime.format(new Date(test.sent_at!))}, valable jusqu’au ${dateFormat.format(new Date(test.expires_at!))}. En attente du candidat.`
                        )}
                    </p>
                    {test.status === 'sent' && (
                        <SendTest application={application} test={test} />
                    )}
                </div>
            )}
        </Box>
    );
}

function PrepareTest({
    applicationId,
    analysed,
    aiBlockedReason,
}: {
    applicationId: number;
    analysed: boolean;
    aiBlockedReason: string | null;
}) {
    return (
        <Form
            {...prepare.form(applicationId)}
            options={{ preserveScroll: true }}
            className="space-y-3"
        >
            {({ processing }) => (
                <>
                    <p className="text-sm text-muted-foreground">
                        Des QCM corrigés automatiquement : une base commune au
                        poste, rédigée une fois et partagée par ses candidats,
                        plus des questions tirées de l’analyse de ce candidat.
                        Vous les relisez avant l’envoi ; le candidat ne voit
                        jamais sa note.
                    </p>
                    {!analysed && (
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                            Le CV n’est pas encore analysé : seules les
                            questions communes au poste seront proposées.
                        </p>
                    )}
                    {aiBlockedReason && (
                        <p className="text-sm text-destructive">
                            {aiBlockedReason}
                        </p>
                    )}
                    <Button
                        type="submit"
                        disabled={processing || aiBlockedReason !== null}
                    >
                        {processing ? <Spinner /> : <Sparkles />}
                        {processing
                            ? 'Rédaction des questions…'
                            : 'Préparer le test avec l’IA'}
                    </Button>
                </>
            )}
        </Form>
    );
}

function blankQuestion(): PsychotestQuestion {
    return {
        id: '',
        text: '',
        options: ['', '', '', ''],
        answer: 0,
        category: '',
        source: 'manual',
    };
}

function QuestionEditor({
    applicationId,
    questions: initial,
}: {
    applicationId: number;
    questions: PsychotestQuestion[];
}) {
    const [questions, setQuestions] = useState(initial);
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const errors = usePage().props.errors as Record<string, string>;

    const edit = (index: number, patch: Partial<PsychotestQuestion>) => {
        setQuestions((current) =>
            current.map((q, i) => (i === index ? { ...q, ...patch } : q)),
        );
        setDirty(true);
    };

    const save = () =>
        router.put(
            updateTest.url(applicationId),
            { questions },
            {
                preserveScroll: true,
                onStart: () => setSaving(true),
                onFinish: () => setSaving(false),
            },
        );

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                {questions.length} questions. Cochez la bonne réponse de chaque
                question ; retirez ou ajoutez-en si besoin.
            </p>

            <ol className="space-y-4">
                {questions.map((question, index) => (
                    <li
                        key={question.id || `new-${index}`}
                        className="space-y-2 rounded-lg border p-3"
                    >
                        <div className="flex items-start gap-2">
                            <span className="pt-2 text-sm font-medium tabular-nums">
                                {index + 1}.
                            </span>
                            <Textarea
                                value={question.text}
                                rows={2}
                                maxLength={600}
                                onChange={(e) =>
                                    edit(index, { text: e.target.value })
                                }
                                aria-label={`Énoncé de la question ${index + 1}`}
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`Retirer la question ${index + 1}`}
                                onClick={() => {
                                    setQuestions((current) =>
                                        current.filter((_, i) => i !== index),
                                    );
                                    setDirty(true);
                                }}
                            >
                                <Trash2 className="text-destructive" />
                            </Button>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {question.options.map((option, o) => (
                                <label
                                    key={o}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <input
                                        type="radio"
                                        name={`answer-${index}`}
                                        checked={question.answer === o}
                                        onChange={() =>
                                            edit(index, { answer: o })
                                        }
                                        aria-label={`Bonne réponse : choix ${o + 1}`}
                                    />
                                    <Input
                                        value={option}
                                        maxLength={200}
                                        onChange={(e) =>
                                            edit(index, {
                                                options: question.options.map(
                                                    (value, i) =>
                                                        i === o
                                                            ? e.target.value
                                                            : value,
                                                ),
                                            })
                                        }
                                        aria-label={`Question ${index + 1}, choix ${o + 1}`}
                                        className={cn(
                                            question.answer === o &&
                                                'border-emerald-600',
                                        )}
                                    />
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {[question.category, sourceLabels[question.source]]
                                .filter(Boolean)
                                .join(' · ')}
                        </p>
                    </li>
                ))}
            </ol>

            <InputError
                message={errors.psychotest ?? firstError(errors, 'questions')}
            />

            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        setQuestions((current) => [
                            ...current,
                            blankQuestion(),
                        ]);
                        setDirty(true);
                    }}
                >
                    <Plus />
                    Ajouter une question
                </Button>
                <Button
                    type="button"
                    disabled={!dirty || saving}
                    onClick={save}
                >
                    {saving && <Spinner />}
                    Enregistrer les questions
                </Button>
                <Form
                    {...prepare.form(applicationId)}
                    options={{ preserveScroll: true }}
                >
                    {({ processing }) => (
                        <Button
                            type="submit"
                            variant="ghost"
                            disabled={processing}
                            title="Remplace les questions personnalisées ; la base du poste est conservée."
                        >
                            {processing ? <Spinner /> : <Sparkles />}
                            Nouvelles questions personnalisées
                        </Button>
                    )}
                </Form>
            </div>
            {dirty && (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                    Modifications non enregistrées : enregistrez-les avant
                    d’envoyer le test.
                </p>
            )}
        </div>
    );
}

function SendTest({
    application,
    test,
}: {
    application: ApplicationFile;
    test: Psychotest;
}) {
    const [copied, setCopied] = useState(false);
    const errors = usePage().props.errors as Record<string, string>;
    const resend = test.status !== 'draft';

    const open = (channel: 'whatsapp' | 'email' | 'link') =>
        router.post(
            send.url(application.id),
            { channel },
            { preserveScroll: true },
        );

    return (
        <div className="space-y-3 border-t pt-4">
            <p className="text-sm font-medium">
                {resend ? 'Renvoyer le lien' : 'Envoyer le test au candidat'}
            </p>
            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    disabled={!test.whatsapp_url}
                    onClick={() => {
                        // Ouvert pendant le clic, sinon le navigateur bloque l'onglet.
                        window.open(test.whatsapp_url!, '_blank', 'noopener');
                        open('whatsapp');
                    }}
                >
                    <MessageCircle />
                    WhatsApp
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    disabled={!application.candidate.email}
                    onClick={() => open('email')}
                >
                    <Mail />
                    E-mail
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        void navigator.clipboard.writeText(test.url);
                        setCopied(true);
                        open('link');
                    }}
                >
                    {copied ? <Check /> : <Copy />}
                    {copied ? 'Lien copié' : 'Copier le lien'}
                </Button>
            </div>
            {!test.whatsapp_url && (
                <p className="text-xs text-muted-foreground">
                    WhatsApp indisponible : aucun numéro de téléphone valide sur
                    la fiche du candidat.
                </p>
            )}
            <p className="text-xs text-muted-foreground">
                WhatsApp s’ouvre avec le message et le lien déjà écrits : il ne
                reste qu’à l’envoyer. Le candidat a {test.duration} minutes et
                une seule tentative.
            </p>
            <InputError message={errors.psychotest} />
        </div>
    );
}

function TestResult({ test }: { test: Psychotest }) {
    const answers = test.answers ?? {};
    const correct = test.questions.filter(
        (q) => answers[q.id] === q.answer,
    ).length;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <p className="text-3xl font-semibold tabular-nums">
                    {test.score}
                    <span className="text-base font-normal text-muted-foreground">
                        {' '}
                        / 100
                    </span>
                </p>
                <p className="text-sm text-muted-foreground">
                    {correct} bonne(s) réponse(s) sur {test.questions.length}
                    {test.minutes !== null &&
                        ` · ${test.minutes} min (limite ${test.duration})`}
                    {test.completed_at &&
                        ` · ${dateTime.format(new Date(test.completed_at))}`}
                </p>
            </div>

            <details>
                <summary className="cursor-pointer text-sm font-medium">
                    Voir les réponses du candidat
                </summary>
                <ol className="mt-3 space-y-3">
                    {test.questions.map((question, index) => {
                        const given = answers[question.id] ?? null;
                        const ok = given === question.answer;

                        return (
                            <li key={question.id} className="text-sm">
                                <p className="flex items-start gap-2 font-medium">
                                    {ok ? (
                                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                    ) : (
                                        <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                                    )}
                                    {index + 1}. {question.text}
                                </p>
                                <p className="pl-6 text-muted-foreground">
                                    {given === null
                                        ? 'Sans réponse'
                                        : `Réponse : ${question.options[given]}`}
                                    {!ok &&
                                        ` · attendue : ${question.options[question.answer]}`}
                                </p>
                            </li>
                        );
                    })}
                </ol>
            </details>
        </div>
    );
}

/**
 * Managing director's appraisal: each criterion scored from 1 to 5.
 */
export function DgSection({ application }: { application: ApplicationFile }) {
    const { dg } = application;
    const [scores, setScores] = useState(() =>
        dg.criteria.map(
            (criterion) =>
                dg.review?.find((r) => r.criterion === criterion)?.score ?? 0,
        ),
    );
    const [comment, setComment] = useState(dg.comment ?? '');
    const [saving, setSaving] = useState(false);
    const errors = usePage().props.errors as Record<string, string>;
    const complete = scores.every((s) => s > 0);
    const preview = complete
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 20)
        : null;

    const save = () =>
        router.put(
            updateDgReview.url(application.id),
            { scores, comment },
            {
                preserveScroll: true,
                onStart: () => setSaving(true),
                onFinish: () => setSaving(false),
            },
        );

    return (
        <Box
            title="Appréciation DG"
            actions={
                dg.score !== null && (
                    <span className="text-sm font-semibold tabular-nums">
                        {dg.score} / 100
                    </span>
                )
            }
        >
            {dg.reviewed_at && (
                <p className="text-xs text-muted-foreground">
                    Noté par {dg.reviewed_by ?? 'un ancien compte'} le{' '}
                    {dateTime.format(new Date(dg.reviewed_at))}
                </p>
            )}

            <ul className="space-y-2">
                {dg.criteria.map((criterion, index) => (
                    <li
                        key={criterion}
                        className="flex flex-wrap items-center justify-between gap-2"
                    >
                        <span className="text-sm">{criterion}</span>
                        <div
                            className="flex gap-1"
                            role="radiogroup"
                            aria-label={criterion}
                        >
                            {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    role="radio"
                                    aria-checked={scores[index] === value}
                                    onClick={() =>
                                        setScores((current) =>
                                            current.map((s, i) =>
                                                i === index ? value : s,
                                            ),
                                        )
                                    }
                                    className={cn(
                                        'size-8 rounded-md border text-sm tabular-nums transition-colors',
                                        scores[index] >= value
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'hover:bg-muted',
                                    )}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                    </li>
                ))}
            </ul>

            <Textarea
                value={comment}
                rows={3}
                maxLength={5000}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Commentaire du DG (facultatif)"
                aria-label="Commentaire du DG"
            />
            <InputError message={firstError(errors, 'scores')} />

            <div className="flex flex-wrap items-center gap-3">
                <Button
                    type="button"
                    disabled={!complete || saving}
                    onClick={save}
                >
                    {saving && <Spinner />}
                    Enregistrer l’appréciation
                </Button>
                <span className="text-sm text-muted-foreground">
                    {preview === null
                        ? 'Notez chaque critère de 1 à 5.'
                        : `Note DG : ${preview} / 100`}
                </span>
            </div>
        </Box>
    );
}
