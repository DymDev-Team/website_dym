import { Link } from '@inertiajs/react';
import { ExternalLink, FileText, Pencil } from 'lucide-react';
import AdminPage from '@/components/admin/admin-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes/admin';
import { edit, index } from '@/routes/admin/legal-pages';
import { show } from '@/routes/legal';

type Props = {
    pages: {
        slug: string;
        title: string;
        updated_at: string | null;
        incomplete: boolean;
    }[];
};

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });

export default function LegalPagesIndex({ pages }: Props) {
    return (
        <AdminPage
            title="Pages légales"
            description="Mentions légales, confidentialité et cookies, accessibles depuis le pied de page du site."
        >
            <div className="overflow-hidden rounded-xl border">
                <ul className="divide-y">
                    {pages.map((page) => (
                        <li
                            key={page.slug}
                            className="flex flex-wrap items-center gap-4 p-3 sm:px-4"
                        >
                            <div className="grid size-10 shrink-0 place-items-center rounded-md bg-muted">
                                <FileText className="size-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <Link
                                    href={edit(page.slug)}
                                    className="block truncate font-medium hover:underline"
                                >
                                    {page.title}
                                </Link>
                                <p className="truncate text-sm text-muted-foreground">
                                    /{page.slug}
                                    {page.updated_at &&
                                        ` · modifiée le ${dateFormat.format(new Date(page.updated_at))}`}
                                </p>
                            </div>
                            {page.incomplete ? (
                                <Badge variant="destructive">À compléter</Badge>
                            ) : (
                                <Badge variant="secondary">Complète</Badge>
                            )}
                            <div className="flex shrink-0 items-center">
                                <Button variant="ghost" size="icon" asChild>
                                    <a
                                        href={show(page.slug).url}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={`Voir ${page.title} sur le site`}
                                    >
                                        <ExternalLink />
                                    </a>
                                </Button>
                                <Button variant="ghost" size="icon" asChild>
                                    <Link
                                        href={edit(page.slug)}
                                        aria-label={`Modifier ${page.title}`}
                                    >
                                        <Pencil />
                                    </Link>
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <p className="max-w-2xl text-sm text-muted-foreground">
                Ces textes sont des modèles à faire relire. Les mentions
                «&nbsp;[à compléter]&nbsp;» doivent être remplacées par les
                informations de l’entreprise avant la mise en ligne.
            </p>
        </AdminPage>
    );
}

LegalPagesIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Pages légales', href: index() },
    ],
};
