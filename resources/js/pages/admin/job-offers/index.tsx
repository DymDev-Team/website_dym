import AdminPage from '@/components/admin/admin-page';
import ContentTable from '@/components/admin/content-table';
import { dashboard } from '@/routes/admin';
import { create, destroy, edit, index } from '@/routes/admin/job-offers';
import type { JobOffer } from '@/types/admin';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });

function offerStatus(offer: JobOffer) {
    if (!offer.is_published) {
        return { label: 'Masquée', visible: false };
    }

    if (
        offer.closes_at &&
        new Date(`${offer.closes_at}T23:59:59`) < new Date()
    ) {
        return { label: 'Clôturée', visible: false };
    }

    return {
        label: offer.closes_at
            ? `Ouverte · jusqu’au ${dateFormat.format(new Date(offer.closes_at))}`
            : 'Ouverte',
        visible: true,
    };
}

export default function JobOffersIndex({ offers }: { offers: JobOffer[] }) {
    return (
        <AdminPage
            title="Offres d’emploi"
            description="Les postes publiés sur la page Carrière. Une offre clôturée ou masquée n’accepte plus de candidatures."
            createHref={create()}
            createLabel="Publier une offre"
        >
            <ContentTable
                empty="Aucune offre pour le moment. Les candidats peuvent tout de même envoyer une candidature spontanée."
                deleteDescription="L’offre disparaît du site. Les candidatures reçues sont conservées comme candidatures spontanées."
                rows={offers.map((o) => ({
                    id: o.id,
                    title: o.title,
                    subtitle: [
                        o.contract_type,
                        o.location,
                        `${o.applications_count ?? 0} candidature${(o.applications_count ?? 0) > 1 ? 's' : ''}`,
                    ].join(' · '),
                    status: offerStatus(o),
                    editHref: edit(o.slug),
                    destroyAction: destroy.form(o.slug),
                }))}
            />
        </AdminPage>
    );
}

JobOffersIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Offres d’emploi', href: index() },
    ],
};
