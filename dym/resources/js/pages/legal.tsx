import { Head, Link } from '@inertiajs/react';
import { LegalContent } from '@/components/site/legal-content';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { show } from '@/routes/legal';
import type { Activity, SiteSettings } from '@/types/admin';
import { useTexts } from '@/components/site/use-texts';

type Props = {
    page: { title: string; body: string; updated_at: string | null };
    legalPages: { slug: string; title: string }[];
    current: string;
    activities: Pick<Activity, 'id' | 'title'>[];
    site: SiteSettings;
};

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' });

export default function LegalPage({ page, legalPages, current, activities, site }: Props) {
    const t = useTexts();

    return (
        <>
            <Head title={t('legal.page.meta_title').replace('{titre}', page.title)} />

            <div className="bg-paper text-ink">
                <SiteHeader active="" />

                <section className="px-5 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)]">
                    <div className="mx-auto max-w-[1200px] pt-12 pb-10 lg:pt-16">
                        <div className="hx-mono mb-5 flex items-center gap-3 text-[10px] tracking-[0.075em] text-neutral-500">
                            <span className="inline-block size-[5px] bg-dym" /> {t.c('legal.page.eyebrow')}
                        </div>
                        <h1 className="font-display text-[clamp(38px,6vw,64px)] leading-[0.98] uppercase">
                            {page.title}
                            <span className="text-dym">.</span>
                        </h1>
                        {page.updated_at && <p className="mt-4 text-sm text-neutral-500">{t.c('legal.page.updated', t('legal.page.updated').replace('{date}', dateFormat.format(new Date(page.updated_at))))}</p>}
                    </div>
                </section>

                <section className="hx-hair border-t px-5 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)]">
                    <div className="mx-auto grid max-w-[1200px] gap-10 py-12 lg:grid-cols-[240px_1fr] lg:gap-16 lg:py-16">
                        <nav aria-label="Pages légales" className="lg:sticky lg:top-28 lg:self-start">
                            <ul className="hx-hair flex flex-wrap gap-2 lg:flex-col lg:gap-0 lg:border-l">
                                {legalPages.map((p) => {
                                    const active = p.slug === current;

                                    return (
                                        <li key={p.slug}>
                                            <Link
                                                href={show(p.slug)}
                                                aria-current={active ? 'page' : undefined}
                                                className={`block border px-4 py-2.5 text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors lg:-ml-px lg:border-0 lg:border-l-2 lg:py-3 ${
                                                    active ? 'border-dym text-dym' : 'border-black/10 text-neutral-500 hover:text-ink lg:border-transparent'
                                                }`}
                                            >
                                                {p.title}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>

                        <article className="max-w-[760px]">
                            <LegalContent body={page.body} />
                        </article>
                    </div>
                </section>

                <SiteFooter activities={activities} site={site} />
            </div>
        </>
    );
}
