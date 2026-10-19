import AdminPage from '@/components/admin/admin-page';
import ContentTable, {
    publishedStatus,
} from '@/components/admin/content-table';
import { dashboard } from '@/routes/admin';
import { create, destroy, edit, index } from '@/routes/admin/testimonials';
import type { Testimonial } from '@/types/admin';

export default function TestimonialsIndex({
    testimonials,
}: {
    testimonials: Testimonial[];
}) {
    return (
        <AdminPage
            title="Témoignages"
            description="Les avis clients de la section « Témoignages ». Publiez-les uniquement avec l’accord du client."
            createHref={create()}
        >
            <ContentTable
                empty="Aucun témoignage pour le moment."
                rows={testimonials.map((t) => ({
                    id: t.id,
                    title: t.author,
                    subtitle: `« ${t.quote} »`,
                    imageUrl: t.image_url,
                    position: t.position,
                    status: publishedStatus(t.is_published),
                    editHref: edit(t.id),
                    destroyAction: destroy.form(t.id),
                }))}
            />
        </AdminPage>
    );
}

TestimonialsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Témoignages', href: index() },
    ],
};
