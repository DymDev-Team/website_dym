import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import Field from '@/components/admin/field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type PublishFieldsProps = {
    position: number;
    isPublished: boolean;
    errors: Record<string, string | undefined>;
};

// Ordre d'affichage et visibilité sur le site, communs aux blocs de contenu.
export function PublishFields({
    position,
    isPublished,
    errors,
}: PublishFieldsProps) {
    return (
        <div className="grid gap-6 sm:grid-cols-2">
            <Field
                id="position"
                label="Ordre d’affichage"
                hint="Les plus petits numéros apparaissent en premier."
                error={errors.position}
            >
                <Input
                    id="position"
                    name="position"
                    type="number"
                    min={0}
                    max={9999}
                    defaultValue={position}
                />
            </Field>

            <div className="flex items-center gap-3 sm:pt-7">
                <Checkbox
                    id="is_published"
                    name="is_published"
                    defaultChecked={isPublished}
                />
                <Label htmlFor="is_published">Visible sur le site</Label>
            </div>
        </div>
    );
}

type FormActionsProps = {
    processing: boolean;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
    label?: string;
};

export function FormActions({
    processing,
    cancelHref,
    label = 'Enregistrer',
}: FormActionsProps) {
    return (
        <div className="flex items-center gap-3 border-t pt-6">
            <Button type="submit" disabled={processing}>
                {processing && <Spinner />}
                {label}
            </Button>
            <Button variant="ghost" asChild>
                <Link href={cancelHref}>Annuler</Link>
            </Button>
        </div>
    );
}
