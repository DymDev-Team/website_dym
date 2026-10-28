import { useEffect, useRef } from 'react';
import type { CSSProperties, RefObject } from 'react';
import { useSiteLoaded } from '@/components/site/site-loaded';
import { lines, useTexts, withDot } from '@/components/site/use-texts';
import { useInView } from '@/components/site/use-in-view';
import { useSectionColor } from '@/components/site/use-section-color';
import { useParallax } from '@/components/site/use-parallax';

// Hero inspiré de « linea terra/linea-hero-v2 » : texte, engagements et
// animations d'entrée.

const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties;

// Film d'atelier muet en boucle, monté à partir du film de présentation
// (sans le logo ni les plans d'interview).
const VIDEO_SRC = '/videos/hero-atelier.mp4';
// Version 360p (~2,4 Mo au lieu de ~6 Mo) pour les petits écrans.
const VIDEO_SRC_MOBILE = '/videos/hero-atelier-mobile.mp4';
const VIDEO_POSTER = '/videos/hero-atelier.jpg';

// Ne lit la vidéo que si elle est affichée (pas en display:none) et que le hero
// est à l'écran ; sinon pause. Avec preload="none", la version masquée
// (bureau ou mobile) n'est jamais téléchargée.
function useAutoplay(video: RefObject<HTMLVideoElement | null>, active: boolean) {
    useEffect(() => {
        const v = video.current;

        if (!v) {
            return;
        }

        const sync = () => {
            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (active && !reduced && v.offsetParent !== null) {
                v.play().catch(() => {});
            } else {
                v.pause();
            }
        };
        sync();
        window.addEventListener('resize', sync);

        return () => window.removeEventListener('resize', sync);
    }, [video, active]);
}

export function Hero({ whatsappUrl }: { whatsappUrl: string | null }) {
    const sectionStyle = useSectionColor('hero');
    // Animations rejouées à chaque retour dans l'écran + photo en parallaxe légère.
    const [ref, inView] = useInView<HTMLElement>(0.2, false);
    // Attend la levée de l'écran de chargement avant de jouer l'entrée.
    const loaded = useSiteLoaded();
    const ready = inView && loaded;
    const t = useTexts();
    const titleLines = lines(t('home.hero.title'));
    const videoRef = useRef<HTMLVideoElement>(null);
    const mobileVideoRef = useRef<HTMLVideoElement>(null);
    useParallax(ref, videoRef, 24, 1.08);
    useAutoplay(videoRef, inView);
    useAutoplay(mobileVideoRef, inView);

    return (
        <section ref={ref} style={sectionStyle} id="accueil" aria-labelledby="hero-title" className={`hx-root relative isolate overflow-hidden bg-paper px-3 text-ink sm:px-5 lg:px-[clamp(24px,3.15vw,58px)] ${ready ? 'is-ready' : ''}`}>
            <div className="hx-mono hx-fade mx-auto flex h-11 max-w-[1720px] items-center justify-between gap-2 text-[9px] tracking-[0.07em] text-neutral-500" style={delay(0.1)} aria-hidden>
                <span>{t.c('home.hero.top_left')}</span>
                <span className="hidden sm:inline">{t.c('home.hero.top_right')}</span>
            </div>

            <div className="hx-hair relative isolate mx-auto flex max-w-[1720px] overflow-hidden border-y lg:min-h-[min(640px,calc(100svh-186px))]">
                {/* Vidéo atelier en arrière-plan */}
                <div className="hx-fade absolute inset-0 -z-10 hidden lg:left-[30%] lg:block" style={delay(0.2)} aria-hidden>
                    <video
                        ref={videoRef}
                        poster={VIDEO_POSTER}
                        muted
                        loop
                        playsInline
                        preload="none"
                        disablePictureInPicture
                        className="size-full scale-[1.08] object-cover will-change-transform"
                    >
                        {/* Un navigateur qui ignore « media » prend la première source (desktop). */}
                        <source src={VIDEO_SRC} media="(min-width: 768px)" type="video/mp4" />
                        <source src={VIDEO_SRC_MOBILE} type="video/mp4" />
                    </video>
                </div>
                {/* Voile blanc sous le texte, transparent sur la photo */}
                <div className="absolute inset-0 -z-10 hidden bg-linear-to-r from-paper from-35% via-paper/75 via-48% to-transparent to-62% lg:block" aria-hidden />
                <span className="hx-mono hx-fade absolute right-5 bottom-5 hidden items-center gap-2 bg-paper/90 px-2.5 py-2 text-[9px] tracking-[0.06em] text-ink lg:flex" style={delay(1.15)}>
                    <span className="size-[5px] bg-dym" /> {t.c('home.hero.caption')}
                </span>

                {/* Texte */}
                <div className="relative flex w-full min-w-0 flex-col justify-between lg:w-[58%]">
                    <div className="hx-mono hx-hair hx-fade flex h-10 items-center justify-between gap-2.5 border-b px-3.5 text-[8px] tracking-[0.04em] text-neutral-500 sm:px-6 sm:text-[9px]" style={delay(0.23)}>
                        <span className="flex items-center gap-2.5">
                            <i className="block h-px w-4 bg-dym" /> {t.c('home.hero.step')}
                        </span>
                        <span className="text-right lg:hidden">{t.c('home.hero.mobile_tagline')}</span>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col justify-center px-[17px] pt-11 pb-12 sm:px-7 lg:px-[clamp(22px,3vw,52px)] lg:pt-[clamp(20px,2.5vw,40px)] lg:pb-7">
                        <div className="hx-mono hx-label hx-fade mb-6 flex items-center gap-3 text-[10px] tracking-[0.075em] text-neutral-500 lg:mb-[clamp(18px,3vh,32px)]" style={delay(0.35)}>
                            <span className="inline-block size-[5px] bg-dym" /> {t.c('home.hero.eyebrow')}
                        </div>

                        <h1 id="hero-title" className="mb-5 font-display text-[clamp(48px,11vw,72px)] leading-[0.95] text-ink uppercase lg:mb-[clamp(16px,2.5vh,32px)] lg:text-[clamp(48px,4.4vw,80px)]">
                            {titleLines.map((line, i) => (
                                <span key={line} className="hx-line -mt-[0.18em] -mb-[0.07em] block overflow-hidden pt-[0.18em] pb-[0.07em]">
                                    <span style={delay(0.42 + i * 0.12)}>{t.c('home.hero.title', i === titleLines.length - 1 ? withDot(line) : line)}</span>
                                </span>
                            ))}
                        </h1>

                        <div className="hx-divider h-px bg-ink/20" />

                        <div className="hx-fade my-7 lg:my-[clamp(18px,2.8vh,30px)]" style={delay(0.88)}>
                            <p className="max-w-[430px] text-sm leading-[1.67] text-neutral-600 lg:text-[clamp(13px,1.03vw,17px)]">
                                {t.c('home.hero.intro')}
                            </p>
                        </div>

                        <a
                            href={whatsappUrl ?? '/devis'}
                            target={whatsappUrl ? '_blank' : undefined}
                            rel={whatsappUrl ? 'noopener noreferrer' : undefined}
                            className="hx-button hx-fade hx-mono relative inline-flex min-h-[58px] w-full items-center justify-between gap-4 self-start overflow-hidden border border-ink bg-ink py-[15px] pr-[18px] pl-[21px] text-[9px] tracking-[0.055em] text-paper sm:w-auto sm:min-w-[340px] sm:gap-11 sm:text-[10px]"
                            style={{ ...delay(1.03), ...t.style('home.hero.cta') }}
                        >
                            <span className="relative z-[1]">{t('home.hero.cta')}</span>
                            <span className="hx-arrow relative z-[1] shrink-0 font-sans text-2xl transition-transform duration-300" aria-hidden>
                                ↗
                            </span>
                        </a>
                    </div>

                    {/* Vidéo atelier en bloc (mobile/tablette) */}
                    <figure className="hx-fade hx-hair relative m-0 aspect-[4/3] overflow-hidden border-t sm:aspect-[16/9] lg:hidden" style={delay(0.9)}>
                        <video
                            ref={mobileVideoRef}
                            src={VIDEO_SRC}
                            poster={VIDEO_POSTER}
                            muted
                            loop
                            playsInline
                            preload="none"
                            disablePictureInPicture
                            aria-label={t('home.hero.video_alt')}
                            className="size-full object-cover"
                        />
                        <figcaption className="hx-mono absolute bottom-3 left-3 flex items-center gap-2 bg-paper/90 px-2.5 py-1.5 text-[9px] tracking-[0.06em] text-ink">
                            <span className="size-[5px] bg-dym" /> {t.c('home.hero.caption')}
                        </figcaption>
                    </figure>

                </div>
            </div>

            <div className="hx-mono hx-fade mx-auto flex h-11 max-w-[1720px] items-center justify-between gap-4 text-[8px] tracking-[0.05em] text-neutral-500 sm:text-[9px]" style={delay(1.15)}>
                <span>{t.c('home.hero.bottom_left')}</span>
                <span className="flex items-center gap-3">
                    {t.c('home.hero.scroll')}{' '}
                    <span className="hx-scroll-arrow text-[17px] text-dym" aria-hidden>
                        ↓
                    </span>
                </span>
                <span className="hidden sm:inline">{t.c('home.hero.bottom_right')}</span>
            </div>
        </section>
    );
}
