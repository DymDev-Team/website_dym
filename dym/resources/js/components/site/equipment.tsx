import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { blueprintFor } from '@/components/site/blueprints';
import type { Draw } from '@/components/site/blueprints';
import { useInView } from '@/components/site/use-in-view';
import { useSectionColor } from '@/components/site/use-section-color';
import type { Equipment as EquipmentItem } from '@/types/admin';
import { lines, useTexts, withDot } from '@/components/site/use-texts';
import { ScrollLink } from '@/components/site/scroll-link';


const ROTATE_MS = 4500;

const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties;

// Plan de la machine active, retracé à chaque changement (clé = nom).
function MachineBlueprint({ label }: { label: string }) {
    const draw: Draw = (d) => ({ className: 'hx-draw', pathLength: 1, style: delay(d) });
    const bp = blueprintFor(label);
    const { x, y, left } = bp.callout;
    const k = left ? -1 : 1;

    return (
        <svg key={label} viewBox="0 0 520 270" className="h-auto w-full text-ink" role="img" aria-label={`Plan technique : ${label}`}>
            <g fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1">
                {bp.parts(draw)}
                {/* Cotes */}
                <g strokeOpacity="0.35">
                    <line x1="40" y1="20" x2="484" y2="20" {...draw(1)} />
                    <line x1="40" y1="14" x2="40" y2="26" {...draw(1)} />
                    <line x1="484" y1="14" x2="484" y2="26" {...draw(1)} />
                    <line x1="510" y1="40" x2="510" y2="234" {...draw(1.1)} />
                    <line x1="504" y1="40" x2="516" y2="40" {...draw(1.1)} />
                    <line x1="504" y1="234" x2="516" y2="234" {...draw(1.1)} />
                    <line x1="20" y1="234" x2="500" y2="234" strokeDasharray="3 5" />
                </g>
            </g>
            <g className="hx-mono" fill="currentColor" fillOpacity="0.6" fontSize="9">
                <text x="262" y="14" textAnchor="middle">
                    {bp.width}
                </text>
                <text x="520" y="137" transform="rotate(90 520 137)" textAnchor="middle">
                    {bp.height}
                </text>
                <text x="40" y="258" fillOpacity="0.45">
                    FIG. / {label.toUpperCase()}
                </text>
            </g>
            {/* Repère couleur DYM */}
            <g className="text-dym">
                <circle cx={x} cy={y} r="3" fill="currentColor" />
                <polyline points={`${x},${y} ${x + 43 * k},${y - 30} ${x + 93 * k},${y - 30}`} fill="none" stroke="currentColor" strokeWidth="0.8" />
                <text x={x + 47 * k} y={y - 36} textAnchor={left ? 'end' : 'start'} fill="currentColor" fontSize="8" className="hx-mono">
                    {bp.callout.label}
                </text>
            </g>
        </svg>
    );
}

type Props = {
    equipment: EquipmentItem[];
    // 2ᵉ section : ses propres textes, couleur et ancre ; blueprint={false} retire le plan technique.
    textKey?: string;
    colorKey?: string;
    id?: string;
    blueprint?: boolean;
};

export function Equipment({ equipment: equipments, textKey = 'home.equipment', colorKey = 'equipment', id = 'equipements', blueprint = true }: Props) {
    const sectionStyle = useSectionColor(colorKey);
    const [ref, inView] = useInView<HTMLElement>(0.15, false);
    const t = useTexts();
    const titleLines = lines(t(`${textKey}.title`));
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);

    // Rotation automatique tant que la section est visible et non survolée.
    useEffect(() => {
        if (!inView || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const id = window.setInterval(() => setActive((a) => (a + 1) % equipments.length), ROTATE_MS);

        return () => window.clearInterval(id);
    }, [inView, paused, equipments.length]);

    if (equipments.length === 0) {
        return null;
    }

    return (
        <section
            style={sectionStyle}
            ref={ref}
            id={id}
            aria-labelledby={`${id}-title`}
            className={`hx-root relative isolate overflow-hidden bg-paper px-5 text-ink sm:px-8 lg:px-[clamp(24px,3.15vw,58px)] ${inView ? 'is-ready' : ''}`}
        >
            {/* Photos des machines, fondues dans le fond clair vers la gauche */}
            <div className="hx-fade absolute inset-y-0 right-0 -z-10 hidden w-[42%] lg:block" style={delay(0.2)} aria-hidden>
                {equipments[active] && (
                    <img
                        key={equipments[active].id}
                        src={equipments[active].image_url ?? undefined}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 size-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-linear-to-r from-paper via-paper/55 via-35% to-transparent to-70%" />
            </div>

            <div className="relative mx-auto max-w-[1720px] py-16 lg:py-20 lg:pl-[clamp(22px,3vw,52px)]">
                {/* En-tête */}
                <div className="grid gap-6 lg:w-[72%] lg:grid-cols-[auto_1fr] lg:items-end lg:gap-14">
                    <div>
                        <div className="hx-mono hx-label hx-fade mb-5 flex items-center gap-3 text-[10px] tracking-[0.075em] text-neutral-500" style={delay(0.05)}>
                            <span className="inline-block size-[5px] bg-dym" /> {t.c(`${textKey}.eyebrow`)}
                        </div>
                        <h2 id={`${id}-title`} className="font-display text-[clamp(40px,9vw,56px)] leading-[0.95] uppercase lg:text-[clamp(40px,3.2vw,60px)] lg:whitespace-nowrap">
                            {titleLines.map((line, i) => (
                                <span key={line} className="hx-line -mt-[0.18em] -mb-[0.07em] block overflow-hidden pt-[0.18em] pb-[0.07em]">
                                    <span style={delay(0.12 + i * 0.12)}>
                                        {t.c(`${textKey}.title`, i === titleLines.length - 1 ? withDot(line) : line)}
                                    </span>
                                </span>
                            ))}
                        </h2>
                    </div>

                    <div className="hx-fade" style={delay(0.35)}>
                        <p className="max-w-[400px] text-[15px] leading-[1.7] text-neutral-600">{t.c(`${textKey}.text`)}</p>
                        <ScrollLink
                            target="contact"
                            style={t.style(`${textKey}.cta`)}
                            className="hd-cta relative mt-6 inline-flex items-center gap-3 overflow-hidden bg-dym px-6 py-3.5 text-[11px] font-semibold tracking-[0.14em] text-white uppercase transition-colors hover:bg-dym-dark"
                        >
                            {t(`${textKey}.cta`)}
                            <ArrowRight className="hd-arrow size-4" />
                        </ScrollLink>
                    </div>
                </div>

                {/* Liste + plan (sans plan, la liste prend sa place jusqu'à la photo) */}
                <div className={`mt-12 grid gap-10 lg:mt-16 ${blueprint ? 'lg:w-[66%] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end' : 'lg:w-[45%]'}`}>
                    <ul className="hx-hair border-t border-ink/15" onMouseLeave={() => setPaused(false)}>
                        {equipments.map((e, i) => {
                            const on = i === active;

                            return (
                                <li key={e.name} className="hx-fade border-b border-ink/15" style={delay(0.45 + i * 0.08)}>
                                    <button
                                        type="button"
                                        onMouseEnter={() => {
                                            setActive(i);
                                            setPaused(true);
                                        }}
                                        onFocus={() => {
                                            setActive(i);
                                            setPaused(true);
                                        }}
                                        onClick={() => setActive(i)}
                                        aria-pressed={on}
                                        className="group flex w-full cursor-pointer items-start gap-4 py-4 text-left"
                                    >
                                        <span className={`hx-mono pt-0.5 text-[10px] transition-colors ${on ? 'text-dym' : 'text-neutral-400'}`}>{String(i + 1).padStart(2, '0')}</span>
                                        <span className="flex-1">
                                            <span className={`hx-mono block text-[12px] tracking-[0.12em] uppercase transition-colors ${on ? 'text-ink' : 'text-neutral-500 group-hover:text-ink'}`}>{e.name}</span>
                                            <span
                                                className={`grid text-[13px] leading-relaxed text-neutral-600 transition-[grid-template-rows,opacity,margin] duration-500 ${
                                                    on ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                                }`}
                                            >
                                                <span className="overflow-hidden">{e.description}</span>
                                            </span>
                                        </span>
                                        <span className={`mt-1.5 h-px bg-dym transition-all duration-500 ${on ? 'w-8' : 'w-0'}`} aria-hidden />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    {blueprint && (
                        <div className="hidden sm:block">
                            <MachineBlueprint label={equipments[active].name} />
                        </div>
                    )}
                </div>

                {/* Photo sur mobile */}
                <div className="relative mt-10 aspect-video overflow-hidden lg:hidden">
                    {equipments[active] && (
                        <img
                            key={equipments[active].id}
                            src={equipments[active].image_url ?? undefined}
                            alt={equipments[active].name}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 size-full object-cover"
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
