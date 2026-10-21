import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useSiteLoaded } from '@/components/site/site-loaded';
import { create as quoteCreate } from '@/routes/quotes';
import type { SiteSettings } from '@/types/admin';

const petals = Array.from({ length: 22 }, (_, index) => ({
    left: `${(index * 47 + 9) % 100}%`,
    delay: `${-((index * 1.73) % 8)}s`,
    duration: `${7 + (index % 5)}s`,
    drift: `${((index % 7) - 3) * 34}px`,
    color: ['#766f65', '#b6a78d', '#d9c8a8', '#eee4d3'][index % 4],
    size: 8 + (index % 5) * 2,
}));

export function AnniversaryModal() {
    const loaded = useSiteLoaded();
    const logo = usePage<{ siteSettings?: SiteSettings }>().props.siteSettings?.logo_url;
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
        window.setTimeout(() => setPetalsVisible(false), 6500);
    }

    if (!open && !petalsVisible) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-[110] overflow-hidden" aria-hidden={!open}>
            {petalsVisible && (
                <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
                    {petals.map((petal, index) => (
                        <span
                            key={index}
                            className="dym-anniversary-petal absolute -top-5 rounded-[85%_0_85%_0] opacity-0 shadow-sm"
                            style={{
                                left: petal.left,
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
                    className="pointer-events-auto absolute inset-0 grid place-items-center bg-ink/65 px-5 py-8 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) close();
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="anniversary-title"
                        className="relative w-full max-w-xl overflow-hidden border border-dym/30 bg-paper px-7 py-12 text-center shadow-2xl sm:px-14 sm:py-16"
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

                        <div className="mx-auto mb-7 grid size-24 place-items-center rounded-full border border-dym/25 bg-white p-4 shadow-[0_8px_30px_rgb(20_20_20/0.08)]">
                            <img src={logo || '/images/logo-dym-couleur.svg'} alt="DYM Manufacture" className="max-h-full w-full object-contain" />
                        </div>
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
