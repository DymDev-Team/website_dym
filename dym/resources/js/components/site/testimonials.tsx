import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { useInView } from '@/components/site/use-in-view';
import { useSectionColor } from '@/components/site/use-section-color';
import TestimonialCard from '@/components/ui/card-08';
import type { Testimonial } from '@/types/admin';
import { useTexts, withDot } from '@/components/site/use-texts';

const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties;

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
    const sectionStyle = useSectionColor('testimonials');
    const [ref, inView] = useInView<HTMLElement>(0.2, false);
    const trackRef = useRef<HTMLDivElement>(null);
    const t = useTexts();

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
        <section ref={ref} style={sectionStyle} id="temoignages" aria-labelledby="temoignages-title" className={`hx-root hx-hair relative border-t bg-paper px-5 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)] ${inView ? 'is-ready' : ''}`}>
            <div className="mx-auto max-w-[1720px] py-14 lg:py-16 lg:pl-[clamp(22px,3vw,52px)]">
                {/* En-tête compact */}
                <div className="flex flex-wrap items-end justify-between gap-5">
                    <div>
                        <div className="hx-mono hx-label hx-fade mb-4 flex items-center gap-3 text-[10px] tracking-[0.075em] text-neutral-500" style={delay(0.05)}>
                            <span className="inline-block size-[5px] bg-dym" /> {t.c('home.testimonials.eyebrow')}
                        </div>
                        <h2 id="temoignages-title" className="font-display text-[clamp(34px,7vw,44px)] leading-[0.95] text-ink uppercase lg:text-[clamp(36px,2.8vw,50px)]">
                            <span className="hx-line -mt-[0.18em] -mb-[0.07em] block overflow-hidden pt-[0.18em] pb-[0.07em]">
                                <span style={delay(0.12)}>{t.c('home.testimonials.title', withDot(t('home.testimonials.title')))}</span>
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
                    {testimonials.map((t, i) => (
                        <div key={t.id} className="hx-fade w-[84%] shrink-0 snap-start sm:w-[60%] lg:w-auto" style={delay(0.25 + i * 0.12)}>
                            <TestimonialCard
                                quote={t.quote}
                                author={t.author}
                                role={[t.role, t.project].filter(Boolean).join(' · ') || null}
                                avatarUrl={t.image_url}
                                className="h-full max-w-none"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
