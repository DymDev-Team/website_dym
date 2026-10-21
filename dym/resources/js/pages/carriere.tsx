import { Head, Link } from '@inertiajs/react';
import { ArrowRight, GraduationCap, ShieldCheck, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { ApplicationForm } from '@/components/site/application-form';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { show } from '@/routes/careers';
import type { Activity, JobOffer, SiteSettings } from '@/types/admin';
import { renderTitle, useTexts } from '@/components/site/use-texts';
import { ScrollLink } from '@/components/site/scroll-link';
import { useSectionColor } from '@/components/site/use-section-color';

type Props = {
    offers: JobOffer[];
    activities: Pick<Activity, 'id' | 'title'>[];
    site: SiteSettings;
};

// Textes : careers.reasons.reason_N_{title,text} (/admin/texts).
const reasonIcons = [Users, GraduationCap, ShieldCheck];

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' });

function Eyebrow({ children }: { children: ReactNode }) {
    return (
        <div className="hx-mono mb-5 flex items-center gap-3 text-[10px] tracking-[0.075em] text-neutral-500">
            <span className="inline-block size-[5px] bg-dym" /> {children}
        </div>
    );
}

export default function CarrierePage({ offers, activities, site }: Props) {
    const t = useTexts();
    const introStyle = useSectionColor('career_page_intro');
    const valuesStyle = useSectionColor('career_page_values');
    const jobsStyle = useSectionColor('career_page_jobs');
    const applicationStyle = useSectionColor('career_page_application');

    return (
        <>
            <Head title={t('careers.meta.title')}>
                <meta name="description" content={t('careers.meta.description')} />
            </Head>

            <div className="bg-paper text-ink">
                <SiteHeader active="Carrière" />

                {/* En-tête */}
                <section style={introStyle} className="px-5 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)]">
                    <div className="mx-auto grid max-w-[1720px] items-end gap-8 pt-14 pb-12 lg:grid-cols-2 lg:pt-20 lg:pb-16 lg:pl-[clamp(22px,3vw,52px)]">
                        <div>
                            <Eyebrow>{t.c('careers.header.eyebrow')}</Eyebrow>
                            <h1 className="font-display text-[clamp(44px,9vw,64px)] leading-[0.95] uppercase lg:text-[clamp(52px,4.6vw,84px)]">
                                {t.c('careers.header.title', renderTitle(t('careers.header.title')))}
                            </h1>
                        </div>
                        <div className="max-w-[520px]">
                            <p className="text-[15px] leading-[1.7] text-neutral-600">
                                {t.c('careers.header.text')}
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <ScrollLink
                                    target="offres"
                                    className="hd-cta relative inline-flex items-center gap-2 overflow-hidden bg-dym px-6 py-4 text-[11px] font-semibold tracking-[0.14em] text-white uppercase transition-colors hover:bg-dym-dark"
                                >
                                    {t.c('careers.header.offers_button')} <ArrowRight className="hd-arrow size-3.5" />
                                </ScrollLink>
                                <ScrollLink
                                    target="candidature"
                                    className="inline-flex items-center gap-2 border border-ink/20 px-6 py-4 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors hover:border-dym hover:text-dym"
                                >
                                    {t.c('careers.header.application_button')}
                                </ScrollLink>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pourquoi nous rejoindre */}
                <section style={valuesStyle} className="hx-hair border-y bg-ink px-5 text-white sm:px-8 lg:px-[clamp(24px,3.15vw,58px)]">
                    <ul className="mx-auto grid max-w-[1720px] lg:grid-cols-3 lg:pl-[clamp(22px,3vw,52px)]">
                        {reasonIcons.map((Icon, i) => (
                            <li key={i} className={`py-10 lg:px-10 lg:py-14 ${i > 0 ? 'border-t border-white/10 lg:border-t-0 lg:border-l' : 'lg:pl-0'}`}>
                                <Icon className="size-6 text-dym" />
                                <h2 className="mt-5 font-display text-[26px] leading-none uppercase">{t.c(`careers.reasons.reason_${i + 1}_title`)}</h2>
                                <p className="mt-3 max-w-[380px] text-sm leading-relaxed text-white/70">{t.c(`careers.reasons.reason_${i + 1}_text`)}</p>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Offres */}
                <section id="offres" style={jobsStyle} className="scroll-mt-24 px-5 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)]">
                    <div className="mx-auto max-w-[1720px] py-14 lg:py-20 lg:pl-[clamp(22px,3vw,52px)]">
                        <Eyebrow>{`${t.c('careers.offers.eyebrow')} — ${String(offers.length).padStart(2, '0')}`}</Eyebrow>
                        <h2 className="font-display text-[clamp(34px,7vw,44px)] leading-[0.95] uppercase lg:text-[clamp(36px,2.8vw,50px)]">
                            {t.c('careers.offers.title', renderTitle(t('careers.offers.title')))}
                        </h2>

                        {offers.length === 0 ? (
                            <p className="mt-8 max-w-[560px] border border-black/10 bg-white/60 p-6 text-neutral-600">
                                {t.c('careers.offers.empty')}{' '}
                                <ScrollLink target="candidature" className="font-semibold text-dym hover:underline">
                                    {t.c('careers.offers.empty_link')}
                                </ScrollLink>
                                .
                            </p>
                        ) : (
                            <ul className="hx-hair mt-10 border-t">
                                {offers.map((o) => (
                                    <li key={o.id} className="hx-hair border-b">
                                        <Link href={show(o.slug)} className="group grid gap-3 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
                                            <div>
                                                <p className="hx-mono flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] tracking-[0.1em] text-neutral-500 uppercase">
                                                    <span className="text-dym">{o.contract_type}</span>
                                                    {o.department && <span>{o.department}</span>}
                                                    <span>{o.location}</span>
                                                    {o.closes_at && <span>{t.c('careers.offers.until')} {dateFormat.format(new Date(o.closes_at))}</span>}
                                                </p>
                                                <h3 className="mt-2 text-[20px] font-semibold text-ink transition-colors group-hover:text-dym">{o.title}</h3>
                                                {o.summary && <p className="mt-1.5 max-w-[760px] text-sm leading-relaxed text-neutral-600">{o.summary}</p>}
                                            </div>
                                            <span className="hx-mono inline-flex items-center gap-2 text-[10px] tracking-[0.1em] text-dym uppercase">
                                                {t.c('careers.offers.view')}
                                                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>

                {/* Candidature spontanée */}
                <section id="candidature" style={applicationStyle} className="hx-hair scroll-mt-24 border-t px-5 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)]">
                    <div className="mx-auto grid max-w-[1720px] gap-10 py-14 lg:grid-cols-[1fr_1.3fr] lg:py-20 lg:pl-[clamp(22px,3vw,52px)]">
                        <div>
                            <Eyebrow>{t.c('careers.application.eyebrow')}</Eyebrow>
                            <h2 className="font-display text-[clamp(34px,7vw,44px)] leading-[0.95] uppercase lg:text-[clamp(36px,2.8vw,50px)]">
                                {t.c('careers.application.title', renderTitle(t('careers.application.title')))}
                            </h2>
                            <p className="mt-5 max-w-[420px] text-[15px] leading-[1.7] text-neutral-600">
                                {t.c('careers.application.text')}
                            </p>
                        </div>
                        <ApplicationForm />
                    </div>
                </section>

                <SiteFooter activities={activities} site={site} />
            </div>
        </>
    );
}
