import { ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import Field from '@/components/admin/field';
import { Input } from '@/components/ui/input';

type Props = {
    name: string;
    label: string;
    currentUrl?: string | null;
    required?: boolean;
    error?: string;
    contain?: boolean;
};

// Champ fichier avec aperçu de l'image actuelle puis de celle choisie.
export default function ImageField({
    name,
    label,
    currentUrl,
    required = false,
    error,
    contain = false,
}: Props) {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const src = preview ?? currentUrl;

    return (
        <Field
            id={name}
            label={label}
            hint={
                currentUrl
                    ? 'Laissez vide pour conserver l’image actuelle. JPG, PNG ou WebP, 5 Mo max.'
                    : 'JPG, PNG ou WebP, 5 Mo max.'
            }
            error={error}
        >
            <div className="flex items-center gap-4">
                <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted">
                    {src ? (
                        <img
                            src={src}
                            alt=""
                            className={`size-full ${contain ? 'object-contain p-2' : 'object-cover'}`}
                        />
                    ) : (
                        <ImageIcon className="size-6 text-muted-foreground" />
                    )}
                </div>
                <Input
                    id={name}
                    name={name}
                    type="file"
                    accept="image/*"
                    required={required && !currentUrl}
                    onChange={onChange}
                />
            </div>
        </Field>
    );
}
