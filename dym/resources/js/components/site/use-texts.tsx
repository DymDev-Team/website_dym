import { usePage } from '@inertiajs/react';
import { Fragment } from 'react';
import type { CSSProperties, ReactNode } from 'react';

type Texts = {
    href: (key: string, fallback: string | { url: string }) => string;
    (key: string): string;
    // Texte (ou rendu fourni) dans la couleur choisie dans /admin/texts ;
    // sans couleur personnalisée, le rendu est inchangé.
    c: (key: string, node?: ReactNode) => ReactNode;
    // Même couleur pour un lien ou bouton entier : la flèche suit le texte.
    style: (key: string) => CSSProperties | undefined;
};

// Textes du site modifiables dans /admin/texts (config/site-texts.php).
// `t('home.hero.title')` renvoie le texte personnalisé ou celui par défaut,
// `t.c('home.hero.title')` l'affiche avec sa couleur personnalisée.
export function useTexts(): Texts {
    const { texts, textColors } = usePage().props;
    const t = (key: string): string => texts?.[key] ?? '';

    return Object.assign(t, {
        href: (key: string, fallback: string | { url: string }) => t(`${key}_url`) || (typeof fallback === 'string' ? fallback : fallback.url),
        c: (key: string, node: ReactNode = t(key)) => {
            const color = textColors?.[key];

            return color ? <span style={{ color }}>{node}</span> : node;
        },
        style: (key: string) => {
            const color = textColors?.[key];

            const backgroundColor = t(`${key}_background`) || undefined;
            const borderColor = t(`${key}_border`) || undefined;

            return {
                color,
                backgroundColor,
                borderColor,
                ...(borderColor ? { borderWidth: 1, borderStyle: 'solid' } : {}),
                '--button-background': backgroundColor,
            } as CSSProperties;
        },
    });
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
