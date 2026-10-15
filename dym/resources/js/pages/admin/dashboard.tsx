import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import {
    Calculator,
    ExternalLink,
    Factory,
    Handshake,
    Hammer,
    ImageIcon,
    Inbox,
    MessageSquareQuote,
    Newspaper,
    PenLine,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AdminPage from '@/components/admin/admin-page';
import { postStatus } from '@/components/admin/post-status';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';
import { dashboard } from '@/routes/admin';
import { index as activities } from '@/routes/admin/activities';
import { index as applications } from '@/routes/admin/applications';
import { index as equipment } from '@/routes/admin/equipment';
import { index as partners } from '@/routes/admin/partners';
import {
    create as createPost,
    edit as editPost,
    index as posts,
} from '@/routes/admin/posts';
import { index as projects } from '@/routes/admin/projects';
import { index as quotes } from '@/routes/admin/quotes';
import { index as testimonials } from '@/routes/admin/testimonials';
import { index as users } from '@/routes/admin/users';
import type { Post } from '@/types/admin';

type Count = { total: number; published: number };

type Props = {
    stats: {
        activities: Count;
        projects: Count;
        equipment: Count;
        partners: Count;
        testimonials: Count;
        posts: Count;
        applications: { total: number; new: number; openOffers: number };
        quotes: { total: number; new: number };
        users: { total: number; admins: number };
    };
    latestPosts: Post[];
};

function StatCard({
    title,
    icon: Icon,
    href,
    value,
    detail,
}: {
    title: string;
    icon: LucideIcon;
    href: NonNullable<InertiaLinkProps['href']>;
    value: number;
    detail: string;
}) {
    return (
        <Link
            href={href}
            className="group rounded-xl border p-4 transition-colors hover:border-foreground/20 hover:bg-muted/40"
        >
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                {title}
                <Icon className="size-4" />
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </Link>
    );
}

const visible = (c: Count) =>
    c.total === c.published
        ? 'Tous visibles'
        : `${c.published} visibles sur le site`;

export default function AdminDashboard({ stats, latestPosts }: Props) {
    return (
        <AdminPage
            title="Administration du site"
            description="Gérez le contenu affiché sur la page d’accueil de DYM Manufacture."
            actions={
                <Button variant="outline" asChild>
                    <a href={home().url} target="_blank" rel="noreferrer">
                        <ExternalLink />
                        Voir le site
                    </a>
                </Button>
            }
        >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Demandes de devis"
                    icon={Calculator}
                    href={quotes()}
                    value={stats.quotes.new}
                    detail={`nouvelles · ${stats.quotes.total} au total`}
                />
                <StatCard
                    title="Candidatures"
                    icon={Inbox}
                    href={applications()}
                    value={stats.applications.new}
                    detail={`nouvelles · ${stats.applications.total} au total · ${stats.applications.openOffers} offre(s) ouverte(s)`}
                />
                <StatCard
                    title="Actualités"
                    icon={Newspaper}
                    href={posts()}
                    value={stats.posts.total}
                    detail={`${stats.posts.published} publiées`}
                />
                <StatCard
                    title="Réalisations"
                    icon={ImageIcon}
                    href={projects()}
                    value={stats.projects.total}
                    detail={visible(stats.projects)}
                />
                <StatCard
                    title="Activités"
                    icon={Hammer}
                    href={activities()}
                    value={stats.activities.total}
                    detail={visible(stats.activities)}
                />
                <StatCard
                    title="Équipements"
                    icon={Factory}
                    href={equipment()}
                    value={stats.equipment.total}
                    detail={visible(stats.equipment)}
                />
                <StatCard
                    title="Partenaires"
                    icon={Handshake}
                    href={partners()}
                    value={stats.partners.total}
                    detail={visible(stats.partners)}
                />
                <StatCard
                    title="Témoignages"
                    icon={MessageSquareQuote}
                    href={testimonials()}
                    value={stats.testimonials.total}
                    detail={visible(stats.testimonials)}
                />
                <StatCard
                    title="Utilisateurs"
                    icon={Users}
                    href={users()}
                    value={stats.users.total}
                    detail={`${stats.users.admins} administrateurs`}
                />
            </div>

            <section className="rounded-xl border">
                <div className="flex items-center justify-between border-b p-4">
                    <h3 className="font-medium">
                        Dernières actualités modifiées
                    </h3>
                    <Button size="sm" asChild>
                        <Link href={createPost()}>
                            <PenLine />
                            Rédiger
                        </Link>
                    </Button>
                </div>
                {latestPosts.length === 0 ? (
                    <p className="p-6 text-sm text-muted-foreground">
                        Aucune actualité pour le moment.
                    </p>
                ) : (
                    <ul className="divide-y">
                        {latestPosts.map((post) => {
                            const status = postStatus(post);

                            return (
                                <li key={post.id}>
                                    <Link
                                        href={editPost(post.slug)}
                                        className="flex items-center gap-4 p-4 hover:bg-muted/40"
                                    >
                                        <span className="min-w-0 flex-1 truncate">
                                            {post.title}
                                        </span>
                                        <Badge
                                            variant={
                                                status.visible
                                                    ? 'secondary'
                                                    : 'outline'
                                            }
                                        >
                                            {status.label}
                                        </Badge>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </AdminPage>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Admin', href: dashboard() }],
};
