import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Activities } from '@/components/site/activities';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { useInView } from '@/components/site/use-in-view';
import { create as quoteCreate } from '@/routes/quotes';
import type { Activity, SiteSettings } from '@/types/admin';
import { useTexts, withDot } from '@/components/site/use-texts';

type Props = {
    activities: Activity[];
    site: SiteSettings;
};

// Ouvrages fabriqués en atelier : visuels produits détourés sur fond blanc.
// Noms : activities.products.product_N (/admin/texts).
const productImages = [
    '/images/produits/pergola.jpg',
    '/images/produits/marquise.jpg',
    '/images/produits/portail.jpg',
    '/images/produits/garde-corps.jpg',
    '/images/produits/grille-defense.jpg',
    '/images/produits/charpente.jpg',
    '/images/produits/rampe-escalier.jpg',
];

const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties;

function Products() {
    const [ref, inView] = useInView<HTMLElement>(0.1, false);
    const t = useTexts();
    const products = productImages.map((image, i) => ({
        image,
        title: t(`activities.products.product_${i + 1}`),
    }));

    return (
        <section ref={ref} id="ouvrages" aria-labelledby="ouvrages-title" className={`hx-root px-5 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)] ${inView ? 'is-ready' : ''}`}>
            <div className="mx-auto max-w-[1720px] pt-14 pb-16 lg:pt-16 lg:pb-24">
                <div className="flex flex-wrap items-end justify-between gap-6 lg:pl-[clamp(22px,3vw,52px)]">
                    <div>
                        <div className="hx-mono hx-fade mb-5 flex items-center gap-3 text-[10px] tracking-[0.075em] text-neutral-500" style={delay(0.05)}>
                            <span className="inline-block size-[5px] bg-dym" /> {t('activities.products.eyebrow')}
                        </div>
                        <h2 id="ouvrages-title" className="hx-fade font-display text-[clamp(36px,7vw,52px)] leading-[0.95] text-ink uppercase lg:text-[clamp(40px,3.2vw,60px)]" style={delay(0.12)}>
                            {withDot(t('activities.products.title'))}
                        </h2>
                    </div>
                    <p className="hx-fade max-w-[440px] text-[15px] leading-[1.7] text-neutral-600" style={delay(0.25)}>
                        {t('activities.products.text')}
                    </p>
                </div>

                <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                    {products.map((p, i) => (
                        <li key={p.image} className="hx-fade" style={delay(0.3 + i * 0.06)}>
                            <a href="#contact" className="group relative block aspect-[4/3] overflow-hidden bg-white">
                                <img
                                    src={p.image}
                                    alt={p.title}
                                    loading="lazy"
                                    className="size-full object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                                />
                                <div className="absolute inset-x-0 bottom-0 translate-y-full bg-neutral-100/95 px-6 py-5 transition-transform duration-500 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0 [@media(hover:none)]:translate-y-0">
                                    <h3 className="text-[17px] font-bold tracking-[0.12em] text-ink uppercase">{p.title}</h3>
                                    <p className="mt-1.5 flex items-center justify-between text-[13px] font-semibold tracking-[0.1em] text-dym">
                                        {t('activities.products.signature')}
                                        <ArrowRight className="size-4 -translate-x-2 opacity-0 transition-[opacity,transform] duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
                                    </p>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export default function ActivitesPage({ activities, site }: Props) {
    const t = useTexts();

    return (
        <>
            <Head title={t('activities.meta.title')}>
                <meta name="description" content={t('activities.meta.description')} />
            </Head>

            <div className="bg-paper text-ink">
                <SiteHeader active="Activités" />

                <div className="hx-hair border-t">
                    <Activities activities={activities} linkToQuote />
                </div>

                <Products />

                <section className="hx-hair border-b border-white/10 bg-ink px-5 text-white sm:px-8 lg:px-[clamp(24px,3.15vw,58px)]">
                    <div className="mx-auto flex max-w-[1720px] flex-wrap items-center justify-between gap-6 py-14 lg:pl-[clamp(22px,3vw,52px)]">
                        <h2 className="font-display text-[clamp(30px,4vw,48px)] leading-none uppercase">
                            {withDot(t('activities.cta.title'))}
                        </h2>
                        <Link
                            href={quoteCreate()}
                            className="hd-cta relative inline-flex items-center gap-2 overflow-hidden bg-dym px-6 py-4 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors hover:bg-dym-dark"
                        >
                            {t('activities.cta.button')} <ArrowRight className="hd-arrow size-3.5" />
                        </Link>
                    </div>
                </section>

                <SiteFooter activities={activities} site={site} />
            </div>
        </>
    );
}
