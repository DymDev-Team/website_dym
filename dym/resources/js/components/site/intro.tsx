import type { CSSProperties } from 'react';
import { useInView } from '@/components/site/use-in-view';
import { useSectionColor } from '@/components/site/use-section-color';
import { lines, useTexts, withDot } from '@/components/site/use-texts';

const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties;

// « À propos », sous le bandeau principal : même structure de texte que le
// bandeau (surtitre, titre, trait, paragraphe) et photo fixe cadrée comme sa vidéo.
export function Intro() {
    const sectionStyle = useSectionColor('intro');
    const [ref, inView] = useInView<HTMLElement>(0.2, false);
    const t = useTexts();
    const titleLines = lines(t('home.intro.title'));
    const photo = t('home.intro.image');

    return (
        <section ref={ref} style={sectionStyle} id="a-propos" aria-labelledby="intro-title" className={`hx-root relative isolate overflow-hidden bg-paper px-5 text-ink sm:px-8 lg:px-[clamp(24px,3.15vw,58px)] ${inView ? 'is-ready' : ''}`}>
            <div className="hx-hair relative mx-auto max-w-[1720px] border-b py-16 lg:py-20 lg:pl-[clamp(22px,3vw,52px)]">
                {/* Photo fixe : même départ à 30 % et même voile que la vidéo du bandeau */}
                <div className="hx-fade absolute inset-y-0 right-0 -z-10 hidden lg:left-[30%] lg:block" style={delay(0.2)} aria-hidden>
                    <img src={photo} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
                </div>
                <div className="absolute inset-0 -z-10 hidden bg-linear-to-r from-paper from-35% via-paper/75 via-48% to-transparent to-62% lg:block" aria-hidden />

                <div className="lg:w-[45%]">
                    <div className="hx-mono hx-label hx-fade mb-6 flex items-center gap-3 text-[10px] tracking-[0.075em] text-neutral-500" style={delay(0.15)}>
                        <span className="inline-block size-[5px] bg-dym" /> {t.c('home.intro.eyebrow')}
                    </div>

                    <h2 id="intro-title" className="mb-5 font-display text-[clamp(40px,9vw,56px)] leading-[0.95] uppercase lg:mb-8 lg:text-[clamp(44px,3.8vw,68px)]">
                        {titleLines.map((line, i) => (
                            <span key={line} className="hx-line -mt-[0.18em] -mb-[0.07em] block overflow-hidden pt-[0.18em] pb-[0.07em]">
                                <span style={delay(0.25 + i * 0.12)}>{t.c('home.intro.title', i === titleLines.length - 1 ? withDot(line) : line)}</span>
                            </span>
                        ))}
                    </h2>

                    <div className="hx-divider h-px bg-ink/20" />

                    <p className="hx-fade mt-7 max-w-[460px] text-[15px] leading-[1.7] text-neutral-600" style={delay(0.55)}>
                        {t.c('home.intro.text')}
                    </p>
                </div>

                {/* Photo sur mobile */}
                <div className="relative mt-10 aspect-video overflow-hidden lg:hidden">
                    <img src={photo} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
                </div>
            </div>
        </section>
    );
}
