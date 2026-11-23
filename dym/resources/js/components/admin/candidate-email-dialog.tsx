import { router } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Field from '@/components/admin/field';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { draft, send } from '@/routes/admin/applications/email';

type Draft = {
    name: string;
    to: string | null;
    reply_to: string | null;
    stage: string | null;
    subject: string;
    body: string;
    sent_at: string | null;
};

const FREE = 'free';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' });

/**
 * E-mail to a candidate, prepared from a stage model (or blank), read and
 * edited by the team: nothing leaves without the « Envoyer » click.
 */
export default function CandidateEmailDialog({
    applicationId,
    stageId,
    templates,
    open,
    onOpenChange,
}: {
    applicationId: number;
    stageId: number | null;
    // Modèles proposés au choix ; sans liste, celui de l'étape est imposé.
    templates?: { id: number; name: string }[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [template, setTemplate] = useState<number | null>(stageId);
    const [data, setData] = useState<Draft | null>(null);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [loadError, setLoadError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (open) {
            setTemplate(stageId);
        }
    }, [open, stageId]);

    useEffect(() => {
        if (!open) {
            return;
        }

        let cancelled = false;
        setData(null);
        setLoadError(null);
        setErrors({});

        fetch(
            draft.url(applicationId, {
                query: template === null ? {} : { stage_id: template },
            }),
            {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            },
        )
            .then((r) => (r.ok ? r.json() : Promise.reject(r)))
            .then((d: Draft) => {
                if (!cancelled) {
                    setData(d);
                    setSubject(d.subject);
                    setBody(d.body);
                }
            })
            .catch(
                () =>
                    !cancelled &&
                    setLoadError('Impossible de préparer l’e-mail. Réessayez.'),
            );

        return () => {
            cancelled = true;
        };
    }, [open, template, applicationId]);

    const submit = () => {
        router.post(
            send.url(applicationId),
            { subject, body, stage_id: template },
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setSending(true),
                onFinish: () => setSending(false),
                onSuccess: () => onOpenChange(false),
                onError: (e) => setErrors(e),
            },
        );
    };

    const title = data?.stage
        ? `E-mail « ${data.stage} » pour ${data.name}`
        : `E-mail à ${data?.name ?? 'ce candidat'}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Relisez et complétez le texte : rien ne part sans votre
                        clic sur « Envoyer ».
                    </DialogDescription>
                </DialogHeader>

                {templates && (
                    <div className="grid gap-2">
                        <Label htmlFor="email_template">Modèle</Label>
                        <Select
                            value={template === null ? FREE : String(template)}
                            onValueChange={(v) =>
                                setTemplate(v === FREE ? null : Number(v))
                            }
                        >
                            <SelectTrigger id="email_template">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={FREE}>
                                    Message libre
                                </SelectItem>
                                {templates.map((t) => (
                                    <SelectItem key={t.id} value={String(t.id)}>
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {loadError && <InputError message={loadError} />}

                {!data && !loadError && (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Spinner /> Préparation de l’e-mail…
                    </p>
                )}

                {data && (
                    <div className="space-y-4">
                        <p className="text-sm">
                            <span className="text-muted-foreground">À : </span>
                            {data.to ?? 'aucune adresse e-mail'}
                            {data.reply_to && (
                                <span className="text-muted-foreground">
                                    {' '}
                                    · réponses sur {data.reply_to}
                                </span>
                            )}
                        </p>

                        {!data.to && (
                            <Warning>
                                Ce candidat n’a pas d’adresse e-mail : complétez
                                sa fiche pour lui écrire.
                            </Warning>
                        )}
                        {data.sent_at && (
                            <Warning>
                                Cet e-mail lui a déjà été envoyé le{' '}
                                {dateFormat.format(new Date(data.sent_at))}.
                            </Warning>
                        )}

                        <Field
                            id="email_subject"
                            label="Objet"
                            error={errors.subject}
                        >
                            <Input
                                id="email_subject"
                                value={subject}
                                maxLength={150}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </Field>
                        <Field
                            id="email_body"
                            label="Texte"
                            hint="Une ligne vide sépare deux paragraphes."
                            error={errors.body}
                        >
                            <Textarea
                                id="email_body"
                                value={body}
                                rows={12}
                                maxLength={5000}
                                onChange={(e) => setBody(e.target.value)}
                            />
                        </Field>

                        {body.includes('à compléter') && (
                            <Warning>
                                Le texte contient encore « à compléter ».
                            </Warning>
                        )}
                        <InputError message={errors.to ?? errors.send} />
                    </div>
                )}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                    >
                        Ne pas envoyer
                    </Button>
                    <Button
                        type="button"
                        disabled={
                            !data || !data.to || sending || !subject || !body
                        }
                        onClick={submit}
                    >
                        {sending && <Spinner />}
                        Envoyer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function Warning({ children }: { children: ReactNode }) {
    return (
        <p className="flex items-start gap-2 rounded-md bg-amber-500/10 p-2 text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>{children}</span>
        </p>
    );
}
