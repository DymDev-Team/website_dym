import { useEffect } from 'react';
import type { RefObject } from 'react';

// Fait glisser `target` plus lentement que la page pendant que `section`
// traverse la fenêtre. `amplitude` = déplacement max en px de part et d'autre.
export function useParallax(section: RefObject<HTMLElement | null>, target: RefObject<HTMLElement | null>, amplitude = 60, scale = 1.15) {
    useEffect(() => {
        const el = section.current;
        const img = target.current;

        if (!el || !img || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        let frame = 0;
        const update = () => {
            frame = 0;
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight;

            if (rect.bottom < 0 || rect.top > vh) {
                return;
            }

            // -1 quand la section entre par le bas, +1 quand elle sort par le haut.
            const progress = (vh / 2 - (rect.top + rect.height / 2)) / (vh / 2 + rect.height / 2);
            img.style.transform = `translate3d(0, ${progress * amplitude}px, 0) scale(${scale})`;
        };
        const onScroll = () => {
            if (!frame) {
                frame = requestAnimationFrame(update);
            }
        };
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            cancelAnimationFrame(frame);
        };
    }, [section, target, amplitude, scale]);
}
