import { Link } from '@inertiajs/react';
import { ArrowRight, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useSiteLoaded } from '@/components/site/site-loaded';
import { create as quoteCreate } from '@/routes/quotes';

const petals = Array.from({ length: 30 }, (_, index) => ({
    left: `${(index * 47 + 9) % 100}%`,
    delay: `${-((index * 1.73) % 9)}s`,
    duration: `${7 + (index % 5)}s`,
    drift: `${((index % 7) - 3) * 38}px`,
    top: `${(index * 37 + 8) % 90}%`,
    color: ['#c99e54', '#e6bd70', '#f1dfbd', '#d28b73', '#fff0d2'][index % 5],
    size: 10 + (index % 5) * 2,
}));

const confetti = Array.from({ length: 46 }, (_, index) => ({
    left: `${(index * 61 + 13) % 100}%`,
    delay: `${-((index * 1.37) % 5)}s`,
    duration: `${3.8 + (index % 5) * 0.55}s`,
    drift: `${((index % 9) - 4) * 22}px`,
    color: ['#d9ae64', '#f0d8a8', '#d28b73', '#ffffff'][index % 4],
    rotate: `${(index * 53) % 360}deg`,
}));

export function AnniversaryModal() {
    const loaded = useSiteLoaded();
    const [open, setOpen] = useState(false);
    const [petalsVisible, setPetalsVisible] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!loaded) return;

        let alreadySeen = false;
        try {
            alreadySeen = window.sessionStorage.getItem('dym-anniversary-modal-seen') === 'true';
        } catch {
            // La modale reste disponible si le navigateur bloque le stockage de session.
        }

        if (alreadySeen) return;

        const timer = window.setTimeout(() => {
            setOpen(true);
            setPetalsVisible(true);
            try {
                window.sessionStorage.setItem('dym-anniversary-modal-seen', 'true');
            } catch {
                // Le bouton de fermeture reste fonctionnel sans stockage de session.
            }
        }, 1100);

        return () => window.clearTimeout(timer);
    }, [loaded]);

    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') close();
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);
        closeRef.current?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    function close() {
        setOpen(false);
        window.setTimeout(() => setPetalsVisible(false), 9500);
    }

    if (!open && !petalsVisible) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-[110] overflow-hidden" aria-hidden={!open}>
            {open && (
                <button
                    type="button"
                    aria-label="Fermer la fenêtre anniversaire"
                    className="pointer-events-auto absolute inset-0 z-0 cursor-default bg-ink/50 backdrop-blur-[3px]"
                    onClick={close}
                />
            )}
            {petalsVisible && (
                <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
                    {confetti.map((piece, index) => (
                        <span
                            key={`confetti-${index}`}
                            className="dym-anniversary-confetti absolute -top-4 h-3 w-1.5 rounded-sm opacity-0"
                            style={{
                                left: piece.left,
                                backgroundColor: piece.color,
                                animationDelay: piece.delay,
                                animationDuration: piece.duration,
                                '--confetti-drift': piece.drift,
                                '--confetti-rotate': piece.rotate,
                            } as CSSProperties}
                        />
                    ))}
                    {petals.map((petal, index) => (
                        <span
                            key={`petal-${index}`}
                            className="dym-anniversary-petal absolute rounded-[85%_0_85%_0] opacity-0 shadow-sm"
                            style={{
                                left: petal.left,
                                top: petal.top,
                                width: petal.size,
                                height: petal.size * 1.65,
                                backgroundColor: petal.color,
                                animationDelay: petal.delay,
                                animationDuration: petal.duration,
                                '--petal-drift': petal.drift,
                            } as CSSProperties}
                        />
                    ))}
                </div>
            )}

            {open && (
                <div
                    className="pointer-events-none absolute inset-0 z-20 grid place-items-center px-4 py-4 sm:px-6 sm:py-8"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) close();
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="anniversary-title"
                        className="dym-anniversary-card pointer-events-auto relative max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto border border-dym/30 bg-paper px-6 py-9 text-center shadow-2xl sm:px-14 sm:py-14"
                        onKeyDown={(event) => {
                            if (event.key !== 'Tab') return;

                            const focusable = event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]');
                            const first = focusable[0];
                            const last = focusable[focusable.length - 1];

                            if (event.shiftKey && document.activeElement === first) {
                                event.preventDefault();
                                last?.focus();
                            } else if (!event.shiftKey && document.activeElement === last) {
                                event.preventDefault();
                                first?.focus();
                            }
                        }}
                    >
                        <button
                            ref={closeRef}
                            type="button"
                            onClick={close}
                            aria-label="Fermer"
                            className="absolute top-4 right-4 grid size-10 place-items-center text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dym"
                        >
                            <X className="size-5" />
                        </button>

                        <img
                            src="/images/logo-dym-10-ans.jpeg"
                            alt="DYM Manufacture — 10 ans"
                            width={2560}
                            height={2340}
                            className="mx-auto mb-6 h-auto w-full max-w-[300px]"
                        />
                        <p className="font-mono text-[10px] tracking-[0.22em] text-dym uppercase">Une décennie de savoir-faire</p>
                        <h2 id="anniversary-title" className="mt-3 font-display text-[clamp(52px,13vw,82px)] leading-[0.9] text-ink uppercase">
                            10 <span className="text-dym">ans</span>
                        </h2>
                        <p className="mx-auto mt-6 max-w-sm text-sm leading-7 text-neutral-600 sm:text-base">
                            Dix ans à concevoir, fabriquer et donner vie à vos projets métalliques. Merci de faire partie de l’aventure DYM Manufacture.
                        </p>
                        <Link
                            href={quoteCreate()}
                            onClick={close}
                            className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 bg-dym px-7 py-4 text-[11px] font-semibold tracking-[0.15em] text-white uppercase transition-colors hover:bg-dym-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dym"
                        >
                            Discutons de votre projet <ArrowRight className="size-4" />
                        </Link>
                    </section>
                </div>
            )}
        </div>
    );
}
