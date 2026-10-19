import { ArrowLeft, ArrowRight, Factory, HardHat, PencilRuler } from 'lucide-react';
import { Fragment, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useInView } from '@/components/site/use-in-view';
import { lines, useTexts, withDot } from '@/components/site/use-texts';

// Textes et photos des étapes : home.process.step_N_{title,text,alt,image} (/admin/texts).
const steps = [
    { id: 'etudier', icon: PencilRuler },
    { id: 'fabriquer', icon: Factory },
    { id: 'realiser', icon: HardHat },
];

const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties;

export function Process() {
    const [ref, inView] = useInView<HTMLElement>(0.15, false);
    const trackRef = useRef<HTMLOListElement>(null);
    const [current, setCurrent] = useState(0);
    const t = useTexts();
    const titleLines = lines(t('home.process.title'));

    // Carrousel mobile : étape affichée = celle dont le bord gauche est le plus proche.
    useEffect(() => {
        const track = trackRef.current;

        if (!track) {
            return;
        }

        const update = () => {
            const items = [...track.querySelectorAll<HTMLElement>('[data-step]')];
            const left = track.getBoundingClientRect().left;
            let best = 0;
            items.forEach((el, i) => {
                const d = Math.abs(el.getBoundingClientRect().left - left);
                const bestD = Math.abs(items[best].getBoundingClientRect().left - left);

                if (d < bestD) {
                    best = i;
                }
            });
            setCurrent(best);
        };
        track.addEventListener('scroll', update, { passive: true });

        return () => track.removeEventListener('scroll', update);
    }, []);

    const goTo = (i: number) => {
        trackRef.current
            ?.querySelectorAll<HTMLElement>('[data-step]')
            [i]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    };

    return (
        <section ref={ref} id="approche" aria-labelledby="approche-title" className={`hx-root hx-hair relative border-t bg-paper px-5 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)] ${inView ? 'is-ready' : ''}`}>
            <div className="mx-auto max-w-[1720px] pt-16 pb-16 lg:pt-20 lg:pb-20">
                {/* En-tête */}
                <div className="grid items-end gap-6 lg:grid-cols-2 lg:gap-10 lg:pl-[clamp(22px,3vw,52px)]">
                    <div>
                        <div className="hx-mono hx-fade mb-5 flex items-center gap-3 text-[10px] tracking-[0.075em] text-neutral-500" style={delay(0.05)}>
                            <span className="inline-block size-[5px] bg-dym" /> {t('home.process.eyebrow')}
                        </div>
                        <h2 id="approche-title" className="font-display text-[clamp(40px,9vw,56px)] leading-[0.95] text-ink uppercase lg:text-[clamp(44px,3.8vw,68px)]">
                            {titleLines.map((line, i) => (
                                <span key={line} className="hx-line -mt-[0.18em] -mb-[0.07em] block overflow-hidden pt-[0.18em] pb-[0.07em]">
                                    <span style={delay(0.12 + i * 0.12)}>
                                        {i === titleLines.length - 1 ? withDot(line) : line}
                                    </span>
                                </span>
                            ))}
                        </h2>
                    </div>

                    <p className="hx-fade max-w-[460px] text-[15px] leading-[1.7] text-neutral-600" style={delay(0.35)}>
                        {t('home.process.text')}
                    </p>
                </div>

                {/* Étapes */}
                <ol
                    ref={trackRef}
                    className="-mx-5 mt-10 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 [scrollbar-width:none] sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:mt-14 lg:grid lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:gap-6 lg:overflow-visible lg:px-0 lg:pl-[clamp(22px,3vw,52px)] [&::-webkit-scrollbar]:hidden"
                >
                    {steps.map((s, i) => {
                        const Icon = s.icon;
                        const step = `home.process.step_${i + 1}`;

                        return (
                            <Fragment key={s.id}>
                                {i > 0 && (
                                    <li aria-hidden className="hx-fade hidden items-center text-neutral-400 lg:flex" style={delay(0.5 + i * 0.35)}>
                                        <ArrowRight className="size-5" />
                                    </li>
                                )}
                                <li data-step className="w-[84%] min-w-0 shrink-0 snap-start sm:w-[58%] lg:w-auto">
                                    <div className="hx-fade flex items-center gap-4" style={delay(0.4 + i * 0.35)}>
                                        <span className="hx-hair grid size-11 shrink-0 place-items-center border bg-white/40 text-ink">
                                            <Icon className="size-[18px]" strokeWidth={1.5} />
                                        </span>
                                        <div>
                                            <span className="hx-mono block text-[10px] text-dym">{String(i + 1).padStart(2, '0')}</span>
                                            <h3 className="hx-mono text-[11px] leading-snug tracking-[0.08em] text-ink uppercase">
                                                {lines(t(`${step}_title`)).map((part, j) => (
                                                    <span key={j} className="block">
                                                        {part}
                                                    </span>
                                                ))}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="hx-hair relative mt-5 aspect-[4/3] overflow-hidden border bg-neutral-100">
                                        <img src={t(`${step}_image`)} alt={t(`${step}_alt`)} width={1100} height={735} loading="lazy" className="hx-wipe size-full object-cover" style={delay(0.5 + i * 0.35)} />
                                        <span className="hx-mono absolute right-2 bottom-2 bg-paper/90 px-2 py-1 text-[9px] tracking-[0.06em] text-ink" aria-hidden>
                                            {t('home.process.step_label')} {String(i + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
                                        </span>
                                    </div>

                                    <p className="hx-fade mt-4 text-sm leading-relaxed text-neutral-600" style={delay(0.6 + i * 0.35)}>
                                        {t(`${step}_text`)}
                                    </p>
                                </li>
                            </Fragment>
                        );
                    })}
                </ol>

                {/* Navigation du carrousel (mobile/tablette) */}
                <div className="mt-6 flex items-center justify-between lg:hidden">
                    <div className="flex gap-2">
                        {steps.map((s, i) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => goTo(i)}
                                aria-label={`${t('home.process.step_label')} ${i + 1}`}
                                aria-current={i === current}
                                className={`h-1 cursor-pointer transition-all duration-500 ${i === current ? 'w-10 bg-dym' : 'w-4 bg-ink/15'}`}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {([-1, 1] as const).map((dir) => {
                            const target = current + dir;
                            const disabled = target < 0 || target >= steps.length;

                            return (
                                <button
                                    key={dir}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => goTo(target)}
                                    aria-label={dir < 0 ? 'Étape précédente' : 'Étape suivante'}
                                    className="hx-hair grid size-10 cursor-pointer place-items-center border text-ink transition-colors hover:border-dym hover:bg-dym hover:text-white disabled:cursor-default disabled:opacity-35 disabled:hover:border-ink/20 disabled:hover:bg-transparent disabled:hover:text-ink"
                                >
                                    {dir < 0 ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
