import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { answer, leave, start } from '@/routes/psychotest';

type Question = { id: string; text: string; options: string[] };

type Props = {
    token: string;
    status: 'sent' | 'started' | 'completed' | 'expired' | 'other_device';
    greeting: string;
    offer: string | null;
    count: number;
    question_seconds: number;
    expires_at: string | null;
    exits: number;
    index: number;
    question: Question | null;
    seconds_left: number;
};

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' });

// Absence plus courte (notification balayée) : pas une sortie.
const TOLERANCE_MS = 3000;

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

function Message({ title, children }: { title: string; children: ReactNode }) {
    return (
        <Shell>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="mt-4 text-neutral-700">{children}</p>
        </Shell>
    );
}

export default function PsychotestPage(props: Props) {
    const { status, greeting, offer, count, question_seconds, expires_at } =
        props;

    if (status === 'completed') {
        return (
            <Message title={`Merci, ${greeting}`}>
                Le test est terminé et vos réponses ont été transmises à
                l’équipe de DYM Manufacture, qui reviendra vers vous pour la
                suite du recrutement.
            </Message>
        );
    }

    if (status === 'expired') {
        return (
            <Message title="Test indisponible">
                Le délai prévu pour ce test est dépassé. Si vous pensez qu’il
                s’agit d’une erreur, répondez au message qui vous a transmis ce
                lien.
            </Message>
        );
    }

    if (status === 'other_device') {
        return (
            <Message title="Test commencé sur un autre appareil">
                Ce test ne peut se poursuivre que sur l’appareil et le
                navigateur où il a été commencé.
            </Message>
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
                        <strong>{count} questions</strong> à choix multiples,
                        une seule bonne réponse par question.
                    </li>
                    <li>
                        <strong>Une question à la fois</strong>,{' '}
                        <strong>{question_seconds} secondes</strong> chacune,
                        sans retour en arrière : une question sans réponse à la
                        fin du temps compte comme fausse.
                    </li>
                    <li>
                        <strong>Restez sur cette page</strong> : si vous la
                        quittez (autre application, autre onglet), vous recevez
                        un avertissement ; la deuxième fois, le test s’arrête.
                    </li>
                    <li>
                        <strong>Une seule tentative</strong>, sur cet appareil
                        uniquement. Installez-vous au calme avant de commencer.
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
                    onClick={() => router.post(start.url(props.token))}
                    className="mt-8 w-full rounded-lg bg-neutral-900 px-6 py-4 text-lg font-medium text-white hover:bg-neutral-700 sm:w-auto"
                >
                    Commencer le test
                </button>
            </Shell>
        );
    }

    return props.question ? (
        <QuestionScreen
            key={props.question.id}
            {...props}
            question={props.question}
        />
    ) : null;
}

function QuestionScreen({
    token,
    count,
    exits,
    index,
    question,
    seconds_left,
}: Props & { question: Question }) {
    const [choice, setChoice] = useState<number | null>(null);
    const [deadline] = useState(() => Date.now() + seconds_left * 1000);
    const [left, setLeft] = useState(seconds_left);
    const [sending, setSending] = useState(false);
    const sent = useRef(false);
    const chosen = useRef<number | null>(null);

    const send = (option: number | null) => {
        if (sent.current) {
            return;
        }

        sent.current = true;
        setSending(true);
        router.post(answer.url(token), { question_id: question.id, option });
    };

    // Fin du temps : la réponse choisie (ou aucune) part toute seule.
    useEffect(() => {
        const timer = window.setInterval(() => {
            const remaining = Math.max(
                0,
                Math.round((deadline - Date.now()) / 1000),
            );
            setLeft(remaining);

            if (remaining === 0) {
                window.clearInterval(timer);
                send(chosen.current);
            }
        }, 500);

        return () => window.clearInterval(timer);
    }, [deadline]);

    useLeaveWatcher(token);
    useWakeLock();

    return (
        <Shell>
            <div className="sticky top-0 z-10 -mx-4 mb-6 flex items-center justify-between border-b border-neutral-200 bg-neutral-50/95 px-4 py-3 backdrop-blur">
                <span className="text-sm text-neutral-600">
                    Question {index + 1} / {count}
                </span>
                <span
                    className={`flex items-center gap-2 font-semibold tabular-nums ${left <= 10 ? 'text-red-600' : ''}`}
                >
                    <Clock className="size-5" />
                    {left} s
                </span>
            </div>

            {exits > 0 && (
                <p className="mb-6 flex items-start gap-2 rounded-lg bg-amber-100 p-3 text-sm text-amber-900">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    Vous avez quitté la page. À la prochaine sortie, le test
                    s’arrêtera.
                </p>
            )}

            <div className="rounded-xl border border-neutral-200 bg-white p-5 select-none">
                <p className="text-lg font-medium">{question.text}</p>
                <div className="mt-5 grid gap-2">
                    {question.options.map((option, o) => (
                        <label
                            key={o}
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${choice === o ? 'border-neutral-900 bg-neutral-100' : 'border-neutral-200 hover:bg-neutral-50'}`}
                        >
                            <input
                                type="radio"
                                name={question.id}
                                checked={choice === o}
                                onChange={() => {
                                    chosen.current = o;
                                    setChoice(o);
                                }}
                                className="mt-1"
                            />
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
            </div>

            <button
                type="button"
                disabled={choice === null || sending}
                onClick={() => send(choice)}
                className="mt-6 w-full rounded-lg bg-neutral-900 px-6 py-4 text-lg font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
            >
                {sending
                    ? 'Envoi…'
                    : index + 1 === count
                      ? 'Valider et terminer'
                      : 'Valider et passer à la suite'}
            </button>
        </Shell>
    );
}

/**
 * Reports each time the candidate leaves the page (other tab, other app,
 * other window) for more than a few seconds; the server decides.
 */
function useLeaveWatcher(token: string) {
    useEffect(() => {
        let awaySince: number | null = null;

        const away = () => {
            awaySince ??= Date.now();
        };

        const back = () => {
            if (document.hidden || !document.hasFocus() || awaySince === null) {
                return;
            }

            const duration = Date.now() - awaySince;
            awaySince = null;

            if (duration >= TOLERANCE_MS) {
                router.post(leave.url(token), {
                    seconds: Math.round(duration / 1000),
                });
            }
        };

        const visibility = () => (document.hidden ? away() : back());

        document.addEventListener('visibilitychange', visibility);
        window.addEventListener('blur', away);
        window.addEventListener('focus', back);

        return () => {
            document.removeEventListener('visibilitychange', visibility);
            window.removeEventListener('blur', away);
            window.removeEventListener('focus', back);
        };
    }, [token]);
}

/**
 * Keeps the phone screen on during the test, where the browser allows it:
 * a screen going to sleep would count as leaving the page.
 */
function useWakeLock() {
    useEffect(() => {
        let lock: WakeLockSentinel | null = null;

        const request = () => {
            if (
                document.visibilityState === 'visible' &&
                'wakeLock' in navigator
            ) {
                navigator.wakeLock
                    .request('screen')
                    .then((sentinel) => {
                        lock = sentinel;
                    })
                    .catch(() => {});
            }
        };

        request();
        document.addEventListener('visibilitychange', request);

        return () => {
            document.removeEventListener('visibilitychange', request);
            void lock?.release();
        };
    }, []);
}
