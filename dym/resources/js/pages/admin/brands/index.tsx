import AdminPage from '@/components/admin/admin-page';
import ContentTable, {
    publishedStatus,
} from '@/components/admin/content-table';
import { dashboard } from '@/routes/admin';
import { create, destroy, edit, index } from '@/routes/admin/brands';
import type { Brand } from '@/types/admin';

export default function BrandsIndex({ brands }: { brands: Brand[] }) {
    return (
        <AdminPage
            title="Marques"
            description="Les marques affichées sur la page « Nos marques »."
            createHref={create()}
        >
            <ContentTable
                empty="Aucune marque pour le moment."
                containImages
                rows={brands.map((p) => ({
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

BrandsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Marques', href: index() },
    ],
};
