import AdminPage from '@/components/admin/admin-page';
import ContentTable, {
    publishedStatus,
} from '@/components/admin/content-table';
import { dashboard } from '@/routes/admin';
import { create, destroy, edit, index } from '@/routes/admin/partners';
import type { Partner } from '@/types/admin';

export default function PartnersIndex({ partners }: { partners: Partner[] }) {
    return (
        <AdminPage
            title="Partenaires"
            description="Les logos qui défilent dans le bandeau « Nos partenaires »."
            createHref={create()}
        >
            <ContentTable
                empty="Aucun partenaire pour le moment."
                containImages
                rows={partners.map((p) => ({
                    id: p.id,
                    title: p.name,
                    subtitle: p.website_url,
                    imageUrl: p.logo_url,
                    position: p.position,
                    status: publishedStatus(p.is_published),
                    editHref: edit(p.id),
                    destroyAction: destroy.form(p.id),
                }))}
            />
        </AdminPage>
    );
}

PartnersIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Partenaires', href: index() },
    ],
};
