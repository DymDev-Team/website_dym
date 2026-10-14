import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Briefcase,
    Factory,
    FolderGit2,
    Gauge,
    Hammer,
    Handshake,
    ImageIcon,
    Inbox,
    LayoutGrid,
    MessageSquareQuote,
    Newspaper,
    Scale,
    Settings,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const page = usePage();
    const dashboardUrl = page.props.currentTeam
        ? dashboard(page.props.currentTeam.slug)
        : '/';

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
    ];

    const adminNavItems: NavItem[] = [
        { title: 'Vue d’ensemble', href: admin.dashboard(), icon: Gauge },
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
            title: 'Témoignages',
            href: admin.testimonials.index(),
            icon: MessageSquareQuote,
            matchChildren: true,
        },
        {
            title: 'Offres d’emploi',
            href: admin.jobOffers.index(),
            icon: Briefcase,
            matchChildren: true,
        },
        {
            title: 'Candidatures',
            href: admin.applications.index(),
            icon: Inbox,
            matchChildren: true,
        },
        {
            title: 'Pages légales',
            href: admin.legalPages.index(),
            icon: Scale,
            matchChildren: true,
        },
        { title: 'Paramètres', href: admin.settings.edit(), icon: Settings },
        { title: 'Utilisateurs', href: admin.users.index(), icon: Users },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: FolderGit2,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <TeamSwitcher />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                {page.props.auth.user?.is_admin === true && (
                    <NavMain items={adminNavItems} label="Administration" />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
