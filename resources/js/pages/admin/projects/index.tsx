import AdminPage from '@/components/admin/admin-page';
import ContentTable, {
    publishedStatus,
} from '@/components/admin/content-table';
import { dashboard } from '@/routes/admin';
import { create, destroy, edit, index } from '@/routes/admin/projects';
import type { Project } from '@/types/admin';

export default function ProjectsIndex({ projects }: { projects: Project[] }) {
    return (
        <AdminPage
            title="Réalisations"
            description="Les projets affichés dans le carrousel « Des projets concrets »."
            createHref={create()}
        >
            <ContentTable
                empty="Aucune réalisation pour le moment."
                rows={projects.map((p) => ({
                    id: p.id,
                    title: p.title,
                    subtitle: p.category,
                    imageUrl: p.image_url,
                    position: p.position,
                    status: publishedStatus(p.is_published),
                    editHref: edit(p.id),
                    destroyAction: destroy.form(p.id),
                }))}
            />
        </AdminPage>
    );
}

ProjectsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Réalisations', href: index() },
    ],
};
