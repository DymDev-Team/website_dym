import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { useInView } from '@/components/site/use-in-view';
import { useSectionColor } from '@/components/site/use-section-color';
import { show } from '@/routes/posts';
import type { Post } from '@/types/admin';
import { useTexts, withDot } from '@/components/site/use-texts';

const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties;

export function News({ posts: news }: { posts: Post[] }) {
    const sectionStyle = useSectionColor('news');
    const [ref, inView] = useInView<HTMLElement>(0.15, false);
    const trackRef = useRef<HTMLDivElement>(null);
    const t = useTexts();

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

    if (news.length === 0) {
        return null;
    }

    return (
        <section ref={ref} style={sectionStyle} id="actualites" aria-labelledby="actualites-title" className={`hx-root hx-dark hx-hair relative border-t border-white/15 bg-ink px-5 text-white sm:px-8 lg:px-[clamp(24px,3.15vw,58px)] ${inView ? 'is-ready' : ''}`}>
            <div className="mx-auto max-w-[1720px] py-14 lg:py-16 lg:pl-[clamp(22px,3vw,52px)]">
                {/* En-tête */}
                <div className="flex flex-wrap items-end justify-between gap-5">
                    <div>
                        <div className="hx-mono hx-label hx-fade mb-4 flex items-center gap-3 text-[10px] tracking-[0.075em] text-white/55" style={delay(0.05)}>
                            <span className="inline-block size-[5px] bg-dym" /> {t.c('home.news.eyebrow')}
                        </div>
                        <h2 id="actualites-title" className="font-display text-[clamp(34px,7vw,44px)] leading-[0.95] text-white uppercase lg:text-[clamp(36px,2.8vw,50px)]">
                            <span className="hx-line -mt-[0.18em] -mb-[0.07em] block overflow-hidden pt-[0.18em] pb-[0.07em]">
                                <span style={delay(0.12)}>{t.c('home.news.title', withDot(t('home.news.title')))}</span>
                            </span>
                        </h2>
                    </div>

                    <div className="hx-fade flex items-center gap-6" style={delay(0.3)}>
                        <a href="/actualites" style={t.style('home.news.link')} className="hx-mono hx-label group hidden items-center gap-2 text-[10px] tracking-[0.1em] text-dym uppercase sm:inline-flex">
                            {t('home.news.link')}
                            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                        </a>
                        <div className="flex gap-2">
                            {([-1, 1] as const).map((dir) => (
                                <button
                                    key={dir}
                                    type="button"
                                    onClick={() => scroll(dir)}
                                    aria-label={dir < 0 ? 'Actualité précédente' : 'Actualité suivante'}
                                    className="hx-hair grid size-10 cursor-pointer place-items-center border border-white/20 text-white transition-colors hover:border-dym hover:bg-dym hover:text-white"
                                >
                                    {dir < 0 ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cartes : 3 visibles sur grand écran, défilement pour la suite */}
                <div ref={trackRef} className="hx-hair mt-8 -mx-5 flex snap-x snap-mandatory overflow-x-auto border-y [scrollbar-width:none] sm:-mx-8 lg:mx-0 lg:mt-10 [&::-webkit-scrollbar]:hidden">
                    {news.map((n, i) => (
                        <article key={n.id} className={`hx-fade hx-hair group w-[82%] shrink-0 snap-start px-5 py-6 sm:w-[48%] sm:px-6 lg:w-1/3 ${i > 0 ? 'border-l' : ''}`} style={delay(0.25 + Math.min(i, 3) * 0.1)}>
                            <Link href={show(n.slug)} className="block">
                                <div className="relative aspect-[2.2/1] overflow-hidden bg-neutral-100">
                                    <img src={n.image_url ?? undefined} alt="" loading="lazy" className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                                </div>
                                <p className="hx-mono hx-label mt-5 flex items-center gap-2 text-[10px] tracking-[0.1em] text-white/55 uppercase">
                                    <span className="size-[5px] bg-dym" aria-hidden /> {n.category}
                                </p>
                                <h3 className="mt-2 text-[17px] leading-snug font-semibold text-white">
                                    <span className="bg-linear-to-r from-dym to-dym bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
                                        {n.title}
                                    </span>
                                </h3>
                                <span style={t.style('home.news.read_more')} className="hx-mono mt-4 inline-flex items-center gap-2 text-[10px] tracking-[0.1em] text-dym uppercase">
                                    {t('home.news.read_more')}
                                    <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                                </span>
                            </Link>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
