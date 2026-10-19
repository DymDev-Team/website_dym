import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTexts } from '@/components/site/use-texts';
import { store as storeConsent } from '@/routes/cookie-consent';
import { show as showLegal } from '@/routes/legal';

// Choix mémorisé dans le navigateur (6 mois, durée recommandée par la CNIL) et
// enregistré côté serveur comme preuve du consentement (table cookie_consents).
const COOKIE = 'dym_cookie_consent';
const MAX_AGE = 60 * 60 * 24 * 182;
// À aligner sur CookieConsent::POLICY_VERSION : une nouvelle version redemande le choix.
const POLICY_VERSION = '1';

const OPEN_EVENT = 'dym:cookie-settings';
const CHANGE_EVENT = 'dym:cookie-consent';

export type CookieConsent = {
    id: string;
    version: string;
    analytics: boolean;
    marketing: boolean;
    date: string;
};

type Category = 'analytics' | 'marketing';

export function getCookieConsent(): CookieConsent | null {
    if (typeof document === 'undefined') {
        return null;
    }

    const raw = document.cookie
        .split('; ')
        .find((c) => c.startsWith(`${COOKIE}=`))
        ?.slice(COOKIE.length + 1);

    if (!raw) {
        return null;
    }

    try {
        const consent = JSON.parse(decodeURIComponent(raw)) as CookieConsent;

        return consent.version === POLICY_VERSION ? consent : null;
    } catch {
        return null;
    }
}

/** Accord pour une catégorie : à vérifier avant de charger un script tiers. */
export function hasCookieConsent(category: Category): boolean {
    return getCookieConsent()?.[category] === true;
}

/** Rouvre la fenêtre (lien « Gérer les cookies » du pied de page). */
export function openCookieSettings(): void {
    window.dispatchEvent(new Event(OPEN_EVENT));
}

function xsrfToken(): string {
    const raw = document.cookie
        .split('; ')
        .find((c) => c.startsWith('XSRF-TOKEN='))
        ?.slice('XSRF-TOKEN='.length);

    return raw ? decodeURIComponent(raw) : '';
}

function saveConsent(choices: Record<Category, boolean>, previous: CookieConsent | null): void {
    const consent: CookieConsent = {
        id: previous?.id ?? crypto.randomUUID(),
        version: POLICY_VERSION,
        ...choices,
        date: new Date().toISOString(),
    };

    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(consent))}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: consent }));

    // Preuve côté serveur ; un échec réseau ne bloque pas la navigation.
    fetch(storeConsent.url(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': xsrfToken() },
        body: JSON.stringify({ consent_id: consent.id, ...choices }),
        credentials: 'same-origin',
        keepalive: true,
    }).catch(() => {});
}

export function CookieConsentBanner() {
    const t = useTexts();
    const [open, setOpen] = useState(false);
    const [customizing, setCustomizing] = useState(false);
    const [choices, setChoices] = useState<Record<Category, boolean>>({ analytics: false, marketing: false });

    useEffect(() => {
        const current = getCookieConsent();

        if (!current) {
            setOpen(true);
        }

        const reopen = () => {
            const saved = getCookieConsent();
            setChoices({ analytics: saved?.analytics ?? false, marketing: saved?.marketing ?? false });
            setCustomizing(true);
            setOpen(true);
        };

        window.addEventListener(OPEN_EVENT, reopen);

        return () => window.removeEventListener(OPEN_EVENT, reopen);
    }, []);

    if (!open) {
        return null;
    }

    const decide = (next: Record<Category, boolean>) => {
        saveConsent(next, getCookieConsent());
        setOpen(false);
        setCustomizing(false);
    };

    const categories: { key: Category | 'necessary'; locked?: boolean }[] = [{ key: 'necessary', locked: true }, { key: 'analytics' }, { key: 'marketing' }];

    return (
        <div
            role="dialog"
            aria-labelledby="cookie-consent-title"
            aria-describedby="cookie-consent-text"
            className="fixed inset-x-3 bottom-3 z-[60] max-h-[calc(100dvh-24px)] overflow-y-auto border border-ink/10 bg-white text-ink shadow-[0_24px_60px_rgb(20_20_20/0.18)] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[420px]"
        >
            <div className="p-6">
                <div className="hx-mono mb-3 flex items-center gap-3 text-[10px] tracking-[0.075em] text-neutral-500 uppercase">
                    <span className="inline-block size-[5px] bg-dym" /> Cookies
                </div>
                <h2 id="cookie-consent-title" className="font-display text-[22px] leading-none uppercase">
                    {t('layout.cookies.title')}
                </h2>
                <p id="cookie-consent-text" className="mt-3 text-sm leading-relaxed text-neutral-600">
                    {t('layout.cookies.text')}{' '}
                    <Link href={showLegal('cookies')} className="text-ink underline decoration-dym underline-offset-4 hover:text-dym">
                        {t('layout.cookies.policy_link')}
                    </Link>
                </p>

                {customizing && (
                    <ul className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
                        {categories.map(({ key, locked }) => {
                            const checked = locked || choices[key as Category];

                            return (
                                <li key={key} className="flex items-start justify-between gap-4 py-3">
                                    <div>
                                        <p className="text-sm font-semibold">{t(`layout.cookies.${key}_title`)}</p>
                                        <p className="mt-1 text-xs leading-relaxed text-neutral-500">{t(`layout.cookies.${key}_text`)}</p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={checked}
                                        aria-label={t(`layout.cookies.${key}_title`)}
                                        disabled={locked}
                                        onClick={() => setChoices((c) => ({ ...c, [key]: !c[key as Category] }))}
                                        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${checked ? 'bg-dym' : 'bg-neutral-300'}`}
                                    >
                                        <span className={`absolute top-1 left-1 size-4 rounded-full bg-white transition-transform duration-300 ${checked ? 'translate-x-5' : ''}`} />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                    {customizing ? (
                        <button type="button" onClick={() => decide(choices)} className="hx-mono flex-1 bg-ink px-4 py-3 text-[10px] tracking-[0.1em] text-white uppercase transition-colors hover:bg-dym">
                            {t('layout.cookies.save')}
                        </button>
                    ) : (
                        <button type="button" onClick={() => setCustomizing(true)} className="hx-mono px-1 py-3 text-[10px] tracking-[0.1em] text-neutral-600 uppercase underline underline-offset-4 hover:text-ink">
                            {t('layout.cookies.customize')}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => decide({ analytics: false, marketing: false })}
                        className="hx-mono flex-1 border border-ink/20 px-4 py-3 text-[10px] tracking-[0.1em] uppercase transition-colors hover:border-ink"
                    >
                        {t('layout.cookies.reject')}
                    </button>
                    <button
                        type="button"
                        onClick={() => decide({ analytics: true, marketing: true })}
                        className="hx-mono flex-1 bg-dym px-4 py-3 text-[10px] tracking-[0.1em] text-white uppercase transition-colors hover:bg-ink"
                    >
                        {t('layout.cookies.accept')}
                    </button>
                </div>
            </div>
        </div>
    );
}
