import { ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import Field from '@/components/admin/field';
import MediaPicker from '@/components/admin/media-picker';
import { Input } from '@/components/ui/input';
import type { MediaItem } from '@/types/admin';

type Props = {
    name: string;
    label: string;
    currentUrl?: string | null;
    required?: boolean;
    error?: string;
    contain?: boolean;
};

// Champ image : envoi d'un fichier, ou image choisie dans la médiathèque
// (envoyée dans « {name}_media », voir StoresUploads). Aperçu de l'image
// actuelle puis de celle choisie.
export default function ImageField({
    name,
    label,
    currentUrl,
    required = false,
    error,
    contain = false,
}: Props) {
    const [preview, setPreview] = useState<string | null>(null);
    const [media, setMedia] = useState<MediaItem | null>(null);
    // Change de valeur pour vider le champ fichier quand on choisit une image.
    const [fileKey, setFileKey] = useState(0);

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

        if (file) {
            setMedia(null);
        }
    };

    const pick = (item: MediaItem) => {
        setMedia(item);
        setPreview(null);
        setFileKey((k) => k + 1);
    };

    const src = preview ?? media?.url ?? currentUrl;

    return (
        <Field
            id={name}
            label={label}
            hint={
                media
                    ? `Image de la médiathèque : ${media.name}.`
                    : currentUrl
                      ? 'Laissez vide pour conserver l’image actuelle. JPG, PNG ou WebP, 5 Mo max.'
                      : 'JPG, PNG ou WebP, 5 Mo max, ou une image de la médiathèque.'
            }
            error={error}
        >
            <div className="flex flex-wrap items-center gap-4">
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
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    <Input
                        key={fileKey}
                        id={name}
                        name={name}
                        type="file"
                        accept="image/*"
                        required={required && !currentUrl && !media}
                        onChange={onChange}
                        className="max-w-sm"
                    />
                    <MediaPicker selected={media?.path} onSelect={pick} />
                </div>
                {media && (
                    <input
                        type="hidden"
                        name={`${name}_media`}
                        value={media.path}
                    />
                )}
            </div>
        </Field>
    );
}
