import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({
    items,
    label,
}: {
    items: NavItem[];
    label?: string;
}) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            {label && (
                <SidebarGroupLabel className="hx-mono text-[9.5px] tracking-[0.14em] text-white/40 uppercase">
                    {label}
                </SidebarGroupLabel>
            )}
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl(
                                item.href,
                                undefined,
                                item.matchChildren,
                            )}
                            tooltip={{ children: item.title }}
                            className="text-sidebar-foreground/85 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-white data-[active=true]:shadow-[inset_2px_0_0_var(--color-dym)] [&>svg]:text-white/50 data-[active=true]:[&>svg]:text-dym"
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
