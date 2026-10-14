import { Head, Link } from '@inertiajs/react';
import { ArrowRight, GraduationCap, ShieldCheck, Users } from 'lucide-react';
import { ApplicationForm } from '@/components/site/application-form';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { show } from '@/routes/careers';
import type { Activity, JobOffer, SiteSettings } from '@/types/admin';

type Props = {
    offers: JobOffer[];
    activities: Pick<Activity, 'id' | 'title'>[];
    site: SiteSettings;
};

const reasons = [
    { icon: Users, title: 'Une équipe soudée', text: 'Bureau d’études, atelier et chantier travaillent main dans la main, du plan à la pose.' },
    { icon: GraduationCap, title: 'Apprendre et progresser', text: 'Découpe laser, pliage CNC, usinage : nos équipes se forment sur des machines modernes.' },
    { icon: ShieldCheck, title: 'Sécurité et exigence', text: 'Des procédures claires et un contrôle qualité à chaque étape de la fabrication.' },
];

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' });

function Eyebrow({ children }: { children: string }) {
    return (
        <div className="hx-mono mb-5 flex items-center gap-3 text-[10px] tracking-[0.075em] text-neutral-500">
            <span className="inline-block size-[5px] bg-dym" /> {children}
        </div>
    );
}

export default function CarrierePage({ offers, activities, site }: Props) {
    return (
        <>
            <Head title="Carrière — DYM Manufacture">
                <meta name="description" content="Rejoignez DYM Manufacture à Abidjan : offres d’emploi en chaudronnerie, usinage, menuiserie métallique et candidatures spontanées." />
            </Head>

            <div className="bg-paper text-ink">
                <SiteHeader active="Carrière" />

                {/* En-tête */}
                <section className="px-5 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)]">
                    <div className="mx-auto grid max-w-[1720px] items-end gap-8 pt-14 pb-12 lg:grid-cols-2 lg:pt-20 lg:pb-16 lg:pl-[clamp(22px,3vw,52px)]">
                        <div>
                            <Eyebrow>CARRIÈRE</Eyebrow>
                            <h1 className="font-display text-[clamp(44px,9vw,64px)] leading-[0.95] uppercase lg:text-[clamp(52px,4.6vw,84px)]">
                                Façonnons le métal
                                <br />
                                ensemble<span className="text-dym">.</span>
                            </h1>
                        </div>
                        <div className="max-w-[520px]">
                            <p className="text-[15px] leading-[1.7] text-neutral-600">
                                Soudeurs, chaudronniers, usineurs, dessinateurs… DYM Manufacture recrute des talents passionnés par le travail bien fait. Consultez nos offres ou envoyez-nous une candidature spontanée.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <a
                                    href="#offres"
                                    className="hd-cta relative inline-flex items-center gap-2 overflow-hidden bg-dym px-6 py-4 text-[11px] font-semibold tracking-[0.14em] text-white uppercase transition-colors hover:bg-dym-dark"
                                >
                                    Voir les offres <ArrowRight className="hd-arrow size-3.5" />
                                </a>
                                <a
                                    href="#candidature"
                                    className="inline-flex items-center gap-2 border border-ink/20 px-6 py-4 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors hover:border-dym hover:text-dym"
                                >
                                    Candidature spontanée
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pourquoi nous rejoindre */}
                <section className="hx-hair border-y bg-ink px-5 text-white sm:px-8 lg:px-[clamp(24px,3.15vw,58px)]">
                    <ul className="mx-auto grid max-w-[1720px] lg:grid-cols-3 lg:pl-[clamp(22px,3vw,52px)]">
                        {reasons.map(({ icon: Icon, title, text }, i) => (
                            <li key={title} className={`py-10 lg:px-10 lg:py-14 ${i > 0 ? 'border-t border-white/10 lg:border-t-0 lg:border-l' : 'lg:pl-0'}`}>
                                <Icon className="size-6 text-dym" />
                                <h2 className="mt-5 font-display text-[26px] leading-none uppercase">{title}</h2>
                                <p className="mt-3 max-w-[380px] text-sm leading-relaxed text-white/70">{text}</p>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Offres */}
                <section id="offres" className="scroll-mt-24 px-5 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)]">
                    <div className="mx-auto max-w-[1720px] py-14 lg:py-20 lg:pl-[clamp(22px,3vw,52px)]">
                        <Eyebrow>{`OFFRES OUVERTES — ${String(offers.length).padStart(2, '0')}`}</Eyebrow>
                        <h2 className="font-display text-[clamp(34px,7vw,44px)] leading-[0.95] uppercase lg:text-[clamp(36px,2.8vw,50px)]">
                            Nos postes à pourvoir<span className="text-dym">.</span>
                        </h2>

                        {offers.length === 0 ? (
                            <p className="mt-8 max-w-[560px] border border-black/10 bg-white/60 p-6 text-neutral-600">
                                Aucune offre n’est ouverte pour le moment. Vous pouvez néanmoins nous adresser une{' '}
                                <a href="#candidature" className="font-semibold text-dym hover:underline">
                                    candidature spontanée
                                </a>
                                .
                            </p>
                        ) : (
                            <ul className="hx-hair mt-10 border-t">
                                {offers.map((o) => (
                                    <li key={o.id} className="hx-hair border-b">
                                        <Link href={show(o.slug)} className="group grid gap-3 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
                                            <div>
                                                <p className="hx-mono flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] tracking-[0.1em] text-neutral-500 uppercase">
                                                    <span className="text-dym">{o.contract_type}</span>
                                                    {o.department && <span>{o.department}</span>}
                                                    <span>{o.location}</span>
                                                    {o.closes_at && <span>Jusqu’au {dateFormat.format(new Date(o.closes_at))}</span>}
                                                </p>
                                                <h3 className="mt-2 text-[20px] font-semibold text-ink transition-colors group-hover:text-dym">{o.title}</h3>
                                                {o.summary && <p className="mt-1.5 max-w-[760px] text-sm leading-relaxed text-neutral-600">{o.summary}</p>}
                                            </div>
                                            <span className="hx-mono inline-flex items-center gap-2 text-[10px] tracking-[0.1em] text-dym uppercase">
                                                Voir l’offre
                                                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>

                {/* Candidature spontanée */}
                <section id="candidature" className="hx-hair scroll-mt-24 border-t px-5 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)]">
                    <div className="mx-auto grid max-w-[1720px] gap-10 py-14 lg:grid-cols-[1fr_1.3fr] lg:py-20 lg:pl-[clamp(22px,3vw,52px)]">
                        <div>
                            <Eyebrow>CANDIDATURE SPONTANÉE</Eyebrow>
                            <h2 className="font-display text-[clamp(34px,7vw,44px)] leading-[0.95] uppercase lg:text-[clamp(36px,2.8vw,50px)]">
                                Votre profil
                                <br />
                                nous intéresse<span className="text-dym">.</span>
                            </h2>
                            <p className="mt-5 max-w-[420px] text-[15px] leading-[1.7] text-neutral-600">
                                Vous ne trouvez pas le poste qui vous correspond ? Envoyez-nous votre CV : nous le conservons et vous contactons dès qu’une opportunité se présente.
                            </p>
                        </div>
                        <ApplicationForm />
                    </div>
                </section>

                <SiteFooter activities={activities} site={site} />
            </div>
        </>
    );
}
