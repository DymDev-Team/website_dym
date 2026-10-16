import { router } from '@inertiajs/react';
import { Building2, Download, Mail, Phone } from 'lucide-react';
import AdminPage from '@/components/admin/admin-page';
import DeleteButton from '@/components/admin/delete-button';
import QuoteStatusBadge from '@/components/admin/quote-status';
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
import { attachment, destroy, index, update } from '@/routes/admin/quotes';
import type { QuoteRequest, QuoteStatusOption } from '@/types/admin';

type Props = {
    quote: QuoteRequest;
    statuses: QuoteStatusOption[];
};

const dateFormat = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
});

function Detail({ label, value }: { label: string; value: string | null }) {
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">
                {value || (
                    <span className="font-normal text-muted-foreground">
                        Non précisé
                    </span>
                )}
            </p>
        </div>
    );
}

export default function QuoteShow({ quote, statuses }: Props) {
    const changeStatus = (status: string) => {
        router.visit(update(quote.id), {
            data: { status },
            preserveScroll: true,
        });
    };

    return (
        <AdminPage
            title={quote.name}
            description={`Demande reçue le ${dateFormat.format(new Date(quote.created_at))}`}
            actions={
                <DeleteButton
                    action={destroy.form(quote.id)}
                    label={`la demande de ${quote.name}`}
                    description="Cette action est définitive. La demande et sa pièce jointe seront supprimées."
                />
            }
        >
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <section className="space-y-5 rounded-xl border p-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Detail label="Activité" value={quote.activity} />
                        <Detail label="Délai souhaité" value={quote.deadline} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Description du projet
                        </p>
                        <p className="mt-1 whitespace-pre-line">
                            {quote.message}
                        </p>
                    </div>
                </section>

                <aside className="space-y-4">
                    <section className="space-y-3 rounded-xl border p-5">
                        {quote.company && (
                            <p className="flex items-center gap-3 text-sm">
                                <Building2 className="size-4 text-muted-foreground" />
                                {quote.company}
                            </p>
                        )}
                        <a
                            href={`mailto:${quote.email}`}
                            className="flex items-center gap-3 text-sm hover:underline"
                        >
                            <Mail className="size-4 text-muted-foreground" />
                            {quote.email}
                        </a>
                        <a
                            href={`tel:${quote.phone}`}
                            className="flex items-center gap-3 text-sm hover:underline"
                        >
                            <Phone className="size-4 text-muted-foreground" />
                            {quote.phone}
                        </a>
                        {quote.attachment_name && (
                            <>
                                <Button className="w-full" asChild>
                                    <a href={attachment(quote.id).url}>
                                        <Download />
                                        Télécharger la pièce jointe
                                    </a>
                                </Button>
                                <p className="truncate text-center text-xs text-muted-foreground">
                                    {quote.attachment_name}
                                </p>
                            </>
                        )}
                    </section>

                    <section className="space-y-3 rounded-xl border p-5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="status">Statut</Label>
                            <QuoteStatusBadge
                                status={quote.status}
                                statuses={statuses}
                            />
                        </div>
                        <Select
                            value={quote.status}
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

QuoteShow.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Demandes de devis', href: index() },
        { title: props.quote.name, href: '#' },
    ],
});
