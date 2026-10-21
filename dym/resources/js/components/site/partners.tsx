import type { SyntheticEvent } from 'react';

import type { Partner } from '@/types/admin';
import { useTexts } from '@/components/site/use-texts';

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
                    className="group grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border border-ink/10 bg-white shadow-[0_4px_14px_rgb(20_20_20/0.08)] transition-[border-color,box-shadow] duration-300 hover:border-dym/40 hover:shadow-[0_6px_20px_rgb(118_111_101/0.15)] min-[420px]:size-20 sm:size-24"
                >
                    <img
                        src={p.logo_url ?? undefined}
                        alt={decorative ? '' : p.name}
                        loading="lazy"
                        onError={hideBroken}
                        className="max-h-[80%] max-w-[80%] object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                </span>
            );
        }),
    );
}

export function Partners({ partners }: { partners: Partner[] }) {
    const t = useTexts();

    if (partners.length === 0) {
        return null;
    }

    return (
        <section id="references" className="border-t border-ink/10 bg-white py-9">
            <p className="mb-5 text-center text-[11px] font-bold tracking-[0.18em] text-ink/60 uppercase">{t.c('home.partners.title')}</p>
            <div className="overflow-hidden mask-[linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
                <div className="flex w-max animate-partners items-center gap-4 hover:paused motion-reduce:animate-none sm:gap-6">
                    <LogoSet partners={partners} copy={0} />
                    <LogoSet partners={partners} copy={1} />
                </div>
            </div>
        </section>
    );
}
