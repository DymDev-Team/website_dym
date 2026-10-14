import type { SyntheticEvent } from 'react';

import type { Partner } from '@/types/admin';

// Chaque moitié de la piste répète les logos pour dépasser la largeur d'un
// grand écran ; la piste entière est doublée pour boucler sans à-coup (-50 %).
const REPEAT = 3;

const hideBroken = (e: SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
};

function LogoSet({ partners, copy }: { partners: Partner[]; copy: number }) {
    return Array.from({ length: REPEAT }).flatMap((_, r) =>
        partners.map((p) => {
            const decorative = copy > 0 || r > 0;

            return (
                <span
                    key={`${copy}-${r}-${p.id}`}
                    title={p.name}
                    aria-hidden={decorative || undefined}
                    className="group grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border border-black/10 bg-white shadow-[0_4px_14px_rgb(20_20_20/0.05)] transition-[border-color,box-shadow] duration-300 hover:border-dym/40 hover:shadow-[0_6px_20px_rgb(241_90_34/0.15)] sm:size-[76px]"
                >
                    <img
                        src={p.logo_url ?? undefined}
                        alt={decorative ? '' : p.name}
                        loading="lazy"
                        onError={hideBroken}
                        className="max-h-[62%] max-w-[72%] object-contain opacity-70 brightness-105 grayscale transition-[filter,opacity,transform] duration-300 group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0"
                    />
                </span>
            );
        }),
    );
}

export function Partners({ partners }: { partners: Partner[] }) {
    if (partners.length === 0) {
        return null;
    }

    return (
        <section id="references" className="border-t border-black/10 bg-paper py-9">
            <p className="mb-5 text-center text-[11px] font-bold tracking-[0.18em] text-neutral-500 uppercase">Nos partenaires</p>
            <div className="overflow-hidden bg-paper mask-[linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
                <div className="flex w-max animate-partners items-center gap-6 hover:paused motion-reduce:animate-none">
                    <LogoSet partners={partners} copy={0} />
                    <LogoSet partners={partners} copy={1} />
                </div>
            </div>
        </section>
    );
}
