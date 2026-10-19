export default function Heading({
    title,
    description,
    variant = 'default',
}: {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
}) {
    if (variant === 'small') {
        return (
            <header>
                <h2 className="mb-0.5 text-base font-medium">{title}</h2>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </header>
        );
    }

    return (
        <header className="mb-8 space-y-2">
            <h2 className="font-display text-[clamp(28px,3vw,38px)] leading-none tracking-normal uppercase">
                {title}
                <span className="text-dym">.</span>
            </h2>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </header>
    );
}
