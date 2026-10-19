import { Play, X } from 'lucide-react';
import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { useInView } from '@/components/site/use-in-view';
import { useParallax } from '@/components/site/use-parallax';
import { lines, useTexts, withDot } from '@/components/site/use-texts';


const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties;

export function Intro() {
    const [ref, inView] = useInView<HTMLElement>(0.2, false);
    const t = useTexts();
    const titleLines = lines(t('home.intro.title'));
    const values = lines(t('home.intro.values'));
    const photoRef = useRef<HTMLImageElement>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useParallax(ref, photoRef);

    const openVideo = () => {
        dialogRef.current?.showModal();
        videoRef.current?.play().catch(() => {});
    };

    const closeVideo = () => {
        videoRef.current?.pause();
        dialogRef.current?.close();
    };

    return (
        <section ref={ref} id="a-propos" aria-labelledby="intro-title" className={`hx-root relative isolate overflow-hidden bg-paper px-5 text-ink sm:px-8 lg:px-[clamp(24px,3.15vw,58px)] ${inView ? 'is-ready' : ''}`}>
            {/* Photo découpe laser, fondue dans le noir vers la gauche */}
            <div className="hx-fade absolute inset-0 -z-10 lg:left-[34%]" style={delay(0.1)} aria-hidden>
                <img ref={photoRef} src="/images/images/16.jpg" alt="" width={1470} height={754} loading="lazy" className="size-full scale-[1.15] object-cover object-[60%_center] will-change-transform" />
            </div>
            <div className="absolute inset-0 -z-10 bg-paper/85 lg:bg-transparent lg:bg-linear-to-r lg:from-paper lg:from-34% lg:via-paper/80 lg:via-46% lg:to-transparent lg:to-65%" aria-hidden />

            <div className="relative mx-auto flex max-w-[1720px] py-16 lg:min-h-[460px] lg:items-center lg:py-20">
                {/* Cote verticale décorative */}
                <div aria-hidden className="absolute top-12 bottom-12 left-0 hidden w-3 lg:block">
                    <span className="absolute inset-y-0 left-1/2 w-px bg-ink/25" />
                    <span className="absolute top-0 left-0 h-px w-3 bg-ink/40" />
                    <span className="absolute bottom-0 left-0 h-px w-3 bg-ink/40" />
                </div>

                <div className="w-full max-w-[620px] lg:pl-[clamp(22px,3vw,52px)]">
                    <div className="hx-mono hx-fade mb-5 flex items-center gap-3 text-[10px] tracking-[0.075em] text-neutral-500" style={delay(0.15)}>
                        <span className="inline-block size-[5px] bg-dym" /> {t('home.intro.eyebrow')}
                    </div>

                    <h2 id="intro-title" className="font-display text-[clamp(40px,9vw,56px)] leading-[0.95] uppercase lg:text-[clamp(44px,3.8vw,68px)]">
                        {titleLines.map((line, i) => (
                            <span key={line} className="hx-line -mt-[0.18em] -mb-[0.07em] block overflow-hidden pt-[0.18em] pb-[0.07em]">
                                <span style={delay(0.25 + i * 0.12)}>
                                    {i === titleLines.length - 1 ? withDot(line) : line}
                                </span>
                            </span>
                        ))}
                    </h2>

                    <p className="hx-fade mt-6 max-w-[460px] text-[15px] leading-[1.7] text-neutral-600" style={delay(0.55)}>
                        {t('home.intro.text')}
                    </p>

                    <button type="button" onClick={openVideo} className="group hx-fade mt-9 inline-flex cursor-pointer items-center gap-4 text-left" style={delay(0.7)}>
                        <span className="relative grid size-14 place-items-center rounded-full border border-ink/60 transition-colors duration-300 group-hover:border-dym group-hover:bg-dym group-focus-visible:border-dym group-focus-visible:bg-dym">
                            <span className="absolute -inset-2 animate-ping rounded-full border border-ink/20 [animation-duration:2.4s] motion-reduce:animate-none" aria-hidden />
                            <Play className="size-4 translate-x-px fill-ink" />
                        </span>
                        <span className="hx-mono text-[10px] leading-relaxed tracking-[0.1em] text-ink/80 uppercase">
                            {lines(t('home.intro.video_button')).map((part, i) => (
                                <span key={i} className="block">
                                    {part}
                                </span>
                            ))}
                        </span>
                    </button>
                </div>

                {/* Valeurs */}
                <ul className="hx-mono absolute right-0 bottom-12 hidden space-y-2.5 text-[10px] tracking-[0.12em] text-white/75 uppercase lg:block">
                    {values.map((v, i) => (
                        <li key={v} className="hx-fade flex items-center gap-3" style={delay(0.8 + i * 0.08)}>
                            <span className="h-px w-5 bg-dym" aria-hidden />
                            {v}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Lecteur vidéo (chargé seulement à l'ouverture) */}
            <dialog
                ref={dialogRef}
                onClose={() => videoRef.current?.pause()}
                onClick={(e) => e.target === dialogRef.current && closeVideo()}
                aria-label={t('home.intro.video_label')}
                className="m-auto w-[min(1100px,92vw)] bg-transparent p-0 backdrop:bg-black/85"
            >
                <button
                    type="button"
                    onClick={closeVideo}
                    className="ml-auto mb-3 grid size-10 cursor-pointer place-items-center border border-white/30 text-white hover:border-dym hover:bg-dym"
                    aria-label={t('home.intro.video_close')}
                >
                    <X className="size-5" />
                </button>
                <video ref={videoRef} src="/videos/presentation.mp4" poster="/videos/presentation.jpg" controls playsInline preload="none" className="aspect-video w-full bg-black" />
            </dialog>
        </section>
    );
}
