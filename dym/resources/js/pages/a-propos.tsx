import { Head, Link } from '@inertiajs/react';
import {
    Compass,
    Check,
    Target,
    Shield,
    HardHat,
    ShieldAlert,
    Activity,
    HeartPulse,
    Leaf,
    Fan,
    Recycle,
    ShieldCheck,
    Users,
    CheckCircle2,
    Send,
} from 'lucide-react';
import { useState } from 'react';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { create as quoteCreate } from '@/routes/quotes';
import type { Activity as SiteActivity, SiteSettings } from '@/types/admin';

export default function AboutPage({
    activities,
    site,
}: {
    activities: SiteActivity[];
    site: SiteSettings;
}) {
    const [tab, setTab] = useState('recyclage');
    return (
        <>
            <Head title="À propos | DYM Manufacture">
                <meta
                    name="description"
                    content="Découvrez la mission, la vision et les engagements HSE et RSE de DYM Manufacture, spécialiste des ouvrages métalliques sur mesure."
                />
            </Head>
            <SiteHeader active="À propos" />
            <main className="bg-[#0F1115] text-gray-100 [&_section[id]]:scroll-mt-24">
                <section className="relative flex min-h-[65vh] items-center overflow-hidden bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[30px_30px] py-20">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0F1115]/40 via-[#0F1115]/80 to-[#0F1115]"></div>

                    <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
                            <div className="space-y-6 lg:col-span-7">
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#C5A059]/30 bg-[#C5A059]/10 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-[#C5A059] uppercase">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#C5A059]"></span>
                                    À Propos de DYM Manufacture
                                </div>

                                <h1 className="text-3xl leading-tight font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                                    Le spécialiste de la métallurgie{' '}
                                    <br className="hidden sm:inline" />
                                    <span className="bg-gradient-to-br from-[#FFF0D0] via-[#C5A059] to-[#E5C158] bg-clip-text text-transparent">
                                        Rigoureuse et Responsable.
                                    </span>
                                </h1>

                                <p className="max-w-2xl text-base leading-relaxed font-normal text-gray-300 sm:text-lg">
                                    Nous concevons et façonnons des ouvrages
                                    industriels et architecturaux sur mesure en
                                    alliant haute précision technique, sécurité
                                    absolue sur chantier et durabilité garantie
                                    des matériaux.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="mission-vision"
                    className="border-y border-[#2E3440]/60 bg-[#181B20]/50 py-20"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto mb-16 max-w-3xl space-y-3 text-center">
                            <span className="rounded-full border border-[#C5A059]/20 bg-[#C5A059]/10 px-3 py-1 text-xs font-semibold tracking-widest text-[#C5A059] uppercase">
                                Notre Raison d'Être
                            </span>
                            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                                Un cap clair pour l'industrie de demain
                            </h2>
                            <p className="text-sm text-gray-400 sm:text-base">
                                Chaque projet est une synthèse entre précision
                                technique et responsabilité industrielle.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div className="group flex flex-col justify-between rounded-2xl border border-[#2E3440] bg-[#20242C] p-8 shadow-lg transition-all duration-300 hover:border-[#C5A059]/40">
                                <div className="space-y-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#C5A059]/30 bg-[#C5A059]/10 text-[#C5A059] transition-transform group-hover:scale-110">
                                        <Compass
                                            aria-hidden="true"
                                            className="h-7 w-7"
                                        />
                                    </div>
                                    <span className="font-mono text-xs tracking-widest text-[#C5A059] uppercase">
                                        Orientation Stratégique
                                    </span>
                                    <h3 className="text-2xl font-bold text-white">
                                        Notre Mission
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-300">
                                        Concevoir et fabriquer des ouvrages
                                        métalliques et multi-matériaux sur
                                        mesure, en garantissant une précision
                                        d'exécution irréprochable et un suivi
                                        rigoureux à chaque étape du projet, de
                                        l'étude B2B jusqu'à la pose finale sur
                                        chantier.
                                    </p>
                                </div>
                                <ul className="mt-6 space-y-2 border-t border-[#2E3440]/60 pt-6 text-xs text-gray-400">
                                    <li className="flex items-center gap-2">
                                        <Check
                                            aria-hidden="true"
                                            className="h-4 w-4 text-[#C5A059]"
                                        />{' '}
                                        Étude personnalisée & métrés de
                                        précision
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check
                                            aria-hidden="true"
                                            className="h-4 w-4 text-[#C5A059]"
                                        />{' '}
                                        Sélection d'alliages certifiés &
                                        traçables
                                    </li>
                                </ul>
                            </div>

                            <div className="group flex flex-col justify-between rounded-2xl border border-[#2E3440] bg-[#20242C] p-8 shadow-lg transition-all duration-300 hover:border-[#C5A059]/40">
                                <div className="space-y-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#C5A059]/30 bg-[#C5A059]/10 text-[#C5A059] transition-transform group-hover:scale-110">
                                        <Target
                                            aria-hidden="true"
                                            className="h-7 w-7"
                                        />
                                    </div>
                                    <span className="font-mono text-xs tracking-widest text-[#C5A059] uppercase">
                                        Ambition & Avenir
                                    </span>
                                    <h3 className="text-2xl font-bold text-white">
                                        Notre Vision
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-300">
                                        Devenir la référence industrielle
                                        régionale en matière d'innovation
                                        rigoureuse, de sécurité sur chantier et
                                        de fabrication responsable pour tous les
                                        projets architecturaux, tertiaires et
                                        industriels d'envergure.
                                    </p>
                                </div>
                                <ul className="mt-6 space-y-2 border-t border-[#2E3440]/60 pt-6 text-xs text-gray-400">
                                    <li className="flex items-center gap-2">
                                        <Check
                                            aria-hidden="true"
                                            className="h-4 w-4 text-[#C5A059]"
                                        />{' '}
                                        Décarbonation progressive des process
                                        d'usinage
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check
                                            aria-hidden="true"
                                            className="h-4 w-4 text-[#C5A059]"
                                        />{' '}
                                        Standard 'Zéro Accident' sur tous nos
                                        chantiers
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="hse" className="relative py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#C5A059]/20 bg-[#C5A059]/10 px-3 py-1 text-xs font-semibold tracking-widest text-[#C5A059] uppercase">
                                    <Shield
                                        aria-hidden="true"
                                        className="h-3.5 w-3.5"
                                    />{' '}
                                    Normes & Rigueurs Opérationnelles
                                </div>
                                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                                    Politique HSE : La Sécurité sans Compromis
                                </h2>
                            </div>
                            <p className="max-w-md text-sm text-gray-400">
                                La qualité d'un ouvrage ne s'arrête pas à son
                                esthétique. Elle repose sur la maîtrise totale
                                des risques humains et environnementaux en
                                atelier comme sur chantier.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div className="rounded-xl border border-[#2E3440] bg-[#181B20] p-6 transition-all hover:border-[#C5A059]/40">
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#C5A059]/10 text-[#C5A059]">
                                    <HardHat
                                        aria-hidden="true"
                                        className="h-6 w-6"
                                    />
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-white">
                                    Sécurité des Équipes
                                </h3>
                                <ul className="space-y-3 text-sm text-gray-300">
                                    <li className="flex items-start gap-2.5">
                                        <ShieldAlert
                                            aria-hidden="true"
                                            className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A059]"
                                        />
                                        <span>
                                            Port systématique des EPI
                                            obligatoires en atelier et sur site
                                            client.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <ShieldAlert
                                            aria-hidden="true"
                                            className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A059]"
                                        />
                                        <span>
                                            Protocoles stricts pour la
                                            manipulation des machines et charges
                                            lourdes.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <ShieldAlert
                                            aria-hidden="true"
                                            className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A059]"
                                        />
                                        <span>
                                            Procédures d'ancrage et de pose
                                            sécurisées pour les utilisateurs.
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            <div className="rounded-xl border border-[#2E3440] bg-[#181B20] p-6 transition-all hover:border-[#C5A059]/40">
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#C5A059]/10 text-[#C5A059]">
                                    <Activity
                                        aria-hidden="true"
                                        className="h-6 w-6"
                                    />
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-white">
                                    Santé & Ergonomie
                                </h3>
                                <ul className="space-y-3 text-sm text-gray-300">
                                    <li className="flex items-start gap-2.5">
                                        <HeartPulse
                                            aria-hidden="true"
                                            className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A059]"
                                        />
                                        <span>
                                            Aménagement ergonomique des postes
                                            d'usinage et d'assemblage.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <HeartPulse
                                            aria-hidden="true"
                                            className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A059]"
                                        />
                                        <span>
                                            Prévention active des risques
                                            professionnels et des TMS (troubles
                                            musculo-squelettiques).
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <HeartPulse
                                            aria-hidden="true"
                                            className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A059]"
                                        />
                                        <span>
                                            Maintien d'un environnement de
                                            travail propre, ordonné et
                                            régulièrement audité.
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            <div className="rounded-xl border border-[#2E3440] bg-[#181B20] p-6 transition-all hover:border-[#C5A059]/40">
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#C5A059]/10 text-[#C5A059]">
                                    <Leaf
                                        aria-hidden="true"
                                        className="h-6 w-6"
                                    />
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-white">
                                    Maîtrise des Impacts
                                </h3>
                                <ul className="space-y-3 text-sm text-gray-300">
                                    <li className="flex items-start gap-2.5">
                                        <Fan
                                            aria-hidden="true"
                                            className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A059]"
                                        />
                                        <span>
                                            Captation haute performance des
                                            fumées de soudure et contrôle des
                                            émissions.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <Fan
                                            aria-hidden="true"
                                            className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A059]"
                                        />
                                        <span>
                                            Gestion stricte des étincelles et
                                            réduction des nuisances sonores.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <Fan
                                            aria-hidden="true"
                                            className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A059]"
                                        />
                                        <span>
                                            Stockage sécurisé des produits de
                                            finition et gestion responsable des
                                            consommables.
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="rse"
                    className="border-t border-[#2E3440]/60 bg-[#181B20]/40 py-20"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto mb-16 max-w-3xl space-y-3 text-center">
                            <span className="rounded-full border border-[#C5A059]/20 bg-[#C5A059]/10 px-3 py-1 text-xs font-semibold tracking-widest text-[#C5A059] uppercase">
                                Engagement RSE
                            </span>
                            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                                Une Fabrication Pensée pour Durer & Respecter
                                les Ressources
                            </h2>
                            <p className="text-sm text-gray-400 sm:text-base">
                                Découvrez comment nous intégrons la
                                responsabilité sociétale au cœur de nos
                                processus de fabrication.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[#2E3440] bg-[#20242C] p-6 shadow-xl sm:p-8">
                            <div className="mb-8 flex flex-wrap gap-2 border-b border-[#2E3440] pb-6">
                                <button
                                    type="button"
                                    onClick={() => setTab('recyclage')}
                                    aria-expanded={tab === 'recyclage'}
                                    aria-controls="tab-content-recyclage"
                                    id="tab-btn-recyclage"
                                    className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${tab === 'recyclage' ? 'bg-[#C5A059] text-[#0F1115]' : 'bg-[#181B20] text-gray-400 hover:text-white'}`}
                                >
                                    <Recycle
                                        aria-hidden="true"
                                        className="h-4 w-4"
                                    />
                                    1. Recyclage & Matière
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTab('durabilite')}
                                    aria-expanded={tab === 'durabilite'}
                                    aria-controls="tab-content-durabilite"
                                    id="tab-btn-durabilite"
                                    className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${tab === 'durabilite' ? 'bg-[#C5A059] text-[#0F1115]' : 'bg-[#181B20] text-gray-400 hover:text-white'}`}
                                >
                                    <ShieldCheck
                                        aria-hidden="true"
                                        className="h-4 w-4"
                                    />
                                    2. Durabilité & Finitions
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTab('ancrage')}
                                    aria-expanded={tab === 'ancrage'}
                                    aria-controls="tab-content-ancrage"
                                    id="tab-btn-ancrage"
                                    className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${tab === 'ancrage' ? 'bg-[#C5A059] text-[#0F1115]' : 'bg-[#181B20] text-gray-400 hover:text-white'}`}
                                >
                                    <Users
                                        aria-hidden="true"
                                        className="h-4 w-4"
                                    />
                                    3. Ancrage Local & Capital Humain
                                </button>
                            </div>

                            <div
                                id="tab-content-recyclage"
                                role="region"
                                aria-labelledby="tab-btn-recyclage"
                                hidden={tab !== 'recyclage'}
                                className="hidden:hidden grid grid-cols-1 items-center gap-8 lg:grid-cols-12"
                            >
                                <div className="space-y-4 lg:col-span-7">
                                    <span className="font-mono text-xs tracking-wider text-[#C5A059] uppercase">
                                        Optimisation des Matières Premières
                                    </span>
                                    <h3 className="text-2xl font-bold text-white">
                                        Gestion Intelligente des Métaux &
                                        Déchets
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-300">
                                        Dans notre atelier, chaque tôle et
                                        chaque profilé est optimisé grâce à nos
                                        logiciels de découpe automatique
                                        (imbrication de pièces). Cela nous
                                        permet de réduire au strict minimum les
                                        chutages de métal.
                                    </p>
                                    <ul className="space-y-2 pt-2 text-sm text-gray-300">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2
                                                aria-hidden="true"
                                                className="h-4 w-4 shrink-0 text-[#C5A059]"
                                            />{' '}
                                            Revalorisation à 100% des chutes
                                            métalliques auprès de filières de
                                            recyclage agréées.
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2
                                                aria-hidden="true"
                                                className="h-4 w-4 shrink-0 text-[#C5A059]"
                                            />{' '}
                                            Tri sélectif rigoureux de tous les
                                            déchets industriels banals et
                                            dangereux.
                                        </li>
                                    </ul>
                                </div>
                                <div className="space-y-4 rounded-xl border border-[#2E3440] bg-[#181B20] p-6 lg:col-span-5">
                                    <div className="py-4 text-center">
                                        <p className="font-mono text-4xl font-extrabold text-[#C5A059]">
                                            100%
                                        </p>
                                        <p className="mt-1 text-xs tracking-wider text-gray-400 uppercase">
                                            Des Chutes Métalliques Revalorisées
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-[#2E3440] bg-[#0F1115]/60 p-3 text-xs text-gray-400">
                                        <span className="font-semibold text-white">
                                            Indicateur d'Atelier :
                                        </span>{' '}
                                        Zéro déchet métallique non-traité.
                                        Traçabilité complète du cycle de
                                        réutilisation des sous-produits.
                                    </div>
                                </div>
                            </div>

                            <div
                                id="tab-content-durabilite"
                                role="region"
                                aria-labelledby="tab-btn-durabilite"
                                hidden={tab !== 'durabilite'}
                                className="hidden:hidden grid grid-cols-1 items-center gap-8 lg:grid-cols-12"
                            >
                                <div className="space-y-4 lg:col-span-7">
                                    <span className="font-mono text-xs tracking-wider text-[#C5A059] uppercase">
                                        Pérennité des Ouvrages
                                    </span>
                                    <h3 className="text-2xl font-bold text-white">
                                        Traitement Anti-Corrosion & Matériaux
                                        Résistants
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-300">
                                        Un ouvrage durable est un ouvrage qui
                                        résiste à l'épreuve du temps et des
                                        contraintes climatiques. Nous appliquons
                                        des traitements de surface de haute
                                        qualité (galvanisation, thermolaquage,
                                        finitions anticorrosion).
                                    </p>
                                    <ul className="space-y-2 pt-2 text-sm text-gray-300">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2
                                                aria-hidden="true"
                                                className="h-4 w-4 shrink-0 text-[#C5A059]"
                                            />{' '}
                                            Choix rigoureux d'alliages adaptés à
                                            chaque environnement
                                            (intérieur/extérieur/marin).
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2
                                                aria-hidden="true"
                                                className="h-4 w-4 shrink-0 text-[#C5A059]"
                                            />{' '}
                                            Conception pensée pour faciliter la
                                            maintenance future et réduire les
                                            coûts globaux.
                                        </li>
                                    </ul>
                                </div>
                                <div className="space-y-4 rounded-xl border border-[#2E3440] bg-[#181B20] p-6 lg:col-span-5">
                                    <div className="py-4 text-center">
                                        <p className="font-mono text-4xl font-extrabold text-[#C5A059]">
                                            20+ Ans
                                        </p>
                                        <p className="mt-1 text-xs tracking-wider text-gray-400 uppercase">
                                            Résistance Estimée aux Intempéries
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-[#2E3440] bg-[#0F1115]/60 p-3 text-xs text-gray-400">
                                        <span className="font-semibold text-white">
                                            Standard Qualité :
                                        </span>{' '}
                                        Application strictement conforme aux
                                        exigences d'exposition en milieu
                                        industriel et urbain.
                                    </div>
                                </div>
                            </div>

                            <div
                                id="tab-content-ancrage"
                                role="region"
                                aria-labelledby="tab-btn-ancrage"
                                hidden={tab !== 'ancrage'}
                                className="hidden:hidden grid grid-cols-1 items-center gap-8 lg:grid-cols-12"
                            >
                                <div className="space-y-4 lg:col-span-7">
                                    <span className="font-mono text-xs tracking-wider text-[#C5A059] uppercase">
                                        Social & Territoire
                                    </span>
                                    <h3 className="text-2xl font-bold text-white">
                                        Ancrage Territorial & Montée en
                                        Compétences
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-300">
                                        Nous investissons continuellement dans
                                        l'humain. Transmettre les savoir-faire
                                        de la chaudronnerie et de la métallerie
                                        est essentiel pour préserver
                                        l'excellence industrielle de notre
                                        territoire.
                                    </p>
                                    <ul className="space-y-2 pt-2 text-sm text-gray-300">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2
                                                aria-hidden="true"
                                                className="h-4 w-4 shrink-0 text-[#C5A059]"
                                            />{' '}
                                            Plan de formation continue pour nos
                                            soudeurs, ajusteurs et chefs de
                                            chantier.
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2
                                                aria-hidden="true"
                                                className="h-4 w-4 shrink-0 text-[#C5A059]"
                                            />{' '}
                                            Partenariats avec les acteurs
                                            économiques et sous-traitants
                                            locaux.
                                        </li>
                                    </ul>
                                </div>
                                <div className="space-y-4 rounded-xl border border-[#2E3440] bg-[#181B20] p-6 lg:col-span-5">
                                    <div className="py-4 text-center">
                                        <p className="font-mono text-4xl font-extrabold text-[#C5A059]">
                                            100%
                                        </p>
                                        <p className="mt-1 text-xs tracking-wider text-gray-400 uppercase">
                                            Équipes & Partenaires Régionaux
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-[#2E3440] bg-[#0F1115]/60 p-3 text-xs text-gray-400">
                                        <span className="font-semibold text-white">
                                            Valeur Humaine :
                                        </span>{' '}
                                        Promotion de l'apprentissage et
                                        valorisation des métiers manuels
                                        qualifiés.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="chiffres"
                    className="relative overflow-hidden bg-[#0F1115] py-20"
                >
                    <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="rounded-2xl border border-[#C5A059]/30 bg-gradient-to-r from-[#181B20] via-[#20242C] to-[#181B20] p-8 shadow-2xl sm:p-12">
                            <div className="mx-auto mb-10 max-w-2xl text-center">
                                <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                                    Indicateurs de Réassurance B2B
                                </h2>
                                <p className="mt-2 text-xs text-[#9CA3AF] sm:text-sm">
                                    Des standards rigoureux mesurés pour la
                                    tranquillité d'esprit de nos donneurs
                                    d'ordre.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-8 divide-y divide-[#2E3440]/60 text-center lg:grid-cols-4 lg:divide-x lg:divide-y-0">
                                <div className="pt-4 lg:pt-0">
                                    <p className="font-mono text-3xl font-extrabold tracking-tight text-[#C5A059] sm:text-5xl">
                                        0
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-white">
                                        Accident Majeur
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        Objectif permanent sur nos chantiers
                                    </p>
                                </div>

                                <div className="pt-4 lg:pt-0">
                                    <p className="font-mono text-3xl font-extrabold tracking-tight text-[#C5A059] sm:text-5xl">
                                        100%
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-white">
                                        Sur Mesure Validé
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        Selon les normes de résistance
                                    </p>
                                </div>

                                <div className="pt-4 lg:pt-0">
                                    <p className="font-mono text-3xl font-extrabold tracking-tight text-[#C5A059] sm:text-5xl">
                                        Longue
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-white">
                                        Durabilité Garantie
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        Traitements anticorrosion maîtrisés
                                    </p>
                                </div>

                                <div className="pt-4 lg:pt-0">
                                    <p className="font-mono text-3xl font-extrabold tracking-tight text-[#C5A059] sm:text-5xl">
                                        Précis
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-white">
                                        Dimensionnement
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        Contrôle structurel rigoureux
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-[#181B20]/60 py-20">
                    <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
                        <div className="relative overflow-hidden rounded-2xl border border-[#2E3440] bg-[#20242C] p-8 shadow-2xl sm:p-12">
                            <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-[#C5A059]/10 blur-3xl"></div>

                            <span className="rounded-full border border-[#C5A059]/20 bg-[#C5A059]/10 px-3 py-1 font-mono text-xs tracking-widest text-[#C5A059] uppercase">
                                Engagement & Partenariat
                            </span>

                            <h2 className="mt-6 mb-4 text-2xl font-extrabold text-white sm:text-4xl">
                                Un Projet d'Aménagement ou d'Ouvrage Métallique
                                ?
                            </h2>

                            <p className="mx-auto mb-8 max-w-2xl text-sm text-gray-300 sm:text-base">
                                Échangeons sur vos contraintes techniques, vos
                                exigences de sécurité HSE et vos besoins de
                                fabrication sur mesure.
                            </p>

                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Link
                                    href={quoteCreate()}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C5A059] px-8 py-4 text-base font-semibold text-[#0F1115] shadow-lg transition-all duration-200 hover:bg-[#E5C158] sm:w-auto"
                                >
                                    <Send
                                        aria-hidden="true"
                                        className="h-5 w-5"
                                    />
                                    Demander un Devis / Échanger avec un Expert
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <SiteFooter activities={activities} site={site} />
        </>
    );
}
