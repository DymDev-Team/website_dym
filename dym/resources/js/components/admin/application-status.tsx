import { Badge } from '@/components/ui/badge';
import type { ApplicationStatus, StatusOption } from '@/types/admin';

const variants: Record<
    ApplicationStatus,
    'default' | 'secondary' | 'outline' | 'destructive'
> = {
    new: 'default',
    reviewing: 'secondary',
    interview: 'secondary',
    rejected: 'outline',
    hired: 'default',
};

export default function ApplicationStatusBadge({
    status,
    statuses,
}: {
    status: ApplicationStatus;
    statuses: StatusOption[];
}) {
    return (
        <Badge variant={variants[status]}>
            {statuses.find((s) => s.value === status)?.label ?? status}
        </Badge>
    );
}
