import { usePage } from '@inertiajs/react';
import { Fragment } from 'react';
import type { ReactNode } from 'react';

// Textes du site modifiables dans /admin/texts (config/site-texts.php).
// `t('home.hero.title')` renvoie le texte personnalisé ou celui par défaut.
export function useTexts() {
    const { texts } = usePage().props;

    return (key: string): string => texts?.[key] ?? '';
}

// Un texte saisi sur plusieurs lignes → une entrée par ligne.
export const lines = (text: string): string[] =>
    text.split('\n').map((l) => l.trim()).filter(Boolean);

// Titre sur plusieurs lignes (<br />) avec la ponctuation finale dans la couleur DYM.
export function renderTitle(text: string): ReactNode {
    const parts = lines(text);

    return parts.map((line, i) => (
        <Fragment key={i}>
            {i > 0 && <br />}
            {i === parts.length - 1 ? withDot(line) : line}
        </Fragment>
    ));
}

// Dernier « . », « ? » ou « ! » d'un titre affiché dans la couleur DYM (charte DYM).
export function withDot(text: string): ReactNode {
    const last = text.at(-1);

    if (!last || !'.?!'.includes(last)) {
        return text;
    }

    return (
        <>
            {text.slice(0, -1)}
            <span className="text-dym">{last}</span>
        </>
    );
}
