import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { useInView } from '@/components/site/use-in-view';
import type { Testimonial } from '@/types/admin';

const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties;

const initials = (name: string) =>
    name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
    const [ref, inView] = useInView<HTMLElement>(0.2, false);
    const trackRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 1 | -1) => {
        const track = trackRef.current;
        const card = track?.firstElementChild as HTMLElement | null;

        if (track && card) {
            track.scrollBy({
                left: dir * (card.offsetWidth + 16),
                behavior: 'smooth',
            });
        }
    };

    if (testimonials.length === 0) {
        return null;
    }

    return (
        <section ref={ref} id="temoignages" aria-labelledby="temoignages-title" className={`hx-root hx-hair relative border-t bg-paper px-5 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)] ${inView ? 'is-ready' : ''}`}>
            <div className="mx-auto max-w-[1720px] py-14 lg:py-16 lg:pl-[clamp(22px,3vw,52px)]">
                {/* En-tête compact */}
                <div className="flex flex-wrap items-end justify-between gap-5">
                    <div>
                        <div className="hx-mono hx-fade mb-4 flex items-center gap-3 text-[10px] tracking-[0.075em] text-neutral-500" style={delay(0.05)}>
                            <span className="inline-block size-[5px] bg-dym" /> TÉMOIGNAGES
                        </div>
                        <h2 id="temoignages-title" className="font-display text-[clamp(34px,7vw,44px)] leading-[0.95] text-ink uppercase lg:text-[clamp(36px,2.8vw,50px)]">
                            <span className="hx-line -mt-[0.18em] -mb-[0.07em] block overflow-hidden pt-[0.18em] pb-[0.07em]">
                                <span style={delay(0.12)}>
                                    Ils parlent de nous
                                    <span className="text-dym">.</span>
                                </span>
                            </span>
                        </h2>
                    </div>
                    <div className="hx-fade flex gap-2 lg:hidden" style={delay(0.3)}>
                        {([-1, 1] as const).map((dir) => (
                            <button
                                key={dir}
                                type="button"
                                onClick={() => scroll(dir)}
                                aria-label={dir < 0 ? 'Témoignage précédent' : 'Témoignage suivant'}
                                className="hx-hair grid size-10 cursor-pointer place-items-center border text-ink transition-colors hover:border-dym hover:bg-dym hover:text-white"
                            >
                                {dir < 0 ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cartes */}
                <div
                    ref={trackRef}
                    className="-mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:mt-10 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
                >
                    {testimonials.map((t, i) => {
                        const dark = i === 1;

                        return (
                            <figure
                                key={t.id}
                                className={`hx-fade group m-0 flex w-[84%] shrink-0 snap-start flex-col border transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgb(20_20_20/0.12)] sm:w-[60%] lg:w-auto ${
                                    dark ? 'border-ink bg-ink text-white' : 'hx-hair bg-white/60 text-ink hover:border-dym/40'
                                }`}
                                style={delay(0.25 + i * 0.12)}
                            >
                                {/* Photo du projet */}
                                <div className="relative h-36">
                                    <div className="absolute inset-0 overflow-hidden">
                                        <img
                                            src={t.image_url ?? '/images/hero/atelier-dym.jpg'}
                                            alt=""
                                            loading="lazy"
                                            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        />
                                        <span className="absolute inset-0 bg-linear-to-t from-ink/60 to-transparent" aria-hidden />
                                    </div>
                                    <span className="hx-mono absolute bottom-3 left-4 text-[9px] tracking-[0.1em] text-white uppercase">{t.project}</span>
                                    <span className="absolute right-4 -bottom-5 grid size-10 place-items-center bg-dym text-white shadow-[0_6px_16px_rgb(241_90_34/0.35)]" aria-hidden>
                                        <Quote className="size-4 fill-white" strokeWidth={0} />
                                    </span>
                                </div>

                                <blockquote className={`m-0 flex-1 px-5 pt-7 pb-5 text-[15px] leading-[1.65] ${dark ? 'text-white/85' : 'text-neutral-700'}`}>« {t.quote} »</blockquote>

                                <figcaption className={`mx-5 flex items-center gap-3 border-t py-4 ${dark ? 'border-white/15' : 'border-ink/10'}`}>
                                    <span className={`grid size-9 shrink-0 place-items-center rounded-full font-display text-sm ${dark ? 'bg-white text-ink' : 'bg-ink text-white'}`}>{initials(t.author)}</span>
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-semibold">{t.author}</span>
                                        <span className={`hx-mono block truncate text-[9px] tracking-[0.08em] uppercase ${dark ? 'text-white/50' : 'text-neutral-500'}`}>{t.role}</span>
                                    </span>
                                </figcaption>
                            </figure>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
