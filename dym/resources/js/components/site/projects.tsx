import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useInView } from '@/components/site/use-in-view';
import type { Project } from '@/types/admin';
import { lines, useTexts, withDot } from '@/components/site/use-texts';
import { Link } from '@inertiajs/react';
import { realisations } from '@/routes';


const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties;

export function Projects({ projects }: { projects: Project[] }) {
    const [ref, inView] = useInView<HTMLElement>(0.15, false);
    const trackRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);
    const t = useTexts();
    const titleLines = lines(t('home.projects.title'));
    const [edges, setEdges] = useState({ start: true, end: false });

    // Suit la position de défilement (barre de progression + état des flèches).
    useEffect(() => {
        const track = trackRef.current;

        if (!track) {
            return;
        }

        const update = () => {
            const max = track.scrollWidth - track.clientWidth;
            setProgress(max > 0 ? track.scrollLeft / max : 0);
            setEdges({
                start: track.scrollLeft < 4,
                end: track.scrollLeft > max - 4,
            });
        };
        update();
        track.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);

        return () => {
            track.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, []);

    const scroll = (dir: 1 | -1) => {
        const track = trackRef.current;
        const card = track?.firstElementChild as HTMLElement | null;

        if (track && card) {
            track.scrollBy({
                left: dir * (card.offsetWidth + 12) * 2,
                behavior: 'smooth',
            });
        }
    };

    if (projects.length === 0) {
        return null;
    }

    return (
        <section ref={ref} id="realisations" aria-labelledby="realisations-title" className={`hx-root hx-dark hx-hair relative overflow-hidden border-t border-white/15 bg-ink text-white ${inView ? 'is-ready' : ''}`}>
            {/* En-tête */}
            <div className="px-5 pt-16 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)] lg:pt-20">
                <div className="mx-auto flex max-w-[1720px] flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:pl-[clamp(22px,3vw,52px)]">
                    <div>
                        <div className="hx-mono hx-fade mb-5 flex items-center gap-3 text-[10px] tracking-[0.075em] text-white/55" style={delay(0.05)}>
                            <span className="inline-block size-[5px] bg-dym" /> {t.c('home.projects.eyebrow')}
                        </div>
                        <h2 id="realisations-title" className="font-display text-[clamp(40px,9vw,56px)] leading-[0.95] text-white uppercase lg:text-[clamp(44px,3.8vw,68px)]">
                            {titleLines.map((line, i) => (
                                <span key={line} className="hx-line -mt-[0.18em] -mb-[0.07em] block overflow-hidden pt-[0.18em] pb-[0.07em]">
                                    <span style={delay(0.12 + i * 0.12)}>
                                        {t.c('home.projects.title', i === titleLines.length - 1 ? withDot(line) : line)}
                                    </span>
                                </span>
                            ))}
                        </h2>
                    </div>

                    <div className="hx-fade flex items-center gap-6" style={delay(0.35)}>
                        <Link href={realisations.url()} className="hx-mono group hidden items-center gap-2 text-[10px] tracking-[0.1em] text-dym uppercase sm:inline-flex">
                            {t.c('home.projects.link')}
                            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                        <div className="flex gap-2">
                            {([-1, 1] as const).map((dir) => {
                                const disabled = dir < 0 ? edges.start : edges.end;

                                return (
                                    <button
                                        key={dir}
                                        type="button"
                                        onClick={() => scroll(dir)}
                                        disabled={disabled}
                                        aria-label={dir < 0 ? 'Réalisations précédentes' : 'Réalisations suivantes'}
                                        className="hx-hair grid size-11 cursor-pointer place-items-center border border-white/20 text-white transition-colors hover:border-dym hover:bg-dym hover:text-white disabled:cursor-default disabled:opacity-35 disabled:hover:border-white/20 disabled:hover:bg-transparent disabled:hover:text-white"
                                    >
                                        {dir < 0 ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bande de photos : alignée à gauche sur le contenu, déborde à droite */}
            <div
                ref={trackRef}
                className="mt-10 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto scroll-smooth px-5 pb-2 [scrollbar-width:none] sm:scroll-px-8 sm:px-8 lg:mt-12 lg:scroll-px-[calc(max(clamp(24px,3.15vw,58px),(100vw-1720px)/2)+clamp(22px,3vw,52px))] lg:px-[calc(max(clamp(24px,3.15vw,58px),(100vw-1720px)/2)+clamp(22px,3vw,52px))] [&::-webkit-scrollbar]:hidden"
            >
                {projects.map((p, i) => (
                    <figure key={p.id} className="group m-0 w-[78vw] shrink-0 snap-start sm:w-[44vw] lg:w-[clamp(260px,18.5vw,360px)]">
                        <div className="hx-wipe relative aspect-[4/5] overflow-hidden bg-neutral-100" style={delay(0.3 + Math.min(i, 5) * 0.12)}>
                            <img
                                src={p.image_url ?? undefined}
                                alt={`${p.title} — ${p.category}`}
                                width={1000}
                                height={750}
                                loading="lazy"
                                draggable={false}
                                className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            <span className="hx-mono absolute top-3 left-3 bg-ink/90 px-2 py-1 text-[9px] text-white">{String(i + 1).padStart(2, '0')}</span>
                            <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/55 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        </div>
                        <figcaption className="hx-fade mt-4 flex items-start justify-between gap-3" style={delay(0.5 + Math.min(i, 5) * 0.12)}>
                            <div>
                                <p className="text-[15px] font-semibold text-white">{p.title}</p>
                                <p className="hx-mono mt-1 text-[10px] tracking-[0.08em] text-white/55 uppercase">{p.category}</p>
                            </div>
                            <ArrowRight className="mt-1 size-4 shrink-0 -translate-x-1 text-dym opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                        </figcaption>
                    </figure>
                ))}
            </div>

            {/* Progression */}
            <div className="px-5 pt-8 pb-16 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)] lg:pb-20">
                <div className="mx-auto flex max-w-[1720px] items-center gap-4 lg:pl-[clamp(22px,3vw,52px)]">
                    <span className="hx-mono text-[10px] text-white/55">01</span>
                    <div className="relative h-px flex-1 bg-white/20">
                        <span className="absolute inset-y-0 left-0 bg-dym transition-[width] duration-200" style={{ width: `${Math.max(8, progress * 100)}%` }} />
                    </div>
                    <span className="hx-mono text-[10px] text-white/55">{String(projects.length).padStart(2, '0')}</span>
                </div>
            </div>
        </section>
    );
}
