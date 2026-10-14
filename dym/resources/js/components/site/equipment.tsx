import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useInView } from '@/components/site/use-in-view';
import type { Equipment as EquipmentItem } from '@/types/admin';

const titleLines = ['Une technologie', 'au service de la qualité.'];

const ROTATE_MS = 4500;

const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties;

// Plan d'élévation simplifié d'une table de découpe, tracé au défilement.
function MachineBlueprint({ label }: { label: string }) {
    const draw = (d: number) => ({
        className: 'hx-draw',
        pathLength: 1,
        style: delay(d),
    });

    return (
        <svg viewBox="0 0 520 270" className="h-auto w-full text-white" role="img" aria-label="Plan technique d’une machine de l’atelier">
            <g fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1">
                {/* Bâti et pieds */}
                <rect x="40" y="140" width="360" height="60" {...draw(0.3)} />
                <rect x="58" y="200" width="22" height="34" {...draw(0.5)} />
                <rect x="360" y="200" width="22" height="34" {...draw(0.5)} />
                <line x1="40" y1="156" x2="400" y2="156" {...draw(0.45)} />
                {Array.from({ length: 19 }, (_, i) => (
                    <line key={i} x1={50 + i * 19} y1="140" x2={50 + i * 19} y2="156" strokeOpacity="0.3" {...draw(0.6 + i * 0.02)} />
                ))}
                {/* Portique et tête de coupe */}
                <rect x="60" y="58" width="330" height="16" {...draw(0.4)} />
                <rect x="70" y="74" width="14" height="66" {...draw(0.55)} />
                <rect x="366" y="74" width="14" height="66" {...draw(0.55)} />
                <rect x="190" y="74" width="34" height="40" {...draw(0.7)} />
                <path d="M198 114 L216 114 L210 130 L204 130 Z" {...draw(0.8)} />
                {/* Armoire de commande */}
                <rect x="418" y="86" width="66" height="148" {...draw(0.5)} />
                <rect x="428" y="98" width="46" height="30" {...draw(0.75)} />
                <line x1="428" y1="142" x2="474" y2="142" {...draw(0.85)} />
                <line x1="428" y1="152" x2="474" y2="152" {...draw(0.9)} />
                {/* Cotes */}
                <g strokeOpacity="0.35">
                    <line x1="40" y1="30" x2="484" y2="30" {...draw(1)} />
                    <line x1="40" y1="24" x2="40" y2="36" {...draw(1)} />
                    <line x1="484" y1="24" x2="484" y2="36" {...draw(1)} />
                    <line x1="502" y1="58" x2="502" y2="234" {...draw(1.1)} />
                    <line x1="496" y1="58" x2="508" y2="58" {...draw(1.1)} />
                    <line x1="496" y1="234" x2="508" y2="234" {...draw(1.1)} />
                    <line x1="20" y1="234" x2="500" y2="234" strokeDasharray="3 5" />
                </g>
            </g>
            <g className="hx-mono" fill="currentColor" fillOpacity="0.6" fontSize="9">
                <text x="262" y="24" textAnchor="middle">
                    4 000
                </text>
                <text x="514" y="150" transform="rotate(90 514 150)" textAnchor="middle">
                    1 800
                </text>
                <text x="40" y="258" fillOpacity="0.45">
                    FIG. / {label.toUpperCase()}
                </text>
            </g>
            {/* Repère orange sur la tête */}
            <g className="text-dym">
                <circle cx="207" cy="130" r="3" fill="currentColor" />
                <polyline points="207,130 250,100 300,100" fill="none" stroke="currentColor" strokeWidth="0.8" />
                <text x="254" y="94" fill="currentColor" fontSize="8" className="hx-mono">
                    TÊTE DE COUPE
                </text>
            </g>
        </svg>
    );
}

export function Equipment({ equipment: equipments }: { equipment: EquipmentItem[] }) {
    const [ref, inView] = useInView<HTMLElement>(0.15, false);
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
            ref={ref}
            id="equipements"
            aria-labelledby="equipements-title"
            className={`hx-root relative isolate overflow-hidden bg-ink px-5 text-white sm:px-8 lg:px-[clamp(24px,3.15vw,58px)] ${inView ? 'is-ready' : ''}`}
        >
            {/* Photos des machines, fondues dans le noir vers la gauche */}
            <div className="hx-fade absolute inset-y-0 right-0 -z-10 hidden w-[42%] lg:block" style={delay(0.2)} aria-hidden>
                {equipments.map((e, i) => (
                    <img
                        key={e.id}
                        src={e.image_url ?? undefined}
                        alt=""
                        loading="lazy"
                        className={`absolute inset-0 size-full object-cover transition-[opacity,transform] duration-1000 ease-out ${i === active ? 'scale-100 opacity-100' : 'scale-105 opacity-0'}`}
                    />
                ))}
                <div className="absolute inset-0 bg-linear-to-r from-ink via-ink/40 via-35% to-transparent to-70%" />
            </div>

            <div className="relative mx-auto max-w-[1720px] py-16 lg:py-20 lg:pl-[clamp(22px,3vw,52px)]">
                {/* En-tête */}
                <div className="grid gap-6 lg:w-[72%] lg:grid-cols-[auto_1fr] lg:items-end lg:gap-14">
                    <div>
                        <div className="hx-mono hx-fade mb-5 flex items-center gap-3 text-[10px] tracking-[0.075em] text-white/60" style={delay(0.05)}>
                            <span className="inline-block size-[5px] bg-dym" /> NOS ÉQUIPEMENTS
                        </div>
                        <h2 id="equipements-title" className="font-display text-[clamp(40px,9vw,56px)] leading-[0.95] uppercase lg:text-[clamp(40px,3.2vw,60px)] lg:whitespace-nowrap">
                            {titleLines.map((line, i) => (
                                <span key={line} className="hx-line -mt-[0.18em] -mb-[0.07em] block overflow-hidden pt-[0.18em] pb-[0.07em]">
                                    <span style={delay(0.12 + i * 0.12)}>
                                        {i === titleLines.length - 1 ? (
                                            <>
                                                {line.slice(0, -1)}
                                                <span className="text-dym">.</span>
                                            </>
                                        ) : (
                                            line
                                        )}
                                    </span>
                                </span>
                            ))}
                        </h2>
                    </div>

                    <div className="hx-fade" style={delay(0.35)}>
                        <p className="max-w-[400px] text-[15px] leading-[1.7] text-white/70">Des machines performantes et des équipes qualifiées pour garantir précision, productivité et fiabilité.</p>
                        <a
                            href="#contact"
                            className="hd-cta relative mt-6 inline-flex items-center gap-3 overflow-hidden bg-dym px-6 py-3.5 text-[11px] font-semibold tracking-[0.14em] text-white uppercase transition-colors hover:bg-dym-dark"
                        >
                            Découvrir nos équipements
                            <ArrowRight className="hd-arrow size-4" />
                        </a>
                    </div>
                </div>

                {/* Liste + plan */}
                <div className="mt-12 grid gap-10 lg:mt-16 lg:w-[66%] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end">
                    <ul className="hx-hair border-t border-white/15" onMouseLeave={() => setPaused(false)}>
                        {equipments.map((e, i) => {
                            const on = i === active;

                            return (
                                <li key={e.name} className="hx-fade border-b border-white/15" style={delay(0.45 + i * 0.08)}>
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
                                        <span className={`hx-mono pt-0.5 text-[10px] transition-colors ${on ? 'text-dym' : 'text-white/40'}`}>{String(i + 1).padStart(2, '0')}</span>
                                        <span className="flex-1">
                                            <span className={`hx-mono block text-[12px] tracking-[0.12em] uppercase transition-colors ${on ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{e.name}</span>
                                            <span
                                                className={`grid text-[13px] leading-relaxed text-white/55 transition-[grid-template-rows,opacity,margin] duration-500 ${
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

                    <div className="hidden sm:block">
                        <MachineBlueprint label={equipments[active].name} />
                    </div>
                </div>

                {/* Photo sur mobile */}
                <div className="relative mt-10 aspect-video overflow-hidden lg:hidden">
                    {equipments.map((e, i) => (
                        <img
                            key={e.id}
                            src={e.image_url ?? undefined}
                            alt={e.name}
                            loading="lazy"
                            className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-0'}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
