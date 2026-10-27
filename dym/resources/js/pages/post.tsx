import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { show } from '@/routes/posts';
import type { Activity, Post, SiteSettings } from '@/types/admin';
import { useTexts, withDot } from '@/components/site/use-texts';
import { useSectionColor } from '@/components/site/use-section-color';

type Props = {
    post: Post;
    related: Post[];
    activities: Pick<Activity, 'id' | 'title'>[];
    site: SiteSettings;
};

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' });

export default function PostPage({ post, related, activities, site }: Props) {
    const t = useTexts();
    const contentStyle = useSectionColor('post_page_content');
    const relatedStyle = useSectionColor('post_page_related');
    const paragraphs = (post.body ?? '')
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);

    return (
        <>
            <Head title={t('news.post.meta_title').replace('{titre}', post.title)}>
                {post.excerpt && (
                    <meta name="description" content={post.excerpt} />
                )}
            </Head>

            <div className="bg-paper text-ink">
                <SiteHeader active="Actualités" />

                <article style={contentStyle} className="px-5 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)]">
                    <div className="mx-auto max-w-[860px] py-12 lg:py-16">
                        <a
                            href="/actualites"
                            className="hx-mono inline-flex items-center gap-2 text-[10px] tracking-[0.1em] text-neutral-500 uppercase transition-colors hover:text-dym"
                        >
                            <ArrowLeft className="size-3.5" />{' '}
                            {t.c('news.post.back')}
                        </a>

                        <p className="hx-mono hx-label mt-8 flex items-center gap-3 text-[10px] tracking-[0.1em] text-neutral-500 uppercase">
                            <span className="size-[5px] bg-dym" aria-hidden />{' '}
                            {post.category}
                            {post.published_at && (
                                <>
                                    <span className="text-neutral-300">/</span>
                                    <time dateTime={post.published_at}>
                                        {dateFormat.format(
                                            new Date(post.published_at),
                                        )}
                                    </time>
                                </>
                            )}
                        </p>

                        <h1 className="mt-4 font-display text-[clamp(34px,6vw,58px)] leading-[0.98] uppercase">
                            {post.title}
                            <span className="text-dym">.</span>
                        </h1>

                        {post.excerpt && (
                            <p className="mt-6 text-lg leading-relaxed text-neutral-600">
                                {post.excerpt}
                            </p>
                        )}
                    </div>

                    {post.image_url && (
                        <div className="mx-auto max-w-[1200px] overflow-hidden bg-neutral-100">
                            <img
                                src={post.image_url}
                                alt=""
                                className="max-h-[640px] w-full object-cover"
                            />
                        </div>
                    )}

                    {paragraphs.length > 0 && (
                        <div className="mx-auto max-w-[720px] space-y-5 py-12 text-[16px] leading-[1.8] text-neutral-700 lg:py-16">
                            {paragraphs.map((p, i) => (
                                <p key={i} className="whitespace-pre-line">
                                    {p}
                                </p>
                            ))}
                        </div>
                    )}
                </article>

                {related.length > 0 && (
                    <section style={relatedStyle} className="hx-hair border-t px-5 sm:px-8 lg:px-[clamp(24px,3.15vw,58px)]">
                        <div className="mx-auto max-w-[1200px] py-12 lg:py-16">
                            <h2 className="font-display text-[clamp(28px,4vw,40px)] uppercase">
                                {t.c('news.post.related', withDot(t('news.post.related')))}
                            </h2>
                            <div className="mt-8 grid gap-8 sm:grid-cols-3">
                                {related.map((r) => (
                                    <Link
                                        key={r.id}
                                        href={show(r.slug)}
                                        className="group block"
                                    >
                                        <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                                            <img
                                                src={r.image_url ?? undefined}
                                                alt=""
                                                loading="lazy"
                                                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        </div>
                                        <p className="hx-mono mt-4 text-[10px] tracking-[0.1em] text-neutral-500 uppercase">
                                            {r.category}
                                        </p>
                                        <h3 className="mt-1.5 leading-snug font-semibold">
                                            {r.title}
                                        </h3>
                                        <span className="hx-mono mt-3 inline-flex items-center gap-2 text-[10px] tracking-[0.1em] text-dym uppercase">
                                            {t.c('news.post.read_more')}{' '}
                                            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <SiteFooter activities={activities} site={site} />
            </div>
        </>
    );
}
