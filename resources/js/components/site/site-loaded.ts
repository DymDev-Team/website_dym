import { useEffect, useState } from 'react';

// Signal « écran de chargement terminé » : le hero attend ce signal pour
// lancer son animation d'entrée au moment où le rideau se lève.
let loaded = false;
const listeners = new Set<() => void>();

export function markSiteLoaded() {
    if (loaded) {
        return;
    }

    loaded = true;
    listeners.forEach((fn) => fn());
    listeners.clear();
}

export function useSiteLoaded() {
    const [isLoaded, setIsLoaded] = useState(loaded);

    useEffect(() => {
        if (loaded) {
            setIsLoaded(true);

            return;
        }

        const fn = () => setIsLoaded(true);
        listeners.add(fn);

        return () => {
            listeners.delete(fn);
        };
    }, []);

    return isLoaded;
}
