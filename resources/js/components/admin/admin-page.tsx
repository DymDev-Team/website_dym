import { Head, Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';

type Props = {
    title: string;
    description?: string;
    createHref?: NonNullable<InertiaLinkProps['href']>;
    createLabel?: string;
    actions?: ReactNode;
    children: ReactNode;
};

export default function AdminPage({
    title,
    description,
    createHref,
    createLabel = 'Ajouter',
    actions,
    children,
}: Props) {
    return (
        <>
            <Head title={title} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading title={title} description={description} />

                    <div className="flex items-center gap-2">
                        {actions}
                        {createHref && (
                            <Button asChild>
                                <Link href={createHref}>
                                    <Plus />
                                    {createLabel}
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {children}
            </div>
        </>
    );
}
