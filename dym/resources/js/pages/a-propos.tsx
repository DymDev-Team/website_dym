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
import type { ReactNode } from 'react';
import { useSectionColor } from '@/components/site/use-section-color';
import { useTexts } from '@/components/site/use-texts';
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
    const t = useTexts();
    const [tab, setTab] = useState('recyclage');
    // Couleurs de fond et des libellés, réglables dans /admin/settings.
    const heroStyle = useSectionColor('about_page_hero');
    const heroColor: string = heroStyle.backgroundColor ?? '#0F1115';
    const missionStyle = useSectionColor('about_page_mission');
    const hseStyle = useSectionColor('about_page_hse');
    const rseStyle = useSectionColor('about_page_rse');
    const figuresStyle = useSectionColor('about_page_figures');
    const contactStyle = useSectionColor('about_page_contact');
    const missionCardsStyle = useSectionColor('about_page_mission_cards');
    const hseCardsStyle = useSectionColor('about_page_hse_cards');
    const rseCardsStyle = useSectionColor('about_page_rse_cards');
    const figuresCardsStyle = useSectionColor('about_page_figures_cards');
    const contactCardsStyle = useSectionColor('about_page_contact_cards');
    return (
        <>
            <Head title={t('about.meta.title')}>
                <meta
                    name="description"
                    content={t('about.meta.description')}
                />
            </Head>
            <SiteHeader active="À propos" />
            <main className="bg-[#0F1115] text-gray-100 [&_section[id]]:scroll-mt-24">
                <section
                    style={heroStyle}
                    className="relative flex min-h-[65vh] items-center overflow-hidden py-20"
                >
                    {/* Image de fond modifiable dans /admin/texts (À propos › Bandeau principal). */}
                    <img
                        src={t('about.hero.background')}
                        alt=""
                        aria-hidden="true"
                        fetchPriority="high"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    {/* Voiles teintés de la couleur choisie dans /admin/settings. */}
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            backgroundImage: `linear-gradient(to right, ${heroColor}, color-mix(in srgb, ${heroColor} 85%, transparent), color-mix(in srgb, ${heroColor} 45%, transparent))`,
                        }}
                    ></div>
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[30px_30px]"></div>
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            backgroundImage: `linear-gradient(to bottom, transparent, transparent, ${heroColor})`,
                        }}
                    ></div>

                    <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
                            <div className="space-y-6 lg:col-span-7">
                                <div className="inline-flex items-center gap-2 hx-label rounded-full border border-current/30 bg-current/10 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-[#C5A059] uppercase">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-current"></span>
                                    {t.c('about.hero.text_01')}
                                </div>

                                <h1 className="text-3xl leading-tight font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                                    {t.c('about.hero.text_02')}{' '}
                                    <br className="hidden sm:inline" />
                                    <span className="bg-gradient-to-br from-[#FFF0D0] via-[#C5A059] to-[#E5C158] bg-clip-text text-transparent">
                                        {t.c('about.hero.text_03')}
                                    </span>
                                </h1>

                                <p className="max-w-2xl text-base leading-relaxed font-normal text-gray-300 sm:text-lg">
                                    {t.c('about.hero.text_04')}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="mission-vision"
                    style={missionStyle}
                    className="border-y border-[#2E3440]/60 bg-[#181B20]/50 py-20"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto mb-16 max-w-3xl space-y-3 text-center">
                            <span className="hx-label rounded-full border border-current/20 bg-current/10 px-3 py-1 text-xs font-semibold tracking-widest text-[#C5A059] uppercase">
                                {t.c('about.mission_vision.text_01')}
                            </span>
                            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                                {t.c('about.mission_vision.text_02')}
                            </h2>
                            <p className="text-sm text-gray-400 sm:text-base">
                                {t.c('about.mission_vision.text_03')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div style={missionCardsStyle} className="group flex flex-col justify-between rounded-2xl border border-[#2E3440] bg-[#20242C] p-8 shadow-lg transition-all duration-300 hover:border-[#C5A059]/40">
                                <div className="space-y-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#C5A059]/30 bg-[#C5A059]/10 text-[#C5A059] transition-transform group-hover:scale-110">
                                        <Compass
                                            aria-hidden="true"
                                            className="h-7 w-7"
                                        />
                                    </div>
                                    <span className="hx-label font-mono text-xs tracking-widest text-[#C5A059] uppercase">
                                        {t.c('about.mission_vision.text_04')}
                                    </span>
                                    <h3 className="text-2xl font-bold text-white">
                                        {t.c('about.mission_vision.text_05')}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-300">
                                        {t.c('about.mission_vision.text_06')}
                                    </p>
                                </div>
                                <ul className="mt-6 space-y-2 border-t border-[#2E3440]/60 pt-6 text-xs text-gray-400">
                                    <li className="flex items-center gap-2">
                                        <Check
                                            aria-hidden="true"
                                            className="h-4 w-4 text-[#C5A059]"
                                        />{' '}
                                        {t.c('about.mission_vision.text_07')}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check
                                            aria-hidden="true"
                                            className="h-4 w-4 text-[#C5A059]"
                                        />{' '}
                                        {t.c('about.mission_vision.text_08')}
                                    </li>
                                </ul>
                            </div>

                            <div style={missionCardsStyle} className="group flex flex-col justify-between rounded-2xl border border-[#2E3440] bg-[#20242C] p-8 shadow-lg transition-all duration-300 hover:border-[#C5A059]/40">
                                <div className="space-y-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#C5A059]/30 bg-[#C5A059]/10 text-[#C5A059] transition-transform group-hover:scale-110">
                                        <Target
                                            aria-hidden="true"
                                            className="h-7 w-7"
                                        />
                                    </div>
                                    <span className="hx-label font-mono text-xs tracking-widest text-[#C5A059] uppercase">
                                        {t.c('about.mission_vision.text_09')}
                                    </span>
                                    <h3 className="text-2xl font-bold text-white">
                                        {t.c('about.mission_vision.text_10')}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-300">
                                        {t.c('about.mission_vision.text_11')}
                                    </p>
                                </div>
                                <ul className="mt-6 space-y-2 border-t border-[#2E3440]/60 pt-6 text-xs text-gray-400">
                                    <li className="flex items-center gap-2">
                                        <Check
                                            aria-hidden="true"
                                            className="h-4 w-4 text-[#C5A059]"
                                        />{' '}
                                        {t.c('about.mission_vision.text_12')}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check
                                            aria-hidden="true"
                                            className="h-4 w-4 text-[#C5A059]"
                                        />{' '}
                                        {t.c('about.mission_vision.text_13')}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="hse" style={hseStyle} className="relative py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 hx-label rounded-full border border-current/20 bg-current/10 px-3 py-1 text-xs font-semibold tracking-widest text-[#C5A059] uppercase">
                                    <Shield
                                        aria-hidden="true"
                                        className="h-3.5 w-3.5"
                                    />{' '}
                                    {t.c('about.hse.text_01')}
                                </div>
                                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                                    {t.c('about.hse.text_02')}
                                </h2>
                            </div>
                            <p className="max-w-md text-sm text-gray-400">
                                {t.c('about.hse.text_03')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div style={hseCardsStyle} className="rounded-xl border border-[#2E3440] bg-[#181B20] p-6 transition-all hover:border-[#C5A059]/40">
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#C5A059]/10 text-[#C5A059]">
                                    <HardHat
                                        aria-hidden="true"
                                        className="h-6 w-6"
                                    />
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-white">
                                    {t.c('about.hse.text_04')}
                                </h3>
                                <ul className="space-y-3 text-sm text-gray-300">
                                    <li className="flex items-start gap-2.5">
                                        <ShieldAlert
                                            aria-hidden="true"
                                            className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A059]"
                                        />
                                        <span>{t.c('about.hse.text_05')}</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <ShieldAlert
                                            aria-hidden="true"
                                            className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A059]"
                                        />
                                        <span>{t.c('about.hse.text_06')}</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <ShieldAlert
                                            aria-hidden="true"
                                            className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A059]"
                                        />
                                        <span>{t.c('about.hse.text_07')}</span>
                                    </li>
                                </ul>
                            </div>

                            <div style={hseCardsStyle} className="rounded-xl border border-[#2E3440] bg-[#181B20] p-6 transition-all hover:border-[#C5A059]/40">
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#C5A059]/10 text-[#C5A059]">
                                    <Activity
                                        aria-hidden="true"
                                        className="h-6 w-6"
                                    />
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-white">
                                    {t.c('about.hse.text_08')}
                                </h3>
                                <ul className="space-y-3 text-sm text-gray-300">
                                    <li className="flex items-start gap-2.5">
                                        <HeartPulse
                                            aria-hidden="true"
                                            className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A059]"
                                        />
                                        <span>{t.c('about.hse.text_09')}</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <HeartPulse
                                            aria-hidden="true"
                                            className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A059]"
                                        />
                                        <span>{t.c('about.hse.text_10')}</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <HeartPulse
                                            aria-hidden="true"
                                            className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A059]"
                                        />
                                        <span>{t.c('about.hse.text_11')}</span>
                                    </li>
                                </ul>
                            </div>

                            <div style={hseCardsStyle} className="rounded-xl border border-[#2E3440] bg-[#181B20] p-6 transition-all hover:border-[#C5A059]/40">
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#C5A059]/10 text-[#C5A059]">
                                    <Leaf
                                        aria-hidden="true"
                                        className="h-6 w-6"
                                    />
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-white">
                                    {t.c('about.hse.text_12')}
                                </h3>
                                <ul className="space-y-3 text-sm text-gray-300">
                                    <li className="flex items-start gap-2.5">
                                        <Fan
                                            aria-hidden="true"
                                            className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A059]"
                                        />
                                        <span>{t.c('about.hse.text_13')}</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <Fan
                                            aria-hidden="true"
                                            className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A059]"
                                        />
                                        <span>{t.c('about.hse.text_14')}</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <Fan
                                            aria-hidden="true"
                                            className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A059]"
                                        />
                                        <span>{t.c('about.hse.text_15')}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="rse"
                    style={rseStyle}
                    className="border-t border-[#2E3440]/60 bg-[#181B20]/40 py-20"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto mb-16 max-w-3xl space-y-3 text-center">
                            <span className="hx-label rounded-full border border-current/20 bg-current/10 px-3 py-1 text-xs font-semibold tracking-widest text-[#C5A059] uppercase">
                                {t.c('about.rse.text_01')}
                            </span>
                            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                                {t.c('about.rse.text_02')}
                            </h2>
                            <p className="text-sm text-gray-400 sm:text-base">
                                {t.c('about.rse.text_03')}
                            </p>
                        </div>

                        <div style={rseCardsStyle} className="rounded-2xl border border-[#2E3440] bg-[#20242C] p-6 shadow-xl sm:p-8">
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
                                    {t.c('about.rse.text_04')}
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
                                    {t.c('about.rse.text_05')}
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
                                    {t.c('about.rse.text_06')}
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
                                    <span className="hx-label font-mono text-xs tracking-wider text-[#C5A059] uppercase">
                                        {t.c('about.rse.text_07')}
                                    </span>
                                    <h3 className="text-2xl font-bold text-white">
                                        {t.c('about.rse.text_08')}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-300">
                                        {t.c('about.rse.text_09')}
                                    </p>
                                    <ul className="space-y-2 pt-2 text-sm text-gray-300">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2
                                                aria-hidden="true"
                                                className="h-4 w-4 shrink-0 text-[#C5A059]"
                                            />{' '}
                                            {t.c('about.rse.text_10')}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2
                                                aria-hidden="true"
                                                className="h-4 w-4 shrink-0 text-[#C5A059]"
                                            />{' '}
                                            {t.c('about.rse.text_11')}
                                        </li>
                                    </ul>
                                </div>
                                {/* Photo modifiable dans /admin/texts (À propos › Engagement RSE). */}
                                <div className="overflow-hidden rounded-xl border border-[#2E3440] bg-[#181B20] lg:col-span-5">
                                    <img
                                        src={t('about.rse.recyclage_image')}
                                        alt={t('about.rse.text_08')}
                                        loading="lazy"
                                        className="aspect-4/3 w-full object-cover"
                                    />
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
                                    <span className="hx-label font-mono text-xs tracking-wider text-[#C5A059] uppercase">
                                        {t.c('about.rse.text_16')}
                                    </span>
                                    <h3 className="text-2xl font-bold text-white">
                                        {t.c('about.rse.text_17')}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-300">
                                        {t.c('about.rse.text_18')}
                                    </p>
                                    <ul className="space-y-2 pt-2 text-sm text-gray-300">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2
                                                aria-hidden="true"
                                                className="h-4 w-4 shrink-0 text-[#C5A059]"
                                            />{' '}
                                            {t.c('about.rse.text_19')}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2
                                                aria-hidden="true"
                                                className="h-4 w-4 shrink-0 text-[#C5A059]"
                                            />{' '}
                                            {t.c('about.rse.text_20')}
                                        </li>
                                    </ul>
                                </div>
                                <TabPhoto
                                    src={t('about.rse.durabilite_image')}
                                    alt={t('about.rse.text_17')}
                                    figure={t.c('about.rse.text_21')}
                                    caption={t.c('about.rse.text_22')}
                                    noteTitle={t.c('about.rse.text_23')}
                                    note={t.c('about.rse.text_24')}
                                />
                            </div>

                            <div
                                id="tab-content-ancrage"
                                role="region"
                                aria-labelledby="tab-btn-ancrage"
                                hidden={tab !== 'ancrage'}
                                className="hidden:hidden grid grid-cols-1 items-center gap-8 lg:grid-cols-12"
                            >
                                <div className="space-y-4 lg:col-span-7">
                                    <span className="hx-label font-mono text-xs tracking-wider text-[#C5A059] uppercase">
                                        {t.c('about.rse.text_25')}
                                    </span>
                                    <h3 className="text-2xl font-bold text-white">
                                        {t.c('about.rse.text_26')}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-300">
                                        {t.c('about.rse.text_27')}
                                    </p>
                                    <ul className="space-y-2 pt-2 text-sm text-gray-300">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2
                                                aria-hidden="true"
                                                className="h-4 w-4 shrink-0 text-[#C5A059]"
                                            />{' '}
                                            {t.c('about.rse.text_28')}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2
                                                aria-hidden="true"
                                                className="h-4 w-4 shrink-0 text-[#C5A059]"
                                            />{' '}
                                            {t.c('about.rse.text_29')}
                                        </li>
                                    </ul>
                                </div>
                                <TabPhoto
                                    src={t('about.rse.ancrage_image')}
                                    alt={t('about.rse.text_26')}
                                    figure={t.c('about.rse.text_30')}
                                    caption={t.c('about.rse.text_31')}
                                    noteTitle={t.c('about.rse.text_32')}
                                    note={t.c('about.rse.text_33')}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="chiffres"
                    style={figuresStyle}
                    className="relative overflow-hidden bg-[#0F1115] py-20"
                >
                    <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div style={figuresCardsStyle} className="rounded-2xl border border-[#C5A059]/30 bg-[#20242C] p-8 shadow-2xl sm:p-12">
                            <div className="mx-auto mb-10 max-w-2xl text-center">
                                <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                                    {t.c('about.chiffres.text_01')}
                                </h2>
                                <p className="mt-2 text-xs text-[#9CA3AF] sm:text-sm">
                                    {t.c('about.chiffres.text_02')}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-8 divide-y divide-[#2E3440]/60 text-center lg:grid-cols-4 lg:divide-x lg:divide-y-0">
                                <div className="pt-4 lg:pt-0">
                                    <p className="font-mono text-3xl font-extrabold tracking-tight text-[#C5A059] sm:text-5xl">
                                        {t.c('about.chiffres.text_03')}
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-white">
                                        {t.c('about.chiffres.text_04')}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        {t.c('about.chiffres.text_05')}
                                    </p>
                                </div>

                                <div className="pt-4 lg:pt-0">
                                    <p className="font-mono text-3xl font-extrabold tracking-tight text-[#C5A059] sm:text-5xl">
                                        {t.c('about.chiffres.text_06')}
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-white">
                                        {t.c('about.chiffres.text_07')}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        {t.c('about.chiffres.text_08')}
                                    </p>
                                </div>

                                <div className="pt-4 lg:pt-0">
                                    <p className="font-mono text-3xl font-extrabold tracking-tight text-[#C5A059] sm:text-5xl">
                                        {t.c('about.chiffres.text_09')}
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-white">
                                        {t.c('about.chiffres.text_10')}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        {t.c('about.chiffres.text_11')}
                                    </p>
                                </div>

                                <div className="pt-4 lg:pt-0">
                                    <p className="font-mono text-3xl font-extrabold tracking-tight text-[#C5A059] sm:text-5xl">
                                        {t.c('about.chiffres.text_12')}
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-white">
                                        {t.c('about.chiffres.text_13')}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        {t.c('about.chiffres.text_14')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section style={contactStyle} className="bg-[#181B20]/60 py-20">
                    <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
                        <div style={contactCardsStyle} className="relative overflow-hidden rounded-2xl border border-[#2E3440] bg-[#20242C] p-8 shadow-2xl sm:p-12">
                            <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-[#C5A059]/10 blur-3xl"></div>

                            <span className="hx-label rounded-full border border-current/20 bg-current/10 px-3 py-1 font-mono text-xs tracking-widest text-[#C5A059] uppercase">
                                {t.c('about.contact.text_01')}
                            </span>

                            <h2 className="mt-6 mb-4 text-2xl font-extrabold text-white sm:text-4xl">
                                {t.c('about.contact.text_02')}
                            </h2>

                            <p className="mx-auto mb-8 max-w-2xl text-sm text-gray-300 sm:text-base">
                                {t.c('about.contact.text_03')}
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
                                    {t.c('about.contact.text_04')}
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

// Photo d'un onglet RSE (modifiable dans /admin/texts › À propos › Engagement
// RSE), avec le chiffre clé et sa note affichés par-dessus. Même format que la
// photo de l'onglet Recyclage ; le cadre s'agrandit si le texte est long.
function TabPhoto({
    src,
    alt,
    figure,
    caption,
    noteTitle,
    note,
}: {
    src: string;
    alt: string;
    figure: ReactNode;
    caption: ReactNode;
    noteTitle: ReactNode;
    note: ReactNode;
}) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-[#2E3440] bg-[#181B20] lg:col-span-5">
            <img
                src={src}
                alt={alt}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/70 to-[#0F1115]/0"></div>
            <div className="relative flex aspect-4/3 flex-col justify-end gap-4 p-6">
                <div>
                    <p className="font-mono text-4xl font-extrabold text-[#C5A059]">
                        {figure}
                    </p>
                    <p className="mt-1 text-xs tracking-wider text-gray-200 uppercase">
                        {caption}
                    </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#0F1115]/75 p-3 text-xs text-gray-300 backdrop-blur-sm">
                    <span className="font-semibold text-white">
                        {noteTitle}
                    </span>{' '}
                    {note}
                </div>
            </div>
        </div>
    );
}
