import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { realisations } from '@/routes';
import { create as quoteCreate } from '@/routes/quotes';
import type { Activity, Project, SiteSettings } from '@/types/admin';

type Props = { project: Project; activities: Activity[]; site: SiteSettings };

export default function Realisation({ project, activities, site }: Props) {
    return (
        <>
            <Head title={`${project.title} | DYM Manufacture`}>
                {project.description && <meta name="description" content={project.description.slice(0, 160)} />}
            </Head>
            <div className="bg-paper text-ink">
                <SiteHeader active="Réalisations" />
                <main className="px-5 py-14 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)] lg:py-20">
                    <article className="mx-auto max-w-[1500px]">
                        <Link href={realisations()} className="mb-10 inline-flex items-center gap-2 text-xs tracking-widest uppercase hover:text-dym">
                            <ArrowLeft className="size-4" /> Toutes nos réalisations
                        </Link>
                        <header className="mb-10 max-w-4xl">
                            <p className="hx-mono text-xs tracking-widest text-dym uppercase">{project.category}</p>
                            <h1 className="mt-5 font-display text-[clamp(42px,7vw,92px)] leading-[0.95] uppercase">{project.title}</h1>
                        </header>
                        <img src={project.image_url ?? undefined} alt={project.title} width={1500} height={1100} fetchPriority="high" decoding="async" className="max-h-[80vh] w-full bg-neutral-100 object-contain" />
                        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
                            {project.description && <p className="max-w-3xl text-lg leading-relaxed whitespace-pre-line text-neutral-600">{project.description}</p>}
                            <Link href={quoteCreate()} className="inline-flex w-fit items-center gap-3 bg-dym px-6 py-4 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-dym-dark">
                                Parler de votre projet <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </article>
                </main>
                <SiteFooter activities={activities} site={site} />
            </div>
        </>
    );
}
