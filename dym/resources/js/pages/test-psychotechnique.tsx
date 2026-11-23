import { Head, router } from '@inertiajs/react';
import { Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { start, submit } from '@/routes/psychotest';

type Question = { id: string; text: string; options: string[] };

type Props = {
    token: string;
    status: 'sent' | 'started' | 'completed' | 'expired';
    greeting: string;
    offer: string | null;
    count: number;
    duration: number;
    expires_at: string | null;
    seconds_left: number;
    questions: Question[];
};

type Answers = Record<string, number>;

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' });

// Réponses gardées sur l'appareil : un rechargement de page ne les perd pas.
function storageKey(token: string) {
    return `psychotest:${token}`;
}

function readAnswers(token: string): Answers {
    try {
        return JSON.parse(
            window.localStorage.getItem(storageKey(token)) ?? '{}',
        );
    } catch {
        return {};
    }
}

function writeAnswers(token: string, answers: Answers | null) {
    try {
        if (answers === null) {
            window.localStorage.removeItem(storageKey(token));
        } else {
            window.localStorage.setItem(
                storageKey(token),
                JSON.stringify(answers),
            );
        }
    } catch {
        // Stockage indisponible (navigation privée) : les réponses restent en mémoire.
    }
}

function Shell({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900">
            <Head title="Test psychotechnique" />
            <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
                <img
                    src="/images/logo-dym-couleur.svg"
                    alt="DYM Manufacture"
                    className="mb-8 h-12 w-auto"
                />
                {children}
            </div>
        </div>
    );
}

export default function PsychotestPage(props: Props) {
    const { status, greeting, offer, count, duration, expires_at } = props;

    if (status === 'completed') {
        return (
            <Shell>
                <h1 className="text-2xl font-semibold">Merci, {greeting}</h1>
                <p className="mt-4 text-neutral-700">
                    Vos réponses ont bien été envoyées à l’équipe de DYM
                    Manufacture, qui reviendra vers vous pour la suite du
                    recrutement.
                </p>
            </Shell>
        );
    }

    if (status === 'expired') {
        return (
            <Shell>
                <h1 className="text-2xl font-semibold">Test indisponible</h1>
                <p className="mt-4 text-neutral-700">
                    Le délai prévu pour ce test est dépassé. Si vous pensez
                    qu’il s’agit d’une erreur, répondez au message qui vous a
                    transmis ce lien.
                </p>
            </Shell>
        );
    }

    if (status === 'sent') {
        return (
            <Shell>
                <h1 className="text-2xl font-semibold">Bonjour {greeting},</h1>
                <p className="mt-2 text-neutral-600">
                    Test psychotechnique · {offer ?? 'Candidature spontanée'}
                </p>
                <ul className="mt-6 space-y-2 rounded-xl border border-neutral-200 bg-white p-5 text-neutral-800">
                    <li>
                        <strong>{count} questions</strong> à choix multiples :
                        une seule bonne réponse par question.
                    </li>
                    <li>
                        <strong>{duration} minutes</strong> à partir du moment
                        où vous commencez ; vos réponses sont envoyées
                        automatiquement à la fin du temps.
                    </li>
                    <li>
                        <strong>Une seule tentative</strong> : installez-vous au
                        calme et gardez cette page ouverte.
                    </li>
                    {expires_at && (
                        <li>
                            À passer avant le{' '}
                            {dateFormat.format(new Date(expires_at))}.
                        </li>
                    )}
                </ul>
                <button
                    type="button"
                    onClick={() =>
                        router.post(
                            start.url(props.token),
                            {},
                            { preserveScroll: true },
                        )
                    }
                    className="mt-8 w-full rounded-lg bg-neutral-900 px-6 py-4 text-lg font-medium text-white hover:bg-neutral-700 sm:w-auto"
                >
                    Commencer le test
                </button>
            </Shell>
        );
    }

    return <Questions {...props} />;
}

function Questions({ token, questions, seconds_left }: Props) {
    const [answers, setAnswers] = useState<Answers>(() => readAnswers(token));
    const [deadline] = useState(() => Date.now() + seconds_left * 1000);
    const [left, setLeft] = useState(seconds_left);
    const [sending, setSending] = useState(false);
    const sent = useRef(false);
    // Lu par le minuteur : l'envoi automatique part avec les dernières réponses.
    const latest = useRef(answers);

    const answered = questions.filter(
        (q) => answers[q.id] !== undefined,
    ).length;

    const send = () => {
        if (sent.current) {
            return;
        }

        sent.current = true;
        setSending(true);
        router.post(
            submit.url(token),
            { answers: latest.current },
            {
                onSuccess: () => writeAnswers(token, null),
                onFinish: () => setSending(false),
            },
        );
    };

    useEffect(() => {
        const timer = window.setInterval(() => {
            const remaining = Math.max(
                0,
                Math.round((deadline - Date.now()) / 1000),
            );
            setLeft(remaining);

            if (remaining === 0) {
                window.clearInterval(timer);
                send();
            }
        }, 1000);

        return () => window.clearInterval(timer);
    }, [deadline]);

    useEffect(() => {
        const warn = (event: BeforeUnloadEvent) => {
            if (!sent.current) {
                event.preventDefault();
            }
        };
        window.addEventListener('beforeunload', warn);

        return () => window.removeEventListener('beforeunload', warn);
    }, []);

    const choose = (id: string, option: number) => {
        const next = { ...latest.current, [id]: option };
        latest.current = next;
        setAnswers(next);
        writeAnswers(token, next);
    };

    const minutes = Math.floor(left / 60);
    const seconds = String(left % 60).padStart(2, '0');

    return (
        <Shell>
            <div className="sticky top-0 z-10 -mx-4 mb-6 flex items-center justify-between border-b border-neutral-200 bg-neutral-50/95 px-4 py-3 backdrop-blur">
                <span
                    className={`flex items-center gap-2 font-semibold tabular-nums ${left < 120 ? 'text-red-600' : ''}`}
                >
                    <Clock className="size-5" />
                    {minutes}:{seconds}
                </span>
                <span className="text-sm text-neutral-600">
                    {answered} / {questions.length} réponses
                </span>
            </div>

            <ol className="space-y-6">
                {questions.map((question, index) => (
                    <li
                        key={question.id}
                        className="rounded-xl border border-neutral-200 bg-white p-5"
                    >
                        <p className="font-medium">
                            {index + 1}. {question.text}
                        </p>
                        <div className="mt-4 grid gap-2">
                            {question.options.map((option, o) => {
                                const checked = answers[question.id] === o;

                                return (
                                    <label
                                        key={o}
                                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${checked ? 'border-neutral-900 bg-neutral-100' : 'border-neutral-200 hover:bg-neutral-50'}`}
                                    >
                                        <input
                                            type="radio"
                                            name={question.id}
                                            checked={checked}
                                            onChange={() =>
                                                choose(question.id, o)
                                            }
                                            className="mt-1"
                                        />
                                        <span>{option}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </li>
                ))}
            </ol>

            <div className="mt-8 space-y-3">
                {answered < questions.length && (
                    <p className="text-sm text-neutral-600">
                        {questions.length - answered} question(s) sans réponse.
                    </p>
                )}
                <button
                    type="button"
                    disabled={sending}
                    onClick={() => {
                        if (
                            answered === questions.length ||
                            window.confirm(
                                'Certaines questions sont sans réponse. Envoyer quand même ? Vous ne pourrez plus modifier vos réponses.',
                            )
                        ) {
                            send();
                        }
                    }}
                    className="w-full rounded-lg bg-neutral-900 px-6 py-4 text-lg font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
                >
                    {sending ? 'Envoi…' : 'Envoyer mes réponses'}
                </button>
            </div>
        </Shell>
    );
}
