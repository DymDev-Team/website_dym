import { Head, usePage } from '@inertiajs/react';
import { ArrowUpRight, Lock } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { dashboard, home } from '@/routes';

// Tableau de bord des comptes non administrateurs (les administrateurs sont
// redirigés vers la vue d'ensemble par DashboardController).
export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Tableau de bord" />

            <div className="flex h-full flex-1 flex-col p-4 md:p-6">
                <Heading
                    title={`Bonjour, ${auth.user.name}`}
                    description="Bienvenue dans l’espace DYM Manufacture."
                />

                <div className="max-w-2xl border bg-card p-6 md:p-8">
                    <div className="flex items-start gap-4">
                        <span className="grid size-10 shrink-0 place-items-center bg-dym/10 text-dym">
                            <Lock className="size-5" />
                        </span>
                        <div>
                            <h3 className="font-semibold">
                                Accès à l’administration non activé
                            </h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                                Votre compte est bien créé, mais il n’a pas
                                encore les droits pour gérer le contenu du site.
                                Demandez à un administrateur DYM de vous donner
                                l’accès.
                            </p>
                            <Button asChild variant="outline" className="mt-5">
                                <a href={home().url}>
                                    Voir le site <ArrowUpRight />
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Tableau de bord',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
    ],
});
