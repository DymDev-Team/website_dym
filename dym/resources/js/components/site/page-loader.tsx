import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { blueprints } from '@/components/site/blueprints';
import type { Draw } from '@/components/site/blueprints';
import { DymLogoDraw } from '@/components/site/dym-logo';
import { markSiteLoaded } from '@/components/site/site-loaded';
import { useTexts } from '@/components/site/use-texts';

// Durée minimale du tracé avant de lever le rideau (ms).
const MIN_DURATION = 2400;
// Au-delà, on lève le rideau même si la page n'a pas fini de charger.
const MAX_WAIT = 5000;
const EXIT_MS = 900;

// Affiché uniquement au premier chargement complet, pas lors des navigations Inertia.
let shownOnce = false;

const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties;

type Phase = 'loading' | 'leaving' | 'done';

export function PageLoader() {
    const [phase, setPhase] = useState<Phase>(() => (shownOnce ? 'done' : 'loading'));
    const [pct, setPct] = useState(0);
    const t = useTexts();

    // Progression : suit le temps écoulé, plafonnée à 90 % tant que la page charge.
    useEffect(() => {
        if (phase === 'done') {
            markSiteLoaded();

            return;
        }

        if (phase !== 'loading') {
            return;
        }

        shownOnce = true;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const min = reduce ? 300 : MIN_DURATION;
        const root = document.documentElement;
        root.style.overflow = 'hidden';

        let pageReady = document.readyState === 'complete';
        const onLoad = () => {
            pageReady = true;
        };
        window.addEventListener('load', onLoad);

        const start = performance.now();
        let frame = 0;
        const tick = (now: number) => {
            const elapsed = now - start;
            const cap = pageReady || elapsed > MAX_WAIT ? 1 : 0.9;
            const p = Math.min(cap, elapsed / min);
            setPct(Math.round(p * 100));

            if (p >= 1) {
                setPhase('leaving');

                return;
            }

            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('load', onLoad);
        };
    }, [phase]);

    // Sortie : le rideau remonte, le hero démarre son animation en même temps.
    useEffect(() => {
        if (phase !== 'leaving') {
            return;
        }

        markSiteLoaded();
        document.documentElement.style.overflow = '';
        const id = window.setTimeout(() => setPhase('done'), EXIT_MS);

        return () => window.clearTimeout(id);
    }, [phase]);

    if (phase === 'done') {
        return null;
    }

    const bp = blueprints.laser;
    const draw: Draw = (d) => ({ className: 'hx-draw', pathLength: 1, style: delay(d * 0.8) });

    return (
        <div
            role="status"
            aria-live="polite"
            aria-label={t('home.loader.label')}
            className={`fixed inset-0 z-[100] bg-ink text-white transition-transform duration-[900ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
                phase === 'leaving' ? '-translate-y-full' : 'translate-y-0'
            }`}
        >
            {/* Grille technique */}
            <div
                aria-hidden
                className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:48px_48px]"
            />

            <div className="hx-root is-ready relative flex h-full flex-col px-6 py-6 sm:px-10 sm:py-8">
                {/* Haut : logo + référence */}
                <div className="flex items-center justify-between">
                    <DymLogoDraw className="h-12 w-auto text-white sm:h-14" start={0.1} />
                    <span className="hx-mono text-[10px] tracking-[0.12em] text-white/40">FIG. 00 / ATELIER</span>
                </div>

                {/* Plan qui se trace */}
                <div className="flex flex-1 items-center justify-center">
                    <svg viewBox="0 0 520 270" className="h-auto w-full max-w-[780px] text-white" aria-hidden>
                        <g fill="none" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1">
                            {bp.parts(draw)}
                            <g strokeOpacity="0.35">
                                <line x1="40" y1="20" x2="484" y2="20" {...draw(1)} />
                                <line x1="40" y1="14" x2="40" y2="26" {...draw(1)} />
                                <line x1="484" y1="14" x2="484" y2="26" {...draw(1)} />
                                <line x1="510" y1="40" x2="510" y2="234" {...draw(1.1)} />
                                <line x1="20" y1="234" x2="500" y2="234" strokeDasharray="3 5" {...draw(0.2)} />
                            </g>
                        </g>
                        <g className="hx-mono" fill="currentColor" fillOpacity="0.55" fontSize="9">
                            <text x="520" y="137" transform="rotate(90 520 137)" textAnchor="middle">
                                {bp.height}
                            </text>
                        </g>
                    </svg>
                </div>

                {/* Bas : signature + compteur */}
                <div>
                    <div className="hx-mono mb-3 flex items-end justify-between text-[10px] tracking-[0.12em] text-white/50">
                        <span>{t('home.loader.signature')}</span>
                        <span>
                            {t('home.loader.loading')} <span className="font-display text-3xl tracking-normal text-white tabular-nums sm:text-4xl">{String(pct).padStart(3, '0')}</span>
                            <span className="text-dym"> %</span>
                        </span>
                    </div>
                    <div className="h-0.5 bg-white/10">
                        <div className="h-0.5 bg-dym transition-[width] duration-150" style={{ width: `${pct}%` }} />
                    </div>
                </div>
            </div>

            {/* Liseré couleur DYM sous le rideau pendant qu'il remonte */}
            <div aria-hidden className="absolute inset-x-0 -bottom-1 h-1 bg-dym" />
        </div>
    );
}
