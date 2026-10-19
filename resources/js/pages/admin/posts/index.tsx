import { Form, Link } from '@inertiajs/react';
import { Search } from 'lucide-react';
import AdminPage from '@/components/admin/admin-page';
import ContentTable from '@/components/admin/content-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes/admin';
import { postStatus } from '@/components/admin/post-status';
import { create, destroy, edit, index } from '@/routes/admin/posts';
import type { Paginated, Post } from '@/types/admin';

type Props = {
    posts: Paginated<Post>;
    filters: { search: string };
};

export default function PostsIndex({ posts, filters }: Props) {
    return (
        <AdminPage
            title="Actualités"
            description="Articles affichés dans « Nos actualités » et consultables sur leur propre page."
            createHref={create()}
            createLabel="Rédiger"
        >
            <Form {...index.form()} className="flex max-w-md gap-2">
                <Input
                    name="search"
                    type="search"
                    placeholder="Rechercher un titre…"
                    defaultValue={filters.search}
                />
                <Button
                    type="submit"
                    variant="outline"
                    size="icon"
                    aria-label="Rechercher"
                >
                    <Search />
                </Button>
            </Form>

            <ContentTable
                empty={
                    filters.search
                        ? 'Aucune actualité ne correspond à cette recherche.'
                        : 'Aucune actualité pour le moment.'
                }
                rows={posts.data.map((p) => ({
                    id: p.id,
                    title: p.title,
                    subtitle: p.category,
                    imageUrl: p.image_url,
                    status: postStatus(p),
                    editHref: edit(p.slug),
                    destroyAction: destroy.form(p.slug),
                }))}
            />

            {posts.last_page > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Page {posts.current_page} sur {posts.last_page} ·{' '}
                        {posts.total} actualités
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            disabled={!posts.prev_page_url}
                        >
                            {posts.prev_page_url ? (
                                <Link href={posts.prev_page_url}>
                                    Précédent
                                </Link>
                            ) : (
                                <span>Précédent</span>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            disabled={!posts.next_page_url}
                        >
                            {posts.next_page_url ? (
                                <Link href={posts.next_page_url}>Suivant</Link>
                            ) : (
                                <span>Suivant</span>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </AdminPage>
    );
}

PostsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Actualités', href: index() },
    ],
};
