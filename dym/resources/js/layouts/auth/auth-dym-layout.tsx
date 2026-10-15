import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useLayoutEffect } from 'react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

// Les pages d'authentification gardent la charte claire du site, même si
// l'utilisateur a choisi le thème sombre pour l'administration : on retire la
// classe `dark` tant que la page est affichée (et on la remet en partant).
function useForceLightTheme() {
    useLayoutEffect(() => {
        const html = document.documentElement;
        const wasDark = html.classList.contains('dark');
        const strip = () => html.classList.remove('dark');

        strip();
        const observer = new MutationObserver(strip);
        observer.observe(html, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            observer.disconnect();
            html.classList.toggle('dark', wasDark);
        };
    }, []);
}

export default function AuthDymLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    useForceLightTheme();

    return (
        <div className="dym-auth grid min-h-svh bg-paper text-ink lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
            {/* Panneau atelier (grand écran) */}
            <aside className="relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col">
                <img
                    src="/images/hero/atelier-dym.jpg"
                    alt=""
                    className="absolute inset-0 size-full object-cover object-[55%_center] opacity-55"
                />
                <div
                    className="absolute inset-0 bg-linear-to-t from-ink via-ink/40 to-ink/30"
                    aria-hidden
                />

                <div className="relative flex items-center justify-between p-10">
                    <Link href={home()} aria-label="DYM Manufacture — accueil">
                        <img
                            src="/images/logo-dym-blanc.png"
                            alt="DYM Manufacture"
                            width={162}
                            height={90}
                            className="h-12 w-auto"
                        />
                    </Link>
                    <span className="hx-mono flex items-center gap-2 text-[10px] tracking-[0.1em] text-white/70">
                        <span className="size-1.25 bg-dym" aria-hidden />
                        ESPACE ADMINISTRATION
                    </span>
                </div>

                <div className="relative mt-auto p-10 pb-12">
                    <p className="font-display text-[clamp(44px,4.6vw,76px)] leading-[0.95] uppercase">
                        Des hommes
                        <br />
                        et des machines<span className="text-dym">.</span>
                    </p>
                    <p className="mt-6 max-w-md text-[15px] leading-[1.7] text-white/70">
                        Gérez le contenu du site DYM Manufacture : activités,
                        réalisations, actualités, offres d’emploi et demandes de
                        devis.
                    </p>
                    <p className="hx-mono mt-10 flex items-center gap-2 text-[10px] tracking-[0.1em] text-white/50">
                        <span className="size-1.25 bg-dym" aria-hidden />
                        ATELIER DYM — ABIDJAN
                    </p>
                </div>
            </aside>

            {/* Formulaire */}
            <main className="flex flex-col px-5 py-8 sm:px-10">
                <div className="flex items-center justify-between">
                    <Link
                        href={home()}
                        className="lg:hidden"
                        aria-label="DYM Manufacture — accueil"
                    >
                        <img
                            src="/images/logo-dym-blanc.png"
                            alt="DYM Manufacture"
                            width={162}
                            height={90}
                            className="h-10 w-auto brightness-0"
                        />
                    </Link>
                    <Link
                        href={home()}
                        className="hx-mono ml-auto inline-flex items-center gap-2 text-[10px] tracking-[0.1em] text-neutral-500 uppercase transition-colors hover:text-dym"
                    >
                        <ArrowLeft className="size-3.5" /> Retour au site
                    </Link>
                </div>

                <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
                    <div className="mb-10">
                        <span className="hx-mono flex items-center gap-2 text-[10px] tracking-[0.1em] text-neutral-500">
                            <span className="size-1.25 bg-dym" aria-hidden />
                            DYM MANUFACTURE
                        </span>
                        <h1 className="mt-4 font-display text-[clamp(34px,5vw,48px)] leading-[0.98] uppercase">
                            {title}
                            <span className="text-dym">.</span>
                        </h1>
                        {description && (
                            <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
                                {description}
                            </p>
                        )}
                    </div>

                    {children}
                </div>

                <p className="hx-mono text-center text-[10px] tracking-[0.1em] text-neutral-400 lg:text-left">
                    © {new Date().getFullYear()} DYM MANUFACTURE
                </p>
            </main>
        </div>
    );
}
