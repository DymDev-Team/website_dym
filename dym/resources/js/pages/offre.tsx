import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { ApplicationForm } from '@/components/site/application-form';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { index } from '@/routes/careers';
import type { Activity, JobOffer, SiteSettings } from '@/types/admin';
import { useTexts, withDot } from '@/components/site/use-texts';

type Props = {
    offer: JobOffer;
    activities: Pick<Activity, 'id' | 'title'>[];
    site: SiteSettings;
};

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' });

const paragraphs = (text: string | null) =>
    (text ?? '')
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);

const lines = (text: string | null) =>
    (text ?? '')
        .split('\n')
        .map((l) => l.replace(/^[-•*]\s*/, '').trim())
        .filter(Boolean);

function Heading({ children }: { children: ReactNode }) {
    return (
        <h2 className="hx-mono mb-4 flex items-center gap-3 text-[10px] tracking-[0.1em] text-neutral-500 uppercase">
            <span className="size-[5px] bg-dym" /> {children}
        </h2>
    );
}

export default function OffrePage({ offer, activities, site }: Props) {
    const missions = paragraphs(offer.description);
    const requirements = lines(offer.requirements);

    const t = useTexts();

    return (
        <>
            <Head title={t('careers.offer.meta_title').replace('{titre}', offer.title)}>{offer.summary && <meta name="description" content={offer.summary} />}</Head>

            <div className="bg-paper text-ink">
                <SiteHeader active="Carrière" />

                <section className="px-5 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)]">
                    <div className="mx-auto max-w-[1200px] pt-12 pb-10 lg:pt-16">
                        <Link href={index()} className="hx-mono inline-flex items-center gap-2 text-[10px] tracking-[0.1em] text-neutral-500 uppercase transition-colors hover:text-dym">
                            <ArrowLeft className="size-3.5" /> {t.c('careers.offer.back')}
                        </Link>

                        <p className="hx-mono mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] tracking-[0.1em] text-neutral-500 uppercase">
                            <span className="text-dym">{offer.contract_type}</span>
                            {offer.department && <span>{offer.department}</span>}
                            <span>{offer.location}</span>
                        </p>
                        <h1 className="mt-4 font-display text-[clamp(38px,6vw,64px)] leading-[0.98] uppercase">
                            {offer.title}
                            <span className="text-dym">.</span>
                        </h1>
                        {offer.summary && <p className="mt-6 max-w-[760px] text-lg leading-relaxed text-neutral-600">{offer.summary}</p>}
                        {offer.closes_at && <p className="mt-4 text-sm text-neutral-500">{t.c('careers.offer.closes', t('careers.offer.closes').replace('{date}', dateFormat.format(new Date(offer.closes_at))))}</p>}
                    </div>
                </section>

                <section className="hx-hair border-t px-5 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)]">
                    <div className="mx-auto grid max-w-[1200px] gap-12 py-12 lg:grid-cols-[1fr_440px] lg:py-16">
                        <div className="space-y-10">
                            {missions.length > 0 && (
                                <div>
                                    <Heading>{t.c('careers.offer.missions')}</Heading>
                                    <div className="space-y-4 text-[16px] leading-[1.8] text-neutral-700">
                                        {missions.map((p, i) => (
                                            <p key={i} className="whitespace-pre-line">
                                                {p}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {requirements.length > 0 && (
                                <div>
                                    <Heading>{t.c('careers.offer.requirements')}</Heading>
                                    <ul className="space-y-2.5">
                                        {requirements.map((r) => (
                                            <li key={r} className="flex gap-3 text-[16px] leading-[1.6] text-neutral-700">
                                                <span className="mt-[0.6em] size-[5px] shrink-0 bg-dym" aria-hidden />
                                                {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div id="postuler" className="scroll-mt-24 lg:sticky lg:top-28 lg:self-start">
                            <div className="border border-black/10 bg-white/60 p-6 sm:p-8">
                                <p className="mb-6 font-display text-[28px] leading-none uppercase">
                                    {t.c('careers.offer.apply', withDot(t('careers.offer.apply')))}
                                </p>
                                <ApplicationForm offerId={offer.id} />
                            </div>
                        </div>
                    </div>
                </section>

                <SiteFooter activities={activities} site={site} />
            </div>
        </>
    );
}
