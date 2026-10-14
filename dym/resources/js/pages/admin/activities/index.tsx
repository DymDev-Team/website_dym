import AdminPage from '@/components/admin/admin-page';
import ContentTable, {
    publishedStatus,
} from '@/components/admin/content-table';
import { dashboard } from '@/routes/admin';
import { create, destroy, edit, index } from '@/routes/admin/activities';
import type { Activity } from '@/types/admin';

export default function ActivitiesIndex({
    activities,
}: {
    activities: Activity[];
}) {
    return (
        <AdminPage
            title="Activités"
            description="Les métiers présentés dans la section « Nos activités » et le pied de page."
            createHref={create()}
        >
            <ContentTable
                empty="Aucune activité pour le moment."
                rows={activities.map((a) => ({
                    id: a.id,
                    title: a.title,
                    subtitle: a.description,
                    imageUrl: a.image_url,
                    position: a.position,
                    status: publishedStatus(a.is_published),
                    editHref: edit(a.id),
                    destroyAction: destroy.form(a.id),
                }))}
            />
        </AdminPage>
    );
}

ActivitiesIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Activités', href: index() },
    ],
};
