import { useEffect, useRef, useState } from 'react';

// Passe à true quand l'élément entre dans la fenêtre (déclenche les animations
// .hx-fade / .hx-line via la classe is-ready). Avec once=false, repasse à false
// quand il en sort complètement, pour rejouer l'animation au retour.
export function useInView<T extends Element>(threshold = 0.2, once = true) {
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

                    if (once) {
                        observer.disconnect();
                    }
                } else if (!once && !entry.isIntersecting) {
                    setInView(false);
                }
            },
            { threshold: [0, threshold] },
        );
        observer.observe(el);

        return () => observer.disconnect();
    }, [threshold, once]);

    return [ref, inView] as const;
}
