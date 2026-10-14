import { Link } from '@inertiajs/react';
import { Facebook, Linkedin, Mail, MapPin, MessageCircle, Phone, Youtube } from 'lucide-react';
import { Fragment } from 'react';
import { SiteLogo, siteNav } from '@/components/site/site-header';
import { show as showLegal } from '@/routes/legal';
import type { Activity, SiteSettings } from '@/types/admin';

type FooterActivity = Pick<Activity, 'id' | 'title'>;

const socialLinks = [
    { key: 'linkedin_url', icon: Linkedin, label: 'LinkedIn' },
    { key: 'facebook_url', icon: Facebook, label: 'Facebook' },
    { key: 'whatsapp_url', icon: MessageCircle, label: 'WhatsApp' },
    { key: 'youtube_url', icon: Youtube, label: 'YouTube' },
] as const;

const legalLinks = [
    { slug: 'mentions-legales', label: 'Mentions légales' },
    { slug: 'politique-de-confidentialite', label: 'Confidentialité' },
    { slug: 'cookies', label: 'Cookies' },
];

const CREDIT_URL = 'https://ci.linkedin.com/in/yann-morel-effobi-brou-5474782a1';

function ColumnTitle({ children }: { children: string }) {
    return <p className="hx-mono mb-5 text-[10px] tracking-[0.14em] text-white uppercase">{children}</p>;
}

export function SiteFooter({ activities, site }: { activities: FooterActivity[]; site: SiteSettings }) {
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
        <footer id="contact" className="bg-ink px-5 text-neutral-400 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)]">
            <div className="mx-auto max-w-[1720px] lg:pl-[clamp(22px,3vw,52px)]">
                <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.1fr_1.2fr] lg:gap-0 lg:py-16">
                    {/* Marque */}
                    <div className="lg:pr-10">
                        <SiteLogo light className="h-12" />
                        {site.tagline && <p className="mt-5 max-w-[300px] text-sm leading-relaxed">{site.tagline}</p>}
                        <div className="mt-6 flex gap-2">
                            {socials.map(({ icon: Icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="grid size-9 place-items-center border border-white/15 text-white/80 transition-colors hover:border-dym hover:bg-dym hover:text-white"
                                >
                                    <Icon className="size-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="lg:border-l lg:border-white/10 lg:px-10">
                        <ColumnTitle>Navigation</ColumnTitle>
                        <ul className="space-y-2.5 text-sm">
                            {siteNav.map((n) => (
                                <li key={n.label}>
                                    <a href={n.href} className="transition-colors hover:text-white">
                                        {n.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Activités */}
                    <div className="lg:border-l lg:border-white/10 lg:px-10">
                        <ColumnTitle>Nos activités</ColumnTitle>
                        <ul className="space-y-2.5 text-sm">
                            {activities.map((a) => (
                                <li key={a.id}>
                                    <a href="/#activites" className="transition-colors hover:text-white">
                                        {a.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="lg:border-l lg:border-white/10 lg:pl-10">
                        <ColumnTitle>Contact</ColumnTitle>
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
                                            <a href={href} className="flex items-start gap-3 text-white/85 transition-colors hover:text-white">
                                                {content}
                                            </a>
                                        ) : (
                                            <span className="flex items-start gap-3 text-white/85">{content}</span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                {/* Barre basse */}
                <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        © {new Date().getFullYear()} DYM Manufacture. Tous droits réservés. Fait par{' '}
                        <a href={CREDIT_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline decoration-dym decoration-1 underline-offset-4 transition-colors hover:text-dym">
                            DYM DEV
                        </a>
                        .
                    </p>
                    <p className="flex flex-wrap items-center gap-3">
                        {legalLinks.map((l, i) => (
                            <Fragment key={l.slug}>
                                {i > 0 && <span className="text-white/20">|</span>}
                                <Link href={showLegal(l.slug)} className="transition-colors hover:text-white">
                                    {l.label}
                                </Link>
                            </Fragment>
                        ))}
                    </p>
                </div>
            </div>
        </footer>
    );
}
