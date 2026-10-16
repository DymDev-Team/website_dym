import { Link, usePage } from '@inertiajs/react';
import {
    Briefcase,
    Calculator,
    ExternalLink,
    Factory,
    Gauge,
    Hammer,
    Handshake,
    Tag,
    ImageIcon,
    Inbox,
    LayoutGrid,
    MessageSquareQuote,
    Newspaper,
    Scale,
    Settings,
    Type,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard, home } from '@/routes';
import admin from '@/routes/admin';
import type { NavItem } from '@/types';

const overviewItems: NavItem[] = [
    { title: 'Vue d’ensemble', href: admin.dashboard(), icon: Gauge },
];

const contentItems: NavItem[] = [
    { title: 'Textes du site', href: admin.texts.edit(), icon: Type },
    {
        title: 'Actualités',
        href: admin.posts.index(),
        icon: Newspaper,
        matchChildren: true,
    },
    {
        title: 'Réalisations',
        href: admin.projects.index(),
        icon: ImageIcon,
        matchChildren: true,
    },
    {
        title: 'Activités',
        href: admin.activities.index(),
        icon: Hammer,
        matchChildren: true,
    },
    {
        title: 'Équipements',
        href: admin.equipment.index(),
        icon: Factory,
        matchChildren: true,
    },
    {
        title: 'Partenaires',
        href: admin.partners.index(),
        icon: Handshake,
        matchChildren: true,
    },
    {
        title: 'Marques',
        href: admin.brands.index(),
        icon: Tag,
        matchChildren: true,
    },
    {
        title: 'Témoignages',
        href: admin.testimonials.index(),
        icon: MessageSquareQuote,
        matchChildren: true,
    },
];

const requestItems: NavItem[] = [
    {
        title: 'Demandes de devis',
        href: admin.quotes.index(),
        icon: Calculator,
        matchChildren: true,
    },
    {
        title: 'Candidatures',
        href: admin.applications.index(),
        icon: Inbox,
        matchChildren: true,
    },
    {
        title: 'Offres d’emploi',
        href: admin.jobOffers.index(),
        icon: Briefcase,
        matchChildren: true,
    },
];

const configItems: NavItem[] = [
    {
        title: 'Pages légales',
        href: admin.legalPages.index(),
        icon: Scale,
        matchChildren: true,
    },
    { title: 'Paramètres', href: admin.settings.edit(), icon: Settings },
    { title: 'Utilisateurs', href: admin.users.index(), icon: Users },
];

const footerItems: NavItem[] = [
    { title: 'Voir le site', href: home(), icon: ExternalLink },
];

export function AppSidebar() {
    const page = usePage();
    const isAdmin = page.props.auth.user?.is_admin === true;
    const teamDashboard = page.props.currentTeam
        ? dashboard(page.props.currentTeam.slug)
        : home();
    const homeUrl = isAdmin ? admin.dashboard() : teamDashboard;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="pt-4 pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="hover:bg-transparent active:bg-transparent"
                        >
                            <Link href={homeUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-1">
                {isAdmin ? (
                    <>
                        <NavMain items={overviewItems} />
                        <NavMain items={contentItems} label="Contenu du site" />
                        <NavMain items={requestItems} label="Demandes" />
                        <NavMain items={configItems} label="Configuration" />
                    </>
                ) : (
                    <NavMain
                        items={[
                            {
                                title: 'Tableau de bord',
                                href: teamDashboard,
                                icon: LayoutGrid,
                            },
                        ]}
                    />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerItems} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
