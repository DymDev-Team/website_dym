import type { ComponentProps, MouseEvent } from 'react';

type Props = Omit<ComponentProps<'a'>, 'href'> & {
    /** id de la section visée, sur la même page. */
    target: string;
};

// Lien vers une section de la page : défilement doux sans ajouter « #… » à
// l'adresse. Sans JavaScript, le lien d'ancre classique reste fonctionnel.
export function ScrollLink({ target, onClick, ...props }: Props) {
    const scroll = (event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        const section = document.getElementById(target);

        if (!section || event.defaultPrevented) {
            return;
        }

        event.preventDefault();
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    };

    return <a href={`#${target}`} onClick={scroll} {...props} />;
}
