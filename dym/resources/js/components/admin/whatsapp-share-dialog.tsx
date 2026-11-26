import { Copy, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { ContactRow } from '@/components/admin/contacts-export';
import Field from '@/components/admin/field';
import { postJson } from '@/components/admin/recruitment';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { contacts } from '@/routes/admin/applications';

// Infos ajoutées au nom et au poste, que l'on coche selon la personne.
const fields = {
    phone: 'Téléphone',
    email: 'E-mail',
    stage: 'Étape',
    scores: 'Notes (IA, test, DG)',
    experience: 'Expérience',
    location: 'Ville',
    summary: 'Résumé de l’IA',
    url: 'Lien vers la fiche (admin)',
} as const;

type FieldKey = keyof typeof fields;

const defaultFields: FieldKey[] = ['phone', 'email', 'stage', 'scores'];

const storage = {
    fields: 'dym.whatsapp-share.fields',
    recipient: 'dym.whatsapp-share.recipient',
};

// Si WhatsApp coupe un lien trop long, on copie le message à la main.
const LONG_MESSAGE = 3500;

function storedFields(): FieldKey[] {
    try {
        const value = JSON.parse(localStorage.getItem(storage.fields) ?? '');

        return Array.isArray(value)
            ? value.filter((key): key is FieldKey => key in fields)
            : defaultFields;
    } catch {
        return defaultFields;
    }
}

/**
 * Chiffres avec l'indicatif, comme wa.me les attend ; un numéro à dix
 * chiffres commençant par 0 est ivoirien.
 */
export function whatsappNumber(input: string): string | null {
    let digits = input.replace(/\D+/g, '');

    if (digits.startsWith('00')) {
        digits = digits.slice(2);
    }

    if (digits.length === 10 && digits.startsWith('0')) {
        digits = `225${digits}`;
    }

    return digits.length >= 11 && digits.length <= 15 ? digits : null;
}

const join = (parts: (string | null | false)[]) =>
    parts.filter(Boolean).join(' · ');

/**
 * Message WhatsApp (gras entre astérisques), un paragraphe par candidat.
 */
export function buildMessage(rows: ContactRow[], keys: FieldKey[]): string {
    const has = (key: FieldKey) => keys.includes(key);
    const offers = [...new Set(rows.map((row) => row.offer))];
    const title =
        offers.length === 1
            ? `*${rows.length} candidat${rows.length > 1 ? 's' : ''} — ${offers[0]}*`
            : `*${rows.length} candidat${rows.length > 1 ? 's' : ''} — DYM Manufacture*`;

    const blocks = rows.map((row, i) => {
        const name = row.name || row.email || 'Nom inconnu';
        const lines = [
            offers.length === 1
                ? `*${i + 1}. ${name}*`
                : `*${i + 1}. ${name}* — ${row.offer}`,
            join([
                has('phone') && row.phone && `Tél : ${row.phone}`,
                has('email') && row.email && `E-mail : ${row.email}`,
            ]),
            has('stage') && `Étape : ${row.stage}`,
            has('scores') &&
                join([
                    row.score !== null &&
                        `Note IA : ${row.score}/100${row.recommendation ? ` (${row.recommendation})` : ''}`,
                    row.test_score !== null && `Test : ${row.test_score}/100`,
                    row.dg_score !== null && `DG : ${row.dg_score}/100`,
                    row.global_score !== null &&
                        `Globale : ${row.global_score}/100`,
                ]),
            join([
                has('experience') &&
                    (row.years_experience !== null || row.seniority) &&
                    `Expérience : ${join([
                        row.years_experience !== null &&
                            `${row.years_experience} an${row.years_experience > 1 ? 's' : ''}`,
                        row.seniority,
                    ])}`,
                has('location') && row.location && `Ville : ${row.location}`,
            ]),
            has('summary') && row.summary && `Résumé : ${row.summary}`,
            has('url') && `Fiche : ${row.url}`,
        ];

        return lines.filter(Boolean).join('\n');
    });

    return [title, ...blocks].join('\n\n');
}

type Props = {
    count: number;
    // Corps de la requête : la sélection et l'action demandée.
    body: (action: 'preview' | 'whatsapp') => FormData;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

/**
 * Envoie les infos des candidatures sélectionnées à une personne (DG,
 * responsable…) : le message est préparé ici puis envoyé depuis WhatsApp.
 */
export default function WhatsappShareDialog({
    count,
    body,
    open,
    onOpenChange,
}: Props) {
    const [rows, setRows] = useState<ContactRow[] | null>(null);
    const [keys, setKeys] = useState<FieldKey[]>(storedFields);
    const [text, setText] = useState('');
    const [recipient, setRecipient] = useState(
        () => localStorage.getItem(storage.recipient) ?? '',
    );

    useEffect(() => {
        postJson<{ rows: ContactRow[] }>(contacts.url(), body('preview'))
            .then((data) => {
                setRows(data.rows);
                setText(buildMessage(data.rows, keys));
            })
            .catch((error: Error) => {
                toast.error(error.message);
                onOpenChange(false);
            });
        // Chargé une fois, à l'ouverture.
    }, []);

    const toggleField = (key: FieldKey, on: boolean) => {
        const next = on ? [...keys, key] : keys.filter((k) => k !== key);
        setKeys(next);
        localStorage.setItem(storage.fields, JSON.stringify(next));

        if (rows) {
            setText(buildMessage(rows, next));
        }
    };

    const number = recipient.trim() === '' ? '' : whatsappNumber(recipient);

    const send = () => {
        if (number === null) {
            return;
        }

        localStorage.setItem(storage.recipient, recipient.trim());
        // Ouvert dans le clic : sinon le navigateur bloque la fenêtre.
        window.open(
            `https://wa.me/${number}?text=${encodeURIComponent(text)}`,
            '_blank',
            'noopener',
        );

        const request = body('whatsapp');

        if (number) {
            request.append('recipient', `+${number}`);
        }

        postJson(contacts.url(), request).catch(() =>
            toast.error('Message ouvert, mais l’envoi n’a pas été noté.'),
        );
        onOpenChange(false);
    };

    const copy = () =>
        navigator.clipboard.writeText(text).then(
            () => toast.success('Message copié.'),
            () => toast.error('Le navigateur a refusé la copie.'),
        );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Envoyer par WhatsApp</DialogTitle>
                    <DialogDescription>
                        Les infos de {count} candidature{count > 1 ? 's' : ''},
                        à envoyer à la personne de votre choix. Le message
                        s’ouvre dans WhatsApp, prêt à partir.
                    </DialogDescription>
                </DialogHeader>

                {rows === null ? (
                    <div className="flex justify-center py-10">
                        <Spinner />
                    </div>
                ) : (
                    <div className="grid gap-5">
                        <Field
                            id="whatsapp-recipient"
                            label="Numéro du destinataire"
                            hint="Laissez vide pour choisir le contact dans WhatsApp."
                            error={
                                number === null
                                    ? 'Numéro incomplet : 10 chiffres (07…) ou avec l’indicatif (+225…).'
                                    : undefined
                            }
                        >
                            <Input
                                id="whatsapp-recipient"
                                type="tel"
                                value={recipient}
                                onChange={(event) =>
                                    setRecipient(event.target.value)
                                }
                                placeholder="07 07 07 07 07"
                            />
                        </Field>

                        <div className="grid gap-2">
                            <Label>
                                Infos à inclure (le nom et le poste le sont
                                toujours)
                            </Label>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {(Object.keys(fields) as FieldKey[]).map(
                                    (key) => (
                                        <label
                                            key={key}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <Checkbox
                                                checked={keys.includes(key)}
                                                onCheckedChange={(value) =>
                                                    toggleField(
                                                        key,
                                                        value === true,
                                                    )
                                                }
                                            />
                                            {fields[key]}
                                        </label>
                                    ),
                                )}
                            </div>
                        </div>

                        <Field
                            id="whatsapp-message"
                            label="Message"
                            hint={
                                text.length > LONG_MESSAGE
                                    ? 'Message long : si WhatsApp le coupe, copiez-le et collez-le dans la conversation.'
                                    : 'Modifiable avant l’envoi.'
                            }
                        >
                            <Textarea
                                id="whatsapp-message"
                                value={text}
                                onChange={(event) =>
                                    setText(event.target.value)
                                }
                                rows={12}
                                className="max-h-[45vh] font-mono text-xs"
                            />
                        </Field>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        disabled={rows === null}
                        onClick={copy}
                    >
                        <Copy />
                        Copier le message
                    </Button>
                    <Button
                        disabled={rows === null || number === null}
                        onClick={send}
                    >
                        <MessageCircle />
                        Ouvrir WhatsApp
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
