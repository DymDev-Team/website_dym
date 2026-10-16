import AdminPage from '@/components/admin/admin-page';
import ContentTable, {
    publishedStatus,
} from '@/components/admin/content-table';
import { dashboard } from '@/routes/admin';
import { create, destroy, edit, index } from '@/routes/admin/equipment';
import type { Equipment } from '@/types/admin';

export default function EquipmentIndex({
    equipment,
}: {
    equipment: Equipment[];
}) {
    return (
        <AdminPage
            title="Équipements"
            description="Les machines présentées dans la section « Une technologie au service de la qualité »."
            createHref={create()}
        >
            <ContentTable
                empty="Aucun équipement pour le moment."
                rows={equipment.map((e) => ({
                    id: e.id,
                    title: e.name,
                    subtitle: e.description,
                    imageUrl: e.image_url,
                    position: e.position,
                    status: publishedStatus(e.is_published),
                    editHref: edit(e.id),
                    destroyAction: destroy.form(e.id),
                }))}
            />
        </AdminPage>
    );
}

EquipmentIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Équipements', href: index() },
    ],
};
