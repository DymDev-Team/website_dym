import { Head } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { useInView } from '@/components/site/use-in-view';
import type { Activity, Brand, SiteSettings } from '@/types/admin';
import { useTexts, withDot } from '@/components/site/use-texts';
import { useSectionColor } from '@/components/site/use-section-color';

type Props = {
    brands: Brand[];
    activities: Activity[];
    site: SiteSettings;
};

const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties;

// « https://www.novamec.ci/ » → « novamec.ci »
function hostname(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

export default function MarquesPage({ brands, activities, site }: Props) {
    const [ref, inView] = useInView<HTMLElement>(0.05, false);
    const t = useTexts();
    const listStyle = useSectionColor('brands_page_list');

    return (
        <>
            <Head title={t('brands.meta.title')}>
                <meta name="description" content={t('brands.meta.description')} />
            </Head>

            <div className="bg-paper text-ink">
                <SiteHeader active="Marques" />

                <section ref={ref} style={listStyle} aria-labelledby="marques-title" className={`hx-root px-5 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)] ${inView ? 'is-ready' : ''}`}>
                    <div className="mx-auto max-w-[1720px] pt-14 pb-16 lg:pt-16 lg:pb-24">
                        {/* En-tête */}
                        <div className="flex flex-wrap items-end justify-between gap-6 lg:pl-[clamp(22px,3vw,52px)]">
                            <div>
                                <div className="hx-mono hx-label hx-fade mb-5 flex items-center gap-3 text-[10px] tracking-[0.075em] text-neutral-500" style={delay(0.05)}>
                                    <span className="inline-block size-[5px] bg-dym" /> {t.c('brands.header.eyebrow')}
                                </div>
                                <h1 id="marques-title" className="font-display text-[clamp(40px,9vw,56px)] leading-[0.95] text-ink uppercase lg:text-[clamp(44px,3.8vw,68px)]">
                                    <span className="hx-line -mt-[0.18em] -mb-[0.07em] block overflow-hidden pt-[0.18em] pb-[0.07em]">
                                        <span style={delay(0.12)}>{t.c('brands.header.title', withDot(t('brands.header.title')))}</span>
                                    </span>
                                </h1>
                            </div>
                            <p className="hx-fade max-w-[440px] text-[15px] leading-[1.7] text-neutral-600" style={delay(0.25)}>
                                {t.c('brands.header.text')}
                            </p>
                        </div>

                        {/* Marques */}
                        {brands.length > 0 ? (
                            <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                                {brands.map((brand, i) => (
                                    <li key={brand.id} className="hx-fade hx-hair group flex flex-col border bg-white/60 transition-[border-color,box-shadow] duration-500 hover:border-dym/40 hover:shadow-[0_18px_40px_rgb(20_20_20/0.08)]" style={delay(0.3 + i * 0.06)}>
                                        <div className="grid h-32 place-items-center border-b border-black/5 bg-white px-8 py-5">
                                            <img
                                                src={brand.logo_url ?? undefined}
                                                alt={brand.name}
                                                loading="lazy"
                                                className="max-h-[88px] max-w-[70%] object-contain transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col px-6 pt-5 pb-6">
                                            <h2 className="font-display text-[22px] leading-none uppercase">{brand.name}</h2>
                                            {brand.description && <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-neutral-600">{brand.description}</p>}
                                            {brand.website_url && (
                                                <a
                                                    href={t.href('brands.header.link', brand.website_url)}
                                                    style={t.style('brands.header.link')}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group/link mt-5 inline-flex items-center gap-3 self-start border border-dym/30 px-4 py-2.5 text-dym transition-colors duration-300 hover:border-dym hover:bg-dym hover:text-white"
                                                >
                                                    <span className="hx-mono text-[10px] tracking-[0.1em] uppercase">{t.c('brands.header.link')}</span>
                                                    <span className="text-[13px] text-neutral-500 transition-colors duration-300 group-hover/link:text-white/80">{hostname(brand.website_url)}</span>
                                                    <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                                </a>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-12 text-neutral-600 lg:pl-[clamp(22px,3vw,52px)]">{t.c('brands.header.empty')}</p>
                        )}
                    </div>
                </section>

                <SiteFooter activities={activities} site={site} />
            </div>
        </>
    );
}
