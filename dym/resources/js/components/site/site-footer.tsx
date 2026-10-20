import { Link } from '@inertiajs/react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Fragment } from 'react';
import { CookieConsentBanner, openCookieSettings } from '@/components/site/cookie-consent';
import { SiteLogo, siteNav } from '@/components/site/site-header';
import { FacebookIcon, InstagramIcon, LinkedInIcon, WhatsAppIcon, YouTubeIcon } from '@/components/site/social-icons';
import { show as showLegal } from '@/routes/legal';
import type { Activity, SiteSettings } from '@/types/admin';
import { useTexts } from '@/components/site/use-texts';

type FooterActivity = Pick<Activity, 'id' | 'title'>;

const socialLinks = [
    { key: 'whatsapp_url', icon: WhatsAppIcon, label: 'WhatsApp' },
    { key: 'facebook_url', icon: FacebookIcon, label: 'Facebook' },
    { key: 'linkedin_url', icon: LinkedInIcon, label: 'LinkedIn' },
    { key: 'instagram_url', icon: InstagramIcon, label: 'Instagram' },
    { key: 'youtube_url', icon: YouTubeIcon, label: 'YouTube' },
] as const;

const legalLinks = [
    { slug: 'mentions-legales', key: 'legal_notice' },
    { slug: 'politique-de-confidentialite', key: 'privacy' },
    { slug: 'cookies', key: 'cookies' },
];

const CREDIT_URL = 'https://ci.linkedin.com/in/yann-morel-effobi-brou-5474782a1';

function ColumnTitle({ children }: { children: string }) {
    return <p className="hx-mono mb-5 text-[10px] tracking-[0.14em] text-ink uppercase">{children}</p>;
}

export function SiteFooter({ activities, site }: { activities: FooterActivity[]; site: SiteSettings }) {
    const t = useTexts();
    // Coordonnées et réseaux saisis dans Admin › Paramètres ; les entrées vides sont masquées.
    const contact = [
        {
            icon: Phone,
            label: site.phone,
            href: site.phone ? `tel:${site.phone.replace(/[^+\d]/g, '')}` : undefined,
        },
        {
            icon: Mail,
            label: site.email,
            href: site.email ? `mailto:${site.email}` : undefined,
        },
        { icon: MapPin, label: site.address, href: undefined },
    ].filter((c): c is typeof c & { label: string } => Boolean(c.label));

    const socials = socialLinks.filter((s) => site[s.key]).map((s) => ({ ...s, href: site[s.key] as string }));

    return (
        <footer id="contact" className="bg-paper px-5 text-neutral-600 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)]">
            <div className="mx-auto max-w-[1720px] lg:pl-[clamp(22px,3vw,52px)]">
                <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.1fr_1.2fr] lg:gap-0 lg:py-16">
                    {/* Marque */}
                    <div className="lg:pr-10">
                        <SiteLogo className="h-12" />
                        {site.tagline && <p className="mt-5 max-w-[300px] text-sm leading-relaxed">{site.tagline}</p>}
                        <div className="mt-6 flex gap-2">
                            {socials.map(({ icon: Icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="grid size-9 place-items-center border border-ink/15 text-ink/80 transition-colors hover:border-dym hover:bg-dym hover:text-white"
                                >
                                    <Icon className="size-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="lg:border-l lg:border-ink/10 lg:px-10">
                        <ColumnTitle>{t('layout.footer.nav_title')}</ColumnTitle>
                        <ul className="space-y-2.5 text-sm">
                            {siteNav.map((n) => (
                                <li key={n.label}>
                                    <Link href={n.href} className="transition-colors hover:text-ink">
                                        {n.navLabel ?? t(`layout.header.nav_${n.key}`)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Activités */}
                    <div className="lg:border-l lg:border-ink/10 lg:px-10">
                        <ColumnTitle>{t('layout.footer.activities_title')}</ColumnTitle>
                        <ul className="space-y-2.5 text-sm">
                            {activities.map((a) => (
                                <li key={a.id}>
                                    <Link href="/activites" className="transition-colors hover:text-ink">
                                        {a.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="lg:border-l lg:border-ink/10 lg:pl-10">
                        <ColumnTitle>{t('layout.footer.contact_title')}</ColumnTitle>
                        <ul className="space-y-4 text-sm">
                            {contact.map(({ icon: Icon, label, href }) => {
                                const content = (
                                    <>
                                        <Icon className="mt-0.5 size-4 shrink-0 text-dym" />
                                        <span>{label}</span>
                                    </>
                                );

                                return (
                                    <li key={label}>
                                        {href ? (
                                            <a href={href} className="flex items-start gap-3 text-ink/85 transition-colors hover:text-ink">
                                                {content}
                                            </a>
                                        ) : (
                                            <span className="flex items-start gap-3 text-ink/85">{content}</span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                {/* Barre basse */}
                <div className="flex flex-col gap-3 border-t border-ink/10 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        {t('layout.footer.copyright').replace('{année}', String(new Date().getFullYear()))} {t('layout.footer.credit')}{' '}
                        <a href={CREDIT_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline decoration-dym decoration-1 underline-offset-4 transition-colors hover:text-dym">
                            DYM DEV
                        </a>
                        .
                    </p>
                    <p className="flex flex-wrap items-center gap-3">
                        {legalLinks.map((l, i) => (
                            <Fragment key={l.slug}>
                                {i > 0 && <span className="text-ink/20">|</span>}
                                <Link href={showLegal(l.slug)} className="transition-colors hover:text-ink">
                                    {t(`layout.footer.${l.key}`)}
                                </Link>
                            </Fragment>
                        ))}
                        <span className="text-ink/20">|</span>
                        <button type="button" onClick={openCookieSettings} className="transition-colors hover:text-ink">
                            {t('layout.footer.cookie_settings')}
                        </button>
                    </p>
                </div>
            </div>

            <CookieConsentBanner />
        </footer>
    );
}
