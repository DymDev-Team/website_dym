import { usePage } from '@inertiajs/react';
import type { SiteSettings } from '@/types/admin';

export function useSectionColor(section: string, page = '') {
    const settings = usePage<{ siteSettings?: SiteSettings }>().props.siteSettings;
    const key = page ? `${page}_${section}` : section;
    const color = settings?.section_colors?.[key];

    return color ? { backgroundColor: color } : undefined;
}
