import { router } from '@inertiajs/react';
import { Download, Mail, Phone } from 'lucide-react';
import AdminPage from '@/components/admin/admin-page';
import ApplicationStatusBadge from '@/components/admin/application-status';
import DeleteButton from '@/components/admin/delete-button';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes/admin';
import { cv, destroy, index, update } from '@/routes/admin/applications';
import { edit as editOffer } from '@/routes/admin/job-offers';
import type { JobApplication, StatusOption } from '@/types/admin';

type Props = {
    application: JobApplication;
    statuses: StatusOption[];
};

const dateFormat = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
});

export default function ApplicationShow({ application, statuses }: Props) {
    const changeStatus = (status: string) => {
        router.visit(update(application.id), {
            data: { status },
            preserveScroll: true,
        });
    };

    return (
        <AdminPage
            title={application.name}
            description={`Reçue le ${dateFormat.format(new Date(application.created_at))}`}
            actions={
                <DeleteButton
                    action={destroy.form(application.id)}
                    label={`la candidature de ${application.name}`}
                    description="Cette action est définitive. La candidature et le CV seront supprimés."
                />
            }
        >
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                    <section className="rounded-xl border p-5">
                        <p className="text-sm text-muted-foreground">Poste</p>
                        {application.job_offer ? (
                            <a
                                href={editOffer(application.job_offer.slug).url}
                                className="font-medium hover:underline"
                            >
                                {application.job_offer.title}
                            </a>
                        ) : (
                            <p className="font-medium">Candidature spontanée</p>
                        )}

                        <p className="mt-5 text-sm text-muted-foreground">
                            Message
                        </p>
                        <p className="mt-1 whitespace-pre-line">
                            {application.message || (
                                <span className="text-muted-foreground">
                                    Aucun message.
                                </span>
                            )}
                        </p>
                    </section>
                </div>

                <aside className="space-y-4">
                    <section className="space-y-3 rounded-xl border p-5">
                        <a
                            href={`mailto:${application.email}`}
                            className="flex items-center gap-3 text-sm hover:underline"
                        >
                            <Mail className="size-4 text-muted-foreground" />
                            {application.email}
                        </a>
                        {application.phone && (
                            <a
                                href={`tel:${application.phone}`}
                                className="flex items-center gap-3 text-sm hover:underline"
                            >
                                <Phone className="size-4 text-muted-foreground" />
                                {application.phone}
                            </a>
                        )}
                        <Button className="w-full" asChild>
                            <a href={cv(application.id).url}>
                                <Download />
                                Télécharger le CV
                            </a>
                        </Button>
                        <p className="truncate text-center text-xs text-muted-foreground">
                            {application.cv_name}
                        </p>
                    </section>

                    <section className="space-y-3 rounded-xl border p-5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="status">Statut</Label>
                            <ApplicationStatusBadge
                                status={application.status}
                                statuses={statuses}
                            />
                        </div>
                        <Select
                            value={application.status}
                            onValueChange={changeStatus}
                        >
                            <SelectTrigger id="status" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statuses.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </section>
                </aside>
            </div>
        </AdminPage>
    );
}

ApplicationShow.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Candidatures', href: index() },
        { title: props.application.name, href: '#' },
    ],
});
