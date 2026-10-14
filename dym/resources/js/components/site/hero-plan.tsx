import { ArrowRight } from 'lucide-react';

// Escalier en élévation : palier à gauche, volée de 10 marches vers la droite.
const STEPS = 10;
const RISE = 26;
const RUN = 23;
const LANDING_Y = 180;
const LANDING_END = 330;
const GROUND_Y = LANDING_Y + STEPS * RISE;
const STAIR_END = LANDING_END + STEPS * RUN;
const RAIL_H = 62;

const railY = (x: number) => LANDING_Y - RAIL_H + ((x - LANDING_END) * (STEPS * RISE)) / (STEPS * RUN);

const treads = Array.from({ length: STEPS }, (_, i) => ({
    x: LANDING_END + i * RUN,
    y: LANDING_Y + i * RISE,
}));

const profile = treads.flatMap(({ x, y }) => [`${x},${y}`, `${x + RUN},${y}`, `${x + RUN},${y + RISE}`]).join(' ');

function Callout({ x, y, tx, ty, lines, anchor = 'start' }: { x: number; y: number; tx: number; ty: number; lines: string[]; anchor?: 'start' | 'end' }) {
    return (
        <g className="text-dym">
            <circle cx={x} cy={y} r="3" fill="currentColor" />
            <polyline points={`${x},${y} ${tx},${ty + 4} ${tx + (anchor === 'start' ? 70 : -70)},${ty + 4}`} fill="none" stroke="currentColor" strokeWidth="0.8" />
            {lines.map((l, i) => (
                <text key={l} x={tx} y={ty - 4 - (lines.length - 1 - i) * 12} textAnchor={anchor} fill="currentColor" className="font-mono text-[9px] tracking-[0.12em] uppercase">
                    {l}
                </text>
            ))}
        </g>
    );
}

function StairDrawing() {
    const posts = [128, 228, 322];

    return (
        <svg viewBox="40 20 620 500" className="h-auto w-full text-ink" role="img" aria-label="Plan technique d'un escalier métallique avec palier">
            {/* Lignes de construction */}
            <g stroke="currentColor" strokeWidth="0.4" opacity="0.25">
                {[60, 120, 180, 240, 300, 360, 420].map((y) => (
                    <line key={y} x1="70" y1={y + 20} x2="640" y2={y + 20} strokeDasharray="2 6" />
                ))}
                {[128, 228, 322, 445, 560].map((x) => (
                    <line key={x} x1={x} y1="40" x2={x} y2="480" strokeDasharray="2 6" />
                ))}
            </g>

            {/* Sol */}
            <line x1="70" y1={GROUND_Y} x2="640" y2={GROUND_Y} stroke="currentColor" strokeWidth="1.2" />
            <g stroke="currentColor" strokeWidth="0.6" opacity="0.5">
                {Array.from({ length: 28 }, (_, i) => (
                    <line key={i} x1={80 + i * 20} y1={GROUND_Y} x2={70 + i * 20} y2={GROUND_Y + 10} />
                ))}
            </g>

            {/* Poteaux + contreventement */}
            {posts.map((x) => (
                <rect key={x} x={x - 5} y={LANDING_Y + 10} width="10" height={GROUND_Y - LANDING_Y - 10} fill="currentColor" />
            ))}
            <g stroke="currentColor" strokeWidth="2" opacity="0.8">
                <line x1="133" y1="215" x2="223" y2="400" />
                <line x1="223" y1="215" x2="133" y2="400" />
                <line x1="233" y1="215" x2="317" y2="400" />
                <line x1="317" y1="215" x2="233" y2="400" />
            </g>

            {/* Palier */}
            <rect x="118" y={LANDING_Y} width={LANDING_END - 118} height="12" fill="currentColor" />

            {/* Limon + marches */}
            <line x1={LANDING_END} y1={LANDING_Y + 14} x2={STAIR_END - 8} y2={GROUND_Y} stroke="currentColor" strokeWidth="10" />
            <polyline points={`${LANDING_END},${LANDING_Y} ${profile}`} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" />

            {/* Garde-corps palier */}
            <g stroke="currentColor">
                <line x1="120" y1={LANDING_Y - RAIL_H} x2={LANDING_END} y2={LANDING_Y - RAIL_H} strokeWidth="3.5" />
                <line x1="120" y1={LANDING_Y - RAIL_H / 2} x2={LANDING_END} y2={LANDING_Y - RAIL_H / 2} strokeWidth="1.5" />
                {Array.from({ length: 8 }, (_, i) => 122 + i * 29.5).map((x) => (
                    <line key={x} x1={x} y1={LANDING_Y - RAIL_H} x2={x} y2={LANDING_Y} strokeWidth={x === 122 ? 3 : 1.5} />
                ))}
            </g>

            {/* Garde-corps rampant */}
            <g stroke="currentColor">
                <line x1={LANDING_END} y1={railY(LANDING_END)} x2={STAIR_END} y2={railY(STAIR_END)} strokeWidth="3.5" />
                <line x1={LANDING_END} y1={railY(LANDING_END) + RAIL_H / 2} x2={STAIR_END} y2={railY(STAIR_END) + RAIL_H / 2} strokeWidth="1.5" />
                {treads.map(({ x, y }, i) => (i % 2 === 0 ? <line key={x} x1={x + 6} y1={railY(x + 6)} x2={x + 6} y2={y} strokeWidth="1.5" /> : null))}
                <line x1={STAIR_END} y1={railY(STAIR_END)} x2={STAIR_END} y2={GROUND_Y - RISE} strokeWidth="3" />
            </g>

            {/* Cotes */}
            <g stroke="currentColor" strokeWidth="0.7" fill="currentColor" opacity="0.7">
                <line x1="90" y1={LANDING_Y} x2="90" y2={GROUND_Y} />
                <line x1="84" y1={LANDING_Y} x2="96" y2={LANDING_Y} />
                <line x1="84" y1={GROUND_Y} x2="96" y2={GROUND_Y} />
                <text x="82" y={(LANDING_Y + GROUND_Y) / 2} textAnchor="middle" transform={`rotate(-90 82 ${(LANDING_Y + GROUND_Y) / 2})`} stroke="none" className="font-mono text-[9px]">
                    2600
                </text>

                <line x1="118" y1={GROUND_Y + 30} x2={STAIR_END} y2={GROUND_Y + 30} />
                <line x1="118" y1={GROUND_Y + 24} x2="118" y2={GROUND_Y + 36} />
                <line x1={LANDING_END} y1={GROUND_Y + 24} x2={LANDING_END} y2={GROUND_Y + 36} />
                <line x1={STAIR_END} y1={GROUND_Y + 24} x2={STAIR_END} y2={GROUND_Y + 36} />
                <text x={(118 + LANDING_END) / 2} y={GROUND_Y + 26} textAnchor="middle" stroke="none" className="font-mono text-[9px]">
                    2100
                </text>
                <text x={(LANDING_END + STAIR_END) / 2} y={GROUND_Y + 26} textAnchor="middle" stroke="none" className="font-mono text-[9px]">
                    2300
                </text>
            </g>

            {/* Annotations */}
            <Callout x={200} y={LANDING_Y - RAIL_H} tx={160} ty={60} lines={['Garde-corps', 'Acier galvanisé']} />
            <Callout x={322} y={330} tx={620} ty={250} anchor="end" lines={['Structure', 'Métallique']} />
            <Callout x={470} y={GROUND_Y - 70} tx={575} ty={505} lines={['Escalier', 'Sur mesure']} />
        </svg>
    );
}

export function HeroPlan() {
    return (
        <section id="accueil" className="relative overflow-hidden bg-paper">
            {/* Grille plan technique */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(20,20,20,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.05)_1px,transparent_1px)] [background-size:40px_40px]"
            />

            {/* Cote verticale décorative à gauche */}
            <div aria-hidden className="absolute top-16 bottom-16 left-4 hidden w-3 lg:block">
                <span className="absolute inset-y-0 left-1/2 w-px bg-ink/30" />
                <span className="absolute top-0 left-0 h-px w-3 bg-ink/40" />
                <span className="absolute bottom-0 left-0 h-px w-3 bg-ink/40" />
            </div>

            <div className="relative mx-auto grid max-w-[1320px] items-center gap-8 px-5 py-14 lg:grid-cols-[1fr_1.15fr] lg:px-10 lg:py-20">
                <div className="relative z-10">
                    <p className="mb-5 font-mono text-[11px] tracking-[0.18em] text-neutral-600 uppercase">Fabrication métallique &amp; industrielle</p>

                    <h1 className="font-display text-[56px] leading-[0.92] tracking-tight text-ink uppercase sm:text-[80px] xl:text-[104px]">
                        Le métal.
                        <br />
                        De l’idée
                        <br />à la matière.
                    </h1>

                    <p className="mt-7 text-sm font-semibold text-ink">
                        Conception <span className="text-dym">•</span> Usinage <span className="text-dym">•</span> Fabrication sur mesure
                    </p>
                    <p className="mt-3 max-w-[440px] text-[15px] leading-relaxed text-neutral-600">
                        DYM Manufacture accompagne les entreprises et les particuliers dans la réalisation d’ouvrages métalliques robustes, esthétiques et de haute qualité.
                    </p>

                    <a href="#activites" className="mt-9 inline-flex items-center gap-3 bg-dym px-7 py-4 text-[11px] font-semibold tracking-[0.16em] text-white uppercase transition-colors hover:bg-dym-dark">
                        Découvrir nos activités
                        <ArrowRight className="size-4" />
                    </a>
                </div>

                <div className="relative">
                    <StairDrawing />
                </div>
            </div>

            {/* Index de slides à droite */}
            <ol aria-hidden className="absolute top-1/2 right-5 hidden -translate-y-1/2 space-y-5 font-mono text-[10px] text-neutral-500 lg:block">
                {['01', '02', '03', '04'].map((n, i) => (
                    <li key={n} className={i === 0 ? 'text-dym' : ''}>
                        {n}
                    </li>
                ))}
            </ol>
        </section>
    );
}
