import { Head } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import type { Activity, Project, SiteSettings } from '@/types/admin';
import { useTexts, withDot } from '@/components/site/use-texts';

type Props = {
    projects: Project[];
    activities: Activity[];
    site: SiteSettings;
};

const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties;

export default function RealisationsPage({ projects, activities, site }: Props) {
    const t = useTexts();

    return (
        <>
            <Head title={t('home.projects.eyebrow')} />

            <div className="bg-paper text-ink">
                <SiteHeader active="Réalisations" />

                <main className="hx-root px-5 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)]">
                    <div className="mx-auto max-w-[1720px] pt-16 pb-20 lg:pt-20 lg:pb-28">
                        <header className="lg:pl-[clamp(22px,3vw,52px)]">
                            <div className="hx-mono mb-5 flex items-center gap-3 text-[10px] tracking-[0.075em] text-neutral-500">
                                <span className="inline-block size-[5px] bg-dym" /> {t('home.projects.eyebrow')}
                            </div>
                            <h1 className="font-display text-[clamp(40px,9vw,56px)] leading-[0.95] uppercase lg:text-[clamp(44px,3.8vw,68px)]">
                                {withDot(t('home.projects.title'))}
                            </h1>
                        </header>

                        {projects.length > 0 ? (
                            <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
                                {projects.map((project, i) => (
                                    <li key={project.id} className="group" style={delay(i * 0.06)}>
                                        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                                            <img
                                                src={project.image_url ?? undefined}
                                                alt={`${project.title} — ${project.category}`}
                                                width={1000}
                                                height={1250}
                                                loading="lazy"
                                                className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            />
                                            <span className="hx-mono absolute top-3 left-3 bg-white/90 px-2 py-1 text-[9px] text-ink">
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                        </div>
                                        <div className="mt-4 flex items-start justify-between gap-3">
                                            <div>
                                                <h2 className="text-[15px] font-semibold">{project.title}</h2>
                                                <p className="hx-mono mt-1 text-[10px] tracking-[0.08em] text-neutral-500 uppercase">{project.category}</p>
                                            </div>
                                            <ArrowRight className="mt-1 size-4 shrink-0 text-dym transition-transform duration-300 group-hover:translate-x-1" />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-12 text-neutral-600">Aucune réalisation à afficher pour le moment.</p>
                        )}
                    </div>
                </main>

                <SiteFooter activities={activities} site={site} />
            </div>
        </>
    );
}
