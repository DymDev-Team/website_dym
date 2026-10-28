import type { CSSProperties } from 'react';
import { usePage } from '@inertiajs/react';
import type { SiteSettings } from '@/types/admin';

export function useSectionColor(section: string, page = '') {
    const settings = usePage<{ siteSettings?: SiteSettings }>().props.siteSettings;
    const key = page ? `${page}_${section}` : section;
    const color = settings?.section_colors?.[key];

    const labelColor = settings?.section_label_colors?.[key];

    return {
        backgroundColor: color,
        '--section-label': labelColor || undefined,
    } as CSSProperties;
}
