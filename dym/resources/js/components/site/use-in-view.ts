import { useEffect, useRef, useState } from 'react';

// Déclenche les animations .hx-fade / .hx-line à la première apparition.
// Le contenu reste visible ensuite, y compris en remontant la page.
export function useInView<T extends Element>(threshold = 0.2) {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;

        if (!el) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.intersectionRatio >= threshold) {
                    setInView(true);

                    observer.disconnect();
                }
            },
            { threshold: [0, threshold] },
        );
        observer.observe(el);

        return () => observer.disconnect();
    }, [threshold]);

    return [ref, inView] as const;
}
