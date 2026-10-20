import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { useInView } from '@/components/site/use-in-view';
import { show } from '@/routes/posts';
import type { Activity, Paginated, Post, SiteSettings } from '@/types/admin';
import { useTexts, withDot } from '@/components/site/use-texts';

type Props = {
    posts: Paginated<Post>;
    categories: string[];
    category: string | null;
    activities: Pick<Activity, 'id' | 'title'>[];
    site: SiteSettings;
};

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' });

const delay = (d: number) => ({ '--d': `${d}s` }) as CSSProperties;

const listUrl = (category: string | null) => (category ? `/actualites?categorie=${encodeURIComponent(category)}` : '/actualites');

function Meta({ post }: { post: Post }) {
    return (
        <p className="hx-mono flex flex-wrap items-center gap-2 text-[10px] tracking-[0.1em] text-neutral-500 uppercase">
            <span className="size-[5px] bg-dym" aria-hidden /> {post.category}
            {post.published_at && (
                <>
                    <span className="text-neutral-300">/</span>
                    <time dateTime={post.published_at}>{dateFormat.format(new Date(post.published_at))}</time>
                </>
            )}
        </p>
    );
}

// Soulignement couleur DYM qui se dessine au survol de la carte.
function Underline({ children }: { children: string }) {
    return (
        <span className="bg-linear-to-r from-dym to-dym bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
            {children}
        </span>
    );
}

function PageLink({ url, dir }: { url: string | null; dir: 1 | -1 }) {
    const t = useTexts();
    const label = t(dir < 0 ? 'news.list.previous' : 'news.list.next');

    if (!url) {
        return <span className="w-[104px]" aria-hidden />;
    }

    return (
        <Link
            href={url}
            className="hx-mono hx-hair inline-flex w-[104px] items-center justify-center gap-2 border py-3 text-[10px] tracking-[0.1em] uppercase transition-colors hover:border-dym hover:bg-dym hover:text-white"
        >
            {dir < 0 && <ArrowLeft className="size-3.5" />}
            {label}
            {dir > 0 && <ArrowRight className="size-3.5" />}
        </Link>
    );
}

export default function ActualitesPage({ posts, categories, category, activities, site }: Props) {
    const [ref, inView] = useInView<HTMLElement>(0.05, false);
    const t = useTexts();

    // À la une : l'article le plus récent, en première page uniquement.
    const featured = posts.current_page === 1 ? posts.data[0] : undefined;
    const rest = featured ? posts.data.slice(1) : posts.data;

    return (
        <>
            <Head title={t('news.meta.title')}>
                <meta name="description" content={t('news.meta.description')} />
            </Head>

            <div className="bg-paper text-ink">
                <SiteHeader active="Actualités" />

                <section ref={ref} aria-labelledby="actualites-title" className={`hx-root px-5 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)] ${inView ? 'is-ready' : ''}`}>
                    <div className="mx-auto max-w-[1720px] pt-14 pb-16 lg:pt-16 lg:pb-24">
                        {/* En-tête */}
                        <div className="flex flex-wrap items-end justify-between gap-6 lg:pl-[clamp(22px,3vw,52px)]">
                            <div>
                                <div className="hx-mono hx-fade mb-5 flex items-center gap-3 text-[10px] tracking-[0.075em] text-neutral-500" style={delay(0.05)}>
                                    <span className="inline-block size-[5px] bg-dym" /> {t('news.header.eyebrow')}
                                </div>
                                <h1 id="actualites-title" className="font-display text-[clamp(40px,9vw,56px)] leading-[0.95] text-ink uppercase lg:text-[clamp(44px,3.8vw,68px)]">
                                    <span className="hx-line -mt-[0.18em] -mb-[0.07em] block overflow-hidden pt-[0.18em] pb-[0.07em]">
                                        <span style={delay(0.12)}>
                                            {withDot(t('news.header.title'))}
                                        </span>
                                    </span>
                                </h1>
                            </div>
                            <p className="hx-fade max-w-[440px] text-[15px] leading-[1.7] text-neutral-600" style={delay(0.25)}>
                                {t('news.header.text')}
                            </p>
                        </div>

                        {/* Filtres par catégorie */}
                        {categories.length > 1 && (
                            <nav aria-label="Catégories" className="hx-fade mt-10 flex flex-wrap gap-2 lg:pl-[clamp(22px,3vw,52px)]" style={delay(0.3)}>
                                {[null, ...categories].map((c) => (
                                    <Link
                                        key={c ?? 'all'}
                                        href={listUrl(c)}
                                        preserveScroll
                                        aria-current={c === category ? 'page' : undefined}
                                        className={`hx-mono border px-4 py-2.5 text-[10px] tracking-[0.1em] uppercase transition-colors ${
                                            c === category ? 'border-dym bg-dym text-white' : 'border-black/15 text-neutral-600 hover:border-ink hover:text-ink'
                                        }`}
                                    >
                                        {c ?? t('news.list.all')}
                                    </Link>
                                ))}
                            </nav>
                        )}

                        {posts.data.length === 0 && <p className="mt-16 text-neutral-500 lg:pl-[clamp(22px,3vw,52px)]">{t('news.list.empty')}</p>}

                        {/* À la une */}
                        {featured && (
                            <article className="hx-fade hx-hair group mt-10 border-y py-8" style={delay(0.35)}>
                                <Link href={show(featured.slug)} className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-14">
                                    <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
                                        <img src={featured.image_url ?? undefined} alt="" className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                                    </div>
                                    <div className="lg:pr-[clamp(22px,3vw,52px)]">
                                        <span className="hx-mono text-[10px] text-dym">{t('news.list.featured')}</span>
                                        <div className="mt-4">
                                            <Meta post={featured} />
                                        </div>
                                        <h2 className="mt-3 font-display text-[clamp(28px,4vw,46px)] leading-[1] uppercase">
                                            <Underline>{featured.title}</Underline>
                                        </h2>
                                        {featured.excerpt && <p className="mt-5 line-clamp-4 text-[15px] leading-[1.7] text-neutral-600">{featured.excerpt}</p>}
                                        <span className="hx-mono mt-6 inline-flex items-center gap-2 text-[10px] tracking-[0.1em] text-dym uppercase">
                                            {t('news.list.read_article')}
                                            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                                        </span>
                                    </div>
                                </Link>
                            </article>
                        )}

                        {/* Grille */}
                        {rest.length > 0 && (
                            <div className={`grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 ${featured ? 'mt-12' : 'mt-10'}`}>
                                {rest.map((p, i) => (
                                    <article key={p.id} className="hx-fade group" style={delay(0.4 + Math.min(i, 5) * 0.06)}>
                                        <Link href={show(p.slug)} className="block">
                                            <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                                                <img src={p.image_url ?? undefined} alt="" loading="lazy" className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                                            </div>
                                            <div className="mt-5">
                                                <Meta post={p} />
                                            </div>
                                            <h3 className="mt-2 text-[18px] leading-snug font-semibold text-ink">
                                                <Underline>{p.title}</Underline>
                                            </h3>
                                            {p.excerpt && <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-neutral-600">{p.excerpt}</p>}
                                            <span className="hx-mono mt-4 inline-flex items-center gap-2 text-[10px] tracking-[0.1em] text-dym uppercase">
                                                {t('news.list.read_more')}
                                                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                                            </span>
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {posts.last_page > 1 && (
                            <nav aria-label="Pagination" className="hx-hair mt-16 flex items-center justify-between border-t pt-6">
                                <PageLink url={posts.prev_page_url} dir={-1} />
                                <span className="hx-mono text-[10px] tracking-[0.1em] text-neutral-500">
                                    {t('news.list.page')} {posts.current_page} / {posts.last_page}
                                </span>
                                <PageLink url={posts.next_page_url} dir={1} />
                            </nav>
                        )}
                    </div>
                </section>

                <SiteFooter activities={activities} site={site} />
            </div>
        </>
    );
}
