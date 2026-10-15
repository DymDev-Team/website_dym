import { Link } from '@inertiajs/react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { create as quoteCreate } from '@/routes/quotes';
import { useTexts } from '@/components/site/use-texts';

export const siteNav = [
    // `label` identifie l'entrée (prop `active` des pages) ; le texte affiché
    // vient de t(`layout.header.nav_${key}`).
    { key: 'home', label: 'Accueil', href: '/' },
    { key: 'activities', label: 'Activités', href: '/activites' },
    { key: 'projects', label: 'Réalisations', href: '/#realisations' },
    { key: 'news', label: 'Actualités', href: '/actualites' },
    { key: 'careers', label: 'Carrière', href: '/carriere' },
];

const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties;

export function SiteLogo({ light = false, className = 'h-12' }: { light?: boolean; className?: string }) {
    return (
        <Link href="/" className="block shrink-0" aria-label="DYM Manufacture — accueil">
            <img src="/images/logo-dym-blanc.png" alt="DYM Manufacture" width={162} height={90} className={`w-auto transition-[height] duration-300 ${className} ${light ? '' : 'brightness-0'}`} />
        </Link>
    );
}

export function SiteHeader({ active = 'Accueil' }: { active?: string }) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hovered, setHovered] = useState<number | null>(null);
    const [bar, setBar] = useState({ x: 0, w: 0 });
    const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
    const t = useTexts();

    const activeIndex = siteNav.findIndex((item) => item.label === active);
    const target = hovered ?? activeIndex;

    // Compacte le header dès qu'on quitte le haut de page.
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Place la barre orange sous le lien survolé, sinon sous la page active.
    useLayoutEffect(() => {
        const measure = () => {
            const el = itemsRef.current[target];

            if (el) {
                setBar({ x: el.offsetLeft + 20, w: el.offsetWidth - 40 });
            }
        };
        measure();
        window.addEventListener('resize', measure);

        return () => window.removeEventListener('resize', measure);
    }, [target]);

    return (
        <header
            className={`hd-enter sticky top-0 z-40 border-b bg-paper/95 backdrop-blur transition-[box-shadow,border-color] duration-300 ${
                scrolled ? 'border-black/5 shadow-[0_8px_30px_rgb(20_20_20/0.08)]' : 'border-black/10'
            }`}
        >
            <div className={`mx-auto flex max-w-330 items-center justify-between gap-6 px-5 transition-[height] duration-300 lg:px-10 ${scrolled ? 'h-15' : 'h-18'}`}>
                <div className="hd-item" style={delay(0.15)}>
                    <SiteLogo className={scrolled ? 'h-10' : 'h-12'} />
                </div>

                <nav className="relative hidden h-full items-stretch lg:flex" onMouseLeave={() => setHovered(null)}>
                    {siteNav.map((item, i) => (
                        <a
                            key={item.label}
                            ref={(el) => {
                                itemsRef.current[i] = el;
                            }}
                            href={item.href}
                            onMouseEnter={() => setHovered(i)}
                            onFocus={() => setHovered(i)}
                            onBlur={() => setHovered(null)}
                            aria-current={item.label === active ? 'page' : undefined}
                            style={delay(0.25 + i * 0.06)}
                            className={`hd-item relative flex items-center border-l border-black/10 px-5 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors duration-300 first:border-l-0 ${
                                i === target ? 'text-ink' : 'text-neutral-600 hover:text-ink'
                            }`}
                        >
                            {t(`layout.header.nav_${item.key}`)}
                        </a>
                    ))}
                    <span
                        aria-hidden
                        className={`hd-indicator pointer-events-none absolute bottom-0 left-0 h-0.5 bg-dym ${target < 0 ? 'opacity-0' : ''}`}
                        style={{
                            width: bar.w,
                            transform: `translateX(${bar.x}px)`,
                        }}
                    />
                </nav>

                <div className="hd-item flex items-center gap-3" style={delay(0.6)}>
                    <Link
                        href={quoteCreate()}
                        className="hd-cta relative hidden items-center gap-2 overflow-hidden bg-dym px-5 py-3 text-[11px] font-semibold tracking-[0.14em] text-white uppercase transition-colors hover:bg-dym-dark sm:inline-flex"
                    >
                        {t('layout.header.cta')}
                        <ArrowRight className="hd-arrow size-3.5" />
                    </Link>
                    <button type="button" onClick={() => setOpen(!open)} className="hd-burger grid size-10 place-items-center border border-black/15 lg:hidden" aria-label="Menu" aria-expanded={open}>
                        {open ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </div>

            {open && (
                <nav className="hd-mobile border-t border-black/10 bg-paper px-5 pb-6 lg:hidden">
                    {siteNav.map((item, i) => (
                        <a
                            key={item.label}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            style={delay(0.05 + i * 0.05)}
                            className={`block border-b border-black/10 py-3 text-xs font-semibold tracking-[0.14em] uppercase ${item.label === active ? 'text-dym' : ''}`}
                        >
                            {t(`layout.header.nav_${item.key}`)}
                        </a>
                    ))}
                    <Link
                        href={quoteCreate()}
                        onClick={() => setOpen(false)}
                        style={delay(0.05 + siteNav.length * 0.05)}
                        className="hd-cta relative mt-5 inline-flex items-center gap-2 overflow-hidden bg-dym px-5 py-3 text-xs font-semibold tracking-[0.14em] text-white uppercase"
                    >
                        {t('layout.header.cta')} <ArrowRight className="hd-arrow size-3.5" />
                    </Link>
                </nav>
            )}
        </header>
    );
}
