import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { useInView } from '@/components/site/use-in-view';
import { useParallax } from '@/components/site/use-parallax';

// Hero inspiré de « linea terra/linea-hero-v2 » : texte, engagements et
// animations d'entrée.

const benefits = [
    { symbol: '◇', label: ['Bureau d’études', '& plans'] },
    { symbol: '⌗', label: ['Devis & suivi', 'transparents'] },
    { symbol: '⊙', label: ['Fabrication', 'sur mesure'] },
];

const titleLines = ['Des hommes', 'et des machines.'];

const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties;

export function Hero() {
    // Animations rejouées à chaque retour dans l'écran + photo en parallaxe légère.
    const [ref, ready] = useInView<HTMLElement>(0.2, false);
    const photoRef = useRef<HTMLImageElement>(null);
    useParallax(ref, photoRef, 24, 1.08);

    return (
        <section ref={ref} id="accueil" aria-labelledby="hero-title" className={`hx-root relative isolate overflow-hidden bg-paper px-3 sm:px-5 lg:px-[clamp(24px,3.15vw,58px)] ${ready ? 'is-ready' : ''}`}>
            <div className="hx-mono hx-fade mx-auto flex h-11 max-w-[1720px] items-center justify-between gap-2 text-[9px] tracking-[0.07em] text-neutral-500" style={delay(0.1)} aria-hidden>
                <span>DYM / FABRICATION MÉTALLIQUE</span>
                <span className="hidden sm:inline">ÉTUDE TECHNIQUE — 001</span>
            </div>

            <div className="hx-hair relative isolate mx-auto flex max-w-[1720px] overflow-hidden border-y lg:min-h-[min(640px,calc(100svh-186px))]">
                {/* Photo atelier en arrière-plan */}
                <div className="hx-fade absolute inset-0 -z-10 hidden lg:left-[30%] lg:block" style={delay(0.2)} aria-hidden>
                    <img
                        ref={photoRef}
                        src="/images/hero/atelier-dym.jpg"
                        alt=""
                        width={2000}
                        height={1444}
                        fetchPriority="high"
                        className="size-full scale-[1.08] object-cover object-[55%_center] will-change-transform"
                    />
                </div>
                {/* Voile papier : opaque sous le texte, transparent sur la photo */}
                <div className="absolute inset-0 -z-10 hidden bg-linear-to-r from-paper from-35% via-paper/75 via-48% to-transparent to-62% lg:block" aria-hidden />
                <span className="hx-mono hx-fade absolute right-5 bottom-5 hidden items-center gap-2 bg-paper/90 px-2.5 py-2 text-[9px] tracking-[0.06em] text-ink lg:flex" style={delay(1.15)}>
                    <span className="size-[5px] bg-dym" /> ATELIER DYM — ABIDJAN
                </span>

                {/* Texte */}
                <div className="relative flex w-full min-w-0 flex-col justify-between lg:w-[58%]">
                    <div className="hx-mono hx-hair hx-fade flex h-10 items-center justify-between gap-2.5 border-b px-3.5 text-[8px] tracking-[0.04em] text-neutral-500 sm:px-6 sm:text-[9px]" style={delay(0.23)}>
                        <span className="flex items-center gap-2.5">
                            01 <i className="block h-px w-4 bg-dym" /> ACCUEIL
                        </span>
                        <span className="text-right lg:hidden">CONCEPTION • USINAGE • FABRICATION</span>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col justify-center px-[17px] pt-11 pb-12 sm:px-7 lg:px-[clamp(22px,3vw,52px)] lg:pt-[clamp(20px,2.5vw,40px)] lg:pb-7">
                        <div className="hx-mono hx-fade mb-6 flex items-center gap-3 text-[10px] tracking-[0.075em] text-neutral-500 lg:mb-[clamp(18px,3vh,32px)]" style={delay(0.35)}>
                            <span className="inline-block size-[5px] bg-dym" /> FABRICATION MÉTALLIQUE &amp; INDUSTRIELLE
                        </div>

                        <h1 id="hero-title" className="mb-5 font-display text-[clamp(48px,11vw,72px)] leading-[0.95] text-ink uppercase lg:mb-[clamp(16px,2.5vh,32px)] lg:text-[clamp(48px,4.4vw,80px)]">
                            {titleLines.map((line, i) => (
                                <span key={line} className="hx-line -mt-[0.18em] -mb-[0.07em] block overflow-hidden pt-[0.18em] pb-[0.07em]">
                                    <span style={delay(0.42 + i * 0.12)}>
                                        {i === titleLines.length - 1 ? (
                                            <>
                                                {line.slice(0, -1)}
                                                <span className="text-dym">.</span>
                                            </>
                                        ) : (
                                            line
                                        )}
                                    </span>
                                </span>
                            ))}
                        </h1>

                        <div className="hx-divider h-px bg-ink/20" />

                        <div className="hx-fade my-7 grid gap-3 sm:grid-cols-[120px_1fr] sm:gap-4 lg:my-[clamp(18px,2.8vh,30px)] xl:grid-cols-[110px_1fr]" style={delay(0.88)}>
                            <span className="hx-mono pt-1 text-[9px] leading-relaxed whitespace-nowrap text-dym">[ NOTRE MÉTIER ]</span>
                            <p className="max-w-[430px] text-sm leading-[1.67] text-neutral-600 lg:text-[clamp(13px,1.03vw,17px)]">
                                DYM Manufacture accompagne les entreprises et les particuliers dans la réalisation d’ouvrages métalliques robustes, esthétiques et de haute qualité — de l’étude à la pose.
                            </p>
                        </div>

                        <a
                            href="#activites"
                            className="hx-button hx-fade hx-mono relative inline-flex min-h-[58px] w-full items-center justify-between gap-11 self-start overflow-hidden border border-ink bg-ink py-[15px] pr-[18px] pl-[21px] text-[10px] tracking-[0.055em] text-paper sm:w-auto sm:min-w-[340px]"
                            style={delay(1.03)}
                        >
                            <span className="relative z-[1]">DÉCOUVRIR NOS ACTIVITÉS</span>
                            <span className="hx-arrow relative z-[1] font-sans text-2xl transition-transform duration-300" aria-hidden>
                                ↗
                            </span>
                        </a>
                    </div>

                    {/* Photo atelier en bloc (mobile/tablette) */}
                    <figure className="hx-fade hx-hair relative m-0 aspect-[4/3] overflow-hidden border-t sm:aspect-[16/9] lg:hidden" style={delay(0.9)}>
                        <img
                            src="/images/hero/atelier-dym.jpg"
                            alt="Soudeur DYM meulant une pièce métallique dans l’atelier"
                            width={2000}
                            height={1444}
                            loading="lazy"
                            className="size-full object-cover object-[55%_center]"
                        />
                        <figcaption className="hx-mono absolute bottom-3 left-3 flex items-center gap-2 bg-paper/90 px-2.5 py-1.5 text-[9px] tracking-[0.06em] text-ink">
                            <span className="size-[5px] bg-dym" /> ATELIER DYM — ABIDJAN
                        </figcaption>
                    </figure>

                    <div className="hx-hair hx-fade grid border-t sm:min-h-[76px] sm:grid-cols-3 lg:min-h-20" style={delay(1.1)} aria-label="Nos engagements">
                        {benefits.map((b, i) => (
                            <div
                                key={b.symbol}
                                className={`hx-mono hx-hair flex items-center gap-4 px-[18px] py-3 text-[11px] leading-relaxed sm:gap-3 sm:px-[clamp(9px,1.5vw,24px)] sm:py-3.5 ${i > 0 ? 'border-t sm:border-t-0 sm:border-l' : ''}`}
                            >
                                <span className="font-sans text-[25px] text-dym">{b.symbol}</span>
                                <span>
                                    {b.label[0]}
                                    <br className="hidden sm:inline" /> {b.label[1]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="hx-mono hx-fade mx-auto flex h-11 max-w-[1720px] items-center justify-between gap-4 text-[8px] tracking-[0.05em] text-neutral-500 sm:text-[9px]" style={delay(1.15)}>
                <span>DYM MANUFACTURE — ABIDJAN</span>
                <span className="flex items-center gap-3">
                    FAIRE DÉFILER{' '}
                    <span className="hx-scroll-arrow text-[17px] text-dym" aria-hidden>
                        ↓
                    </span>
                </span>
                <span className="hidden sm:inline">© DYM MANUFACTURE</span>
            </div>
        </section>
    );
}
