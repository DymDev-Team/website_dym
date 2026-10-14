import type { Post } from '@/types/admin';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });

export function postStatus(post: Post) {
    if (!post.published_at) {
        return { label: 'Brouillon', visible: false };
    }

    const date = new Date(post.published_at);

    return date > new Date()
        ? { label: `Programmé · ${dateFormat.format(date)}`, visible: false }
        : { label: `Publié · ${dateFormat.format(date)}`, visible: true };
}
