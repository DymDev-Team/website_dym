import type { CSSProperties, ReactNode } from 'react';

// Plans techniques partagés (section Équipements, écran de chargement).
// Chaque élément reçoit `draw(délai)` pour être tracé progressivement
// (classe .hx-draw, active sous un parent .hx-root.is-ready).

export type Draw = (d: number) => { className: string; pathLength: number; style: CSSProperties };

export type Blueprint = {
    width: string;
    height: string;
    callout: { x: number; y: number; label: string; left?: boolean };
    parts: (draw: Draw) => ReactNode;
};

// Plans d'élévation simplifiés, un par type de machine.
export const blueprints: Record<'laser' | 'pliage' | 'tour' | 'soudure', Blueprint> = {
    laser: {
        width: '4 000',
        height: '1 800',
        callout: { x: 207, y: 130, label: 'TÊTE DE COUPE' },
        parts: (draw) => (
            <>
                <rect x="40" y="140" width="360" height="60" {...draw(0.3)} />
                <rect x="58" y="200" width="22" height="34" {...draw(0.5)} />
                <rect x="360" y="200" width="22" height="34" {...draw(0.5)} />
                <line x1="40" y1="156" x2="400" y2="156" {...draw(0.45)} />
                {Array.from({ length: 19 }, (_, i) => (
                    <line key={i} x1={50 + i * 19} y1="140" x2={50 + i * 19} y2="156" strokeOpacity="0.3" {...draw(0.6 + i * 0.02)} />
                ))}
                <rect x="60" y="58" width="330" height="16" {...draw(0.4)} />
                <rect x="70" y="74" width="14" height="66" {...draw(0.55)} />
                <rect x="366" y="74" width="14" height="66" {...draw(0.55)} />
                <rect x="190" y="74" width="34" height="40" {...draw(0.7)} />
                <path d="M198 114 L216 114 L210 130 L204 130 Z" {...draw(0.8)} />
                <rect x="418" y="86" width="66" height="148" {...draw(0.5)} />
                <rect x="428" y="98" width="46" height="30" {...draw(0.75)} />
                <line x1="428" y1="142" x2="474" y2="142" {...draw(0.85)} />
                <line x1="428" y1="152" x2="474" y2="152" {...draw(0.9)} />
            </>
        ),
    },
    pliage: {
        width: '3 200',
        height: '2 600',
        callout: { x: 250, y: 138, label: 'POINÇON / MATRICE' },
        parts: (draw) => (
            <>
                {/* Flasques latéraux */}
                <path d="M60 234 L60 50 L104 50 L104 118 L92 128 L92 150 L104 160 L104 234 Z" {...draw(0.3)} />
                <path d="M440 234 L440 50 L396 50 L396 118 L408 128 L408 150 L396 160 L396 234 Z" {...draw(0.3)} />
                {/* Vérins */}
                <rect x="130" y="34" width="26" height="36" {...draw(0.5)} />
                <rect x="344" y="34" width="26" height="36" {...draw(0.5)} />
                {/* Tablier supérieur + poinçon */}
                <rect x="104" y="70" width="292" height="40" {...draw(0.45)} />
                <rect x="124" y="110" width="252" height="12" {...draw(0.6)} />
                <path d="M124 122 L250 138 L376 122" {...draw(0.7)} />
                {/* Tablier inférieur + matrice en V */}
                <path d="M124 148 L238 148 L250 158 L262 148 L376 148 L376 160 L124 160 Z" {...draw(0.75)} />
                <rect x="104" y="160" width="292" height="50" {...draw(0.5)} />
                {/* Butée arrière */}
                <line x1="104" y1="186" x2="396" y2="186" strokeOpacity="0.3" {...draw(0.85)} />
                {/* Pupitre CN */}
                <line x1="440" y1="70" x2="476" y2="70" {...draw(0.8)} />
                <rect x="468" y="70" width="34" height="50" {...draw(0.9)} />
                <rect x="474" y="78" width="22" height="16" {...draw(1)} />
            </>
        ),
    },
    tour: {
        width: '2 800',
        height: '1 700',
        callout: { x: 160, y: 115, label: 'MANDRIN' },
        parts: (draw) => (
            <>
                {/* Socle + banc */}
                <rect x="50" y="174" width="90" height="60" {...draw(0.3)} />
                <rect x="360" y="174" width="90" height="60" {...draw(0.3)} />
                <rect x="40" y="150" width="420" height="24" {...draw(0.4)} />
                <line x1="40" y1="160" x2="460" y2="160" strokeOpacity="0.3" {...draw(0.55)} />
                {/* Poupée fixe + mandrin */}
                <rect x="40" y="76" width="110" height="74" {...draw(0.45)} />
                <rect x="150" y="92" width="20" height="46" {...draw(0.6)} />
                <line x1="150" y1="104" x2="170" y2="104" {...draw(0.7)} />
                <line x1="150" y1="126" x2="170" y2="126" {...draw(0.7)} />
                {/* Pièce */}
                <rect x="170" y="108" width="128" height="14" {...draw(0.75)} />
                {/* Chariot + outil */}
                <rect x="232" y="132" width="64" height="18" {...draw(0.8)} />
                <path d="M254 132 L254 124 L266 124 L266 132" {...draw(0.9)} />
                {/* Poupée mobile */}
                <rect x="362" y="96" width="72" height="54" {...draw(0.6)} />
                <rect x="318" y="110" width="44" height="10" {...draw(0.8)} />
                {/* Carter + pupitre */}
                <rect x="30" y="40" width="440" height="110" strokeOpacity="0.2" strokeDasharray="4 6" />
                <rect x="474" y="60" width="32" height="64" {...draw(0.9)} />
            </>
        ),
    },
    soudure: {
        width: '2 400',
        height: '1 500',
        callout: { x: 212, y: 100, label: 'TORCHE MIG / TIG', left: true },
        parts: (draw) => (
            <>
                {/* Table de soudage */}
                <rect x="40" y="150" width="260" height="14" {...draw(0.3)} />
                <rect x="56" y="164" width="12" height="70" {...draw(0.45)} />
                <rect x="272" y="164" width="12" height="70" {...draw(0.45)} />
                <line x1="62" y1="210" x2="278" y2="210" strokeOpacity="0.4" {...draw(0.55)} />
                {/* Pièces assemblées en L */}
                <rect x="110" y="132" width="96" height="18" {...draw(0.6)} />
                <rect x="206" y="96" width="14" height="54" {...draw(0.65)} />
                {/* Poste à souder sur chariot */}
                <rect x="338" y="118" width="92" height="92" {...draw(0.4)} />
                <rect x="350" y="130" width="40" height="22" {...draw(0.7)} />
                <circle cx="408" cy="141" r="8" {...draw(0.75)} />
                <circle cx="356" cy="222" r="12" {...draw(0.6)} />
                <circle cx="414" cy="222" r="12" {...draw(0.6)} />
                {/* Bouteille de gaz */}
                <rect x="446" y="74" width="34" height="160" rx="17" {...draw(0.5)} />
                <rect x="456" y="60" width="14" height="14" {...draw(0.8)} />
                {/* Faisceau + torche */}
                <path d="M362 118 C 330 40, 262 52, 226 88" {...draw(0.85)} />
                <line x1="226" y1="88" x2="214" y2="100" strokeWidth="2.5" {...draw(0.95)} />
            </>
        ),
    },
};

// Choisit le plan d'après le nom de la machine (saisi dans l'admin).
export const blueprintFor = (name: string): Blueprint => {
    const n = name.toLowerCase();

    if (n.includes('pli')) {
        return blueprints.pliage;
    }

    if (n.includes('usin') || n.includes('tour')) {
        return blueprints.tour;
    }

    if (n.includes('soud')) {
        return blueprints.soudure;
    }

    return blueprints.laser;
};
