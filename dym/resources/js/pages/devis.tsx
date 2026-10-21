import { Head } from '@inertiajs/react';
import { Clock, FileText, Mail, MapPin, Phone, Ruler } from 'lucide-react';
import type { ReactNode } from 'react';
import { QuoteForm } from '@/components/site/quote-form';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import type { Activity, SiteSettings } from '@/types/admin';
import { renderTitle, useTexts } from '@/components/site/use-texts';

type Props = {
    preset: string | null;
    activities: Pick<Activity, 'id' | 'title'>[];
    site: SiteSettings;
};

// Textes : quote.steps.step_N_{title,text} (/admin/texts).
const stepIcons = [FileText, Ruler, Clock];

function Eyebrow({ children }: { children: ReactNode }) {
    return (
        <div className="hx-mono mb-5 flex items-center gap-3 text-[10px] tracking-[0.075em] text-neutral-500">
            <span className="inline-block size-[5px] bg-dym" /> {children}
        </div>
    );
}

export default function DevisPage({ preset, activities, site }: Props) {
    const titles = activities.map((a) => a.title);
    const t = useTexts();

    const contact = [
        site.phone && { icon: Phone, label: site.phone, href: `tel:${site.phone.replace(/[^+\d]/g, '')}` },
        site.email && { icon: Mail, label: site.email, href: `mailto:${site.email}` },
        site.address && { icon: MapPin, label: site.address, href: undefined },
    ].filter(Boolean) as { icon: typeof Phone; label: string; href?: string }[];

    return (
        <>
            <Head title={t('quote.meta.title')}>
                <meta name="description" content={t('quote.meta.description')} />
            </Head>

            <div className="bg-paper text-ink">
                <SiteHeader active="" />

                <section className="px-5 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)]">
                    <div className="mx-auto grid max-w-[1720px] gap-12 pt-14 pb-16 lg:grid-cols-[1fr_1.35fr] lg:gap-16 lg:pt-20 lg:pb-24 lg:pl-[clamp(22px,3vw,52px)]">
                        {/* Colonne d'introduction */}
                        <div>
                            <Eyebrow>{t.c('quote.header.eyebrow')}</Eyebrow>
                            <h1 className="font-display text-[clamp(44px,9vw,64px)] leading-[0.95] uppercase lg:text-[clamp(52px,4.4vw,80px)]">
                                {t.c('quote.header.title', renderTitle(t('quote.header.title')))}
                            </h1>
                            <p className="mt-6 max-w-[440px] text-[15px] leading-[1.7] text-neutral-600">
                                {t.c('quote.header.text')}
                            </p>

                            <ol className="hx-hair mt-10 border-t">
                                {stepIcons.map((Icon, i) => (
                                    <li key={i} className="hx-hair flex gap-4 border-b py-5">
                                        <span className="hx-hair grid size-11 shrink-0 place-items-center border text-ink">
                                            <Icon className="size-[18px]" strokeWidth={1.5} />
                                        </span>
                                        <span>
                                            <span className="hx-mono block text-[10px] text-dym">{String(i + 1).padStart(2, '0')}</span>
                                            <span className="block font-semibold">{t.c(`quote.steps.step_${i + 1}_title`)}</span>
                                            <span className="mt-0.5 block text-sm text-neutral-600">{t.c(`quote.steps.step_${i + 1}_text`)}</span>
                                        </span>
                                    </li>
                                ))}
                            </ol>

                            {contact.length > 0 && (
                                <div className="mt-10">
                                    <p className="hx-mono mb-4 text-[10px] tracking-[0.1em] text-neutral-500 uppercase">{t.c('quote.header.call')}</p>
                                    <ul className="space-y-3 text-sm">
                                        {contact.map(({ icon: Icon, label, href }) => (
                                            <li key={label}>
                                                {href ? (
                                                    <a href={href} className="flex items-start gap-3 transition-colors hover:text-dym">
                                                        <Icon className="mt-0.5 size-4 shrink-0 text-dym" />
                                                        {label}
                                                    </a>
                                                ) : (
                                                    <span className="flex items-start gap-3">
                                                        <Icon className="mt-0.5 size-4 shrink-0 text-dym" />
                                                        {label}
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Formulaire */}
                        <div className="hx-hair border bg-neutral-50/60 p-5 sm:p-8 lg:p-10">
                            <QuoteForm activities={titles} defaultActivity={preset && titles.includes(preset) ? preset : undefined} />
                        </div>
                    </div>
                </section>

                <SiteFooter activities={activities} site={site} />
            </div>
        </>
    );
}
