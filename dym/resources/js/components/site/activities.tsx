import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { useInView } from '@/components/site/use-in-view';
import type { Activity } from '@/types/admin';

// « Chaudronnerie industrielle » → ["Chaudronnerie", "industrielle"] : le
// dernier mot passe à la ligne sur les cartes.
export const splitTitle = (title: string): [string, string] => {
    const cut = title.trim().lastIndexOf(' ');

    return cut > 0 ? [title.slice(0, cut), title.slice(cut + 1)] : [title, ''];
};

const titleLines = ['Quatre métiers,', 'une même exigence.'];

const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties;

export function Activities({ activities }: { activities: Activity[] }) {
    const [ref, inView] = useInView<HTMLElement>(0.15, false);
    const trackRef = useRef<HTMLDivElement>(null);

    // Défile d'une carte (utile sur mobile/tablette où les 4 ne tiennent pas).
    const scroll = (dir: 1 | -1) => {
        const track = trackRef.current;
        const card = track?.firstElementChild as HTMLElement | null;

        if (track && card) {
            track.scrollBy({
                left: dir * card.offsetWidth,
                behavior: 'smooth',
            });
        }
    };

    if (activities.length === 0) {
        return null;
    }

    return (
        <section ref={ref} id="activites" aria-labelledby="activites-title" className={`hx-root relative bg-paper px-5 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)] ${inView ? 'is-ready' : ''}`}>
            <div className="mx-auto max-w-[1720px] pt-16 pb-14 lg:pt-20 lg:pb-16">
                {/* En-tête */}
                <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:gap-10 lg:pl-[clamp(22px,3vw,52px)]">
                    <div>
                        <div className="hx-mono hx-fade mb-5 flex items-center gap-3 text-[10px] tracking-[0.075em] text-neutral-500" style={delay(0.05)}>
                            <span className="inline-block size-[5px] bg-dym" /> NOS ACTIVITÉS
                        </div>
                        <h2 id="activites-title" className="font-display text-[clamp(40px,9vw,56px)] leading-[0.95] text-ink uppercase lg:text-[clamp(44px,3.8vw,68px)]">
                            {titleLines.map((line, i) => (
                                <span key={line} className="hx-line -mt-[0.18em] -mb-[0.07em] block overflow-hidden pt-[0.18em] pb-[0.07em]">
                                    <span style={delay(0.12 + i * 0.12)}>
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
                        </h2>
                    </div>

                    <p className="hx-fade max-w-[440px] text-[15px] leading-[1.7] text-neutral-600" style={delay(0.35)}>
                        De la chaudronnerie industrielle aux ouvrages décoratifs, DYM Manufacture maîtrise l’ensemble de la chaîne de valeur métallique pour répondre à tous vos besoins.
                    </p>

                    <div className="hx-fade flex gap-2 lg:hidden" style={delay(0.4)}>
                        {([-1, 1] as const).map((dir) => (
                            <button
                                key={dir}
                                type="button"
                                onClick={() => scroll(dir)}
                                aria-label={dir < 0 ? 'Activité précédente' : 'Activité suivante'}
                                className="hx-hair grid size-11 cursor-pointer place-items-center border text-ink transition-colors hover:border-dym hover:bg-dym hover:text-white"
                            >
                                {dir < 0 ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cartes */}
                <div
                    ref={trackRef}
                    className="hx-hair mt-12 -mx-5 flex snap-x snap-mandatory overflow-x-auto border-y [scrollbar-width:none] sm:-mx-8 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible [&::-webkit-scrollbar]:hidden"
                >
                    {activities.map((a, i) => (
                        <article
                            key={a.id}
                            className={`hx-fade hx-hair group flex w-[82%] shrink-0 snap-start flex-col px-5 pt-7 pb-8 sm:w-[46%] sm:px-7 lg:w-auto ${i > 0 ? 'border-l' : ''}`}
                            style={delay(0.45 + i * 0.1)}
                        >
                            <span className="hx-mono text-[10px] text-dym">[ {String(i + 1).padStart(2, '0')} ]</span>
                            <h3 className="mt-3 font-display text-[26px] leading-[1.02] text-ink uppercase xl:text-[30px]">
                                {splitTitle(a.title)[0]}
                                <br />
                                {splitTitle(a.title)[1]}
                            </h3>

                            <div className="relative mt-6 aspect-[4/3] overflow-hidden bg-neutral-100">
                                <img
                                    src={a.image_url ?? undefined}
                                    alt={a.image_alt ?? a.title}
                                    width={1100}
                                    height={800}
                                    loading="lazy"
                                    className="size-full object-cover mix-blend-multiply grayscale contrast-[1.1] transition-[filter,transform] duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
                                />
                                {(['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'] as const).map((pos) => (
                                    <span key={pos} className={`hx-mono pointer-events-none absolute text-sm leading-none text-dym opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${pos}`} aria-hidden>
                                        +
                                    </span>
                                ))}
                            </div>

                            <p className="mt-5 flex-1 text-sm leading-relaxed text-neutral-600">{a.description}</p>

                            <a href="#contact" className="hx-mono mt-5 inline-flex items-center gap-2 self-start text-[10px] tracking-[0.1em] text-dym uppercase">
                                En savoir plus
                                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                            </a>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
