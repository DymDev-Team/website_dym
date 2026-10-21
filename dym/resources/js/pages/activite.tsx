import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { activityShow, activities as activitiesIndex } from '@/routes';
import { create as quoteCreate } from '@/routes/quotes';
import type { Activity, SiteSettings } from '@/types/admin';

type Props = { activity: Activity; activities: Pick<Activity, 'id' | 'title' | 'image' | 'image_alt'>[]; site: SiteSettings };

export default function Activite({ activity, activities, site }: Props) {
    return (
        <>
            <Head title={`${activity.title} | DYM Manufacture`}>
                <meta name="description" content={activity.description} />
            </Head>
            <div className="bg-paper text-ink">
                <SiteHeader active="Activités" />
                <main>
                    <section className="bg-ink px-5 py-14 text-white sm:px-8 lg:px-[clamp(24px,3.15vw,58px)] lg:py-20">
                        <div className="mx-auto max-w-[1500px]">
                            <Link href={activitiesIndex()} className="mb-10 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/65 hover:text-white"><ArrowLeft className="size-4" /> Toutes nos activités</Link>
                            <div className="grid items-end gap-10 lg:grid-cols-[1fr_0.9fr]">
                                <div>
                                    <span className="font-mono text-xs tracking-widest text-dym">DYM MANUFACTURE / ACTIVITÉS</span>
                                    <h1 className="mt-5 max-w-3xl font-display text-[clamp(42px,7vw,92px)] leading-[0.9] uppercase">{activity.title}</h1>
                                    <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/70">{activity.description}</p>
                                </div>
                                <img src={activity.image_url ?? undefined} alt={activity.image_alt ?? activity.title} className="aspect-[4/3] w-full object-cover" />
                            </div>
                        </div>
                    </section>
                    <section className="px-5 py-16 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)] lg:py-24">
                        <div className="mx-auto grid max-w-[1300px] gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
                            <div>
                                <span className="font-mono text-xs tracking-widest text-dym">NOTRE SAVOIR-FAIRE</span>
                                <h2 className="mt-4 font-display text-4xl leading-none uppercase">Une expertise à votre mesure<span className="text-dym">.</span></h2>
                            </div>
                            <div className="space-y-8">
                                {activity.detail_image_url && <img src={activity.detail_image_url} alt={activity.detail_image_alt ?? ''} className="max-h-[560px] w-full object-cover" />}
                                <div className="space-y-5 text-base leading-[1.9] text-neutral-700">
                                    {(activity.detail_content || activity.description).split('\n').filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                                </div>
                                <Link href={quoteCreate({ query: { activite: activity.title } })} className="inline-flex items-center gap-3 bg-dym px-6 py-4 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-dym-dark">Parler de votre projet <ArrowRight className="size-4" /></Link>
                            </div>
                        </div>
                    </section>
                    {activities.length > 1 && <section className="border-t border-neutral-200 px-5 py-14 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)]"><div className="mx-auto max-w-[1500px]"><h2 className="font-display text-4xl uppercase">Nos autres activités</h2><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{activities.filter(item => item.id !== activity.id).map(item => <Link key={item.id} href={activityShow(item.id)} className="group"><img src={item.image_url ?? undefined} alt={item.image_alt ?? item.title} className="aspect-[4/3] w-full object-cover" /><span className="mt-3 flex items-center justify-between font-display text-xl uppercase">{item.title}<ArrowRight className="size-4 text-dym transition-transform group-hover:translate-x-1" /></span></Link>)}</div></div></section>}
                </main>
                <SiteFooter activities={activities as Activity[]} site={site} />
            </div>
        </>
    );
}
