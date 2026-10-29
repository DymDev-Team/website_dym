import { Link } from '@inertiajs/react';
import type { CSSProperties } from 'react';
import { useInView } from '@/components/site/use-in-view';
import { useSectionColor } from '@/components/site/use-section-color';
import { lines, useTexts, withDot } from '@/components/site/use-texts';
import { activities } from '@/routes';

const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties;

// « À propos », sous le bandeau principal : titre, paragraphe et bouton vers la
// page Activités ; photo fixe cadrée comme la vidéo du bandeau.
export function Intro() {
    const sectionStyle = useSectionColor('intro');
    const [ref, inView] = useInView<HTMLElement>(0.2, false);
    const t = useTexts();
    const titleLines = lines(t('home.intro.title'));
    const photo = t('home.intro.image');

    return (
        // --intro-bg : le voile devant la photo reprend la couleur de fond choisie dans le panel.
        <section ref={ref} style={{ ...sectionStyle, '--intro-bg': sectionStyle.backgroundColor ?? 'var(--color-paper)' } as CSSProperties} id="a-propos" aria-labelledby="intro-title" className={`hx-root relative isolate overflow-hidden bg-paper px-5 text-ink sm:px-8 lg:px-[clamp(24px,3.15vw,58px)] ${inView ? 'is-ready' : ''}`}>
            <div className="relative mx-auto max-w-[1720px] py-16 lg:py-24 lg:pl-[clamp(22px,3vw,52px)]">
                {/* Photo fixe : même départ à 30 % que la vidéo du bandeau */}
                <div className="hx-fade absolute inset-y-0 right-0 -z-10 hidden lg:left-[30%] lg:block" style={delay(0.2)} aria-hidden>
                    <img src={photo} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
                </div>
                <div className="absolute inset-0 -z-10 hidden bg-linear-to-r from-(--intro-bg) from-35% via-(--intro-bg)/75 via-48% to-transparent to-62% lg:block" aria-hidden />

                <div className="lg:w-[45%]">
                    <h2 id="intro-title" className="font-sans text-[clamp(28px,7vw,36px)] leading-[1.15] font-bold text-dym uppercase lg:text-[clamp(32px,2.6vw,48px)]">
                        {titleLines.map((line, i) => (
                            <span key={line} className="hx-line block overflow-hidden">
                                <span style={delay(0.15 + i * 0.12)}>{t.c('home.intro.title', i === titleLines.length - 1 ? withDot(line) : line)}</span>
                            </span>
                        ))}
                    </h2>

                    <p className="hx-fade mt-4 max-w-[640px] text-[17px] leading-[1.55] text-neutral-600 lg:text-[clamp(17px,1.3vw,23px)]" style={delay(0.4)}>
                        {t.c('home.intro.text')}
                    </p>

                    <Link
                        href={activities()}
                        // Fond et bordure choisis dans /admin/texts ; couleur du texte comme les autres textes.
                        style={{ ...delay(0.55), backgroundColor: t('home.intro.cta_background'), borderColor: t('home.intro.cta_border'), ...t.style('home.intro.cta') }}
                        className="hx-fade mt-8 inline-flex items-center rounded-[10px] border px-5 py-2.5 text-[18px] font-bold text-dym shadow-sm transition-[box-shadow,filter] hover:shadow-md hover:brightness-95 lg:text-[clamp(18px,1.5vw,26px)]"
                    >
                        {t('home.intro.cta')}
                    </Link>
                </div>

                {/* Photo sur mobile */}
                <div className="relative mt-10 aspect-video overflow-hidden lg:hidden">
                    <img src={photo} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
                </div>
            </div>
        </section>
    );
}
