import { Badge } from '@/components/ui/badge';
import type { QuoteStatus, QuoteStatusOption } from '@/types/admin';

const variants: Record<
    QuoteStatus,
    'default' | 'secondary' | 'outline' | 'destructive'
> = {
    new: 'default',
    in_progress: 'secondary',
    quoted: 'secondary',
    won: 'default',
    lost: 'outline',
};

export default function QuoteStatusBadge({
    status,
    statuses,
}: {
    status: QuoteStatus;
    statuses: QuoteStatusOption[];
}) {
    return (
        <Badge variant={variants[status]}>
            {statuses.find((s) => s.value === status)?.label ?? status}
        </Badge>
    );
}
