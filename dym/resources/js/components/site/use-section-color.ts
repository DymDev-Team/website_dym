import { usePage } from '@inertiajs/react';
import type { SiteSettings } from '@/types/admin';

export function useSectionColor(section: string) {
    const settings = usePage<{ siteSettings?: SiteSettings }>().props.siteSettings;
    const color = settings?.section_colors?.[section];

    return color ? { backgroundColor: color } : undefined;
}
