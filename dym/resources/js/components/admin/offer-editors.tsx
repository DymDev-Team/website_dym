import { ArrowDown, ArrowUp, Plus, Sparkles, Trash2 } from 'lucide-react';
import type { MouseEvent, ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import type { Criterion, OfferQuestion, Option } from '@/types/admin';

type Errors = Partial<Record<string, string>>;

// Question telle qu'éditée : les réponses possibles restent une ligne par réponse.
export type EditedQuestion = Omit<OfferQuestion, 'options'> & {
    options: string;
};

export const toEditedQuestions = (
    questions: OfferQuestion[] | null | undefined,
): EditedQuestion[] =>
    (questions ?? []).map((q) => ({ ...q, options: q.options.join('\n') }));

const newQuestionId = () => `q${Math.random().toString(36).slice(2, 10)}`;

function move<T>(items: T[], index: number, offset: number): T[] {
    const copy = [...items];
    [copy[index], copy[index + offset]] = [copy[index + offset], copy[index]];

    return copy;
}

function RowActions({
    index,
    count,
    label,
    onMove,
    onRemove,
}: {
    index: number;
    count: number;
    label: string;
    onMove: (offset: number) => void;
    onRemove: () => void;
}) {
    return (
        <div className="flex shrink-0 items-center">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={index === 0}
                onClick={() => onMove(-1)}
                aria-label={`Monter ${label}`}
            >
                <ArrowUp />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={index === count - 1}
                onClick={() => onMove(1)}
                aria-label={`Descendre ${label}`}
            >
                <ArrowDown />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onRemove}
                aria-label={`Supprimer ${label}`}
            >
                <Trash2 className="text-destructive" />
            </Button>
        </div>
    );
}

function EditorSection({
    title,
    description,
    actions,
    children,
}: {
    title: string;
    description: string;
    actions?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="space-y-4 rounded-xl border p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="font-semibold">{title}</h2>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
                {actions}
            </div>
            {children}
        </section>
    );
}

export function CriteriaEditor({
    value,
    onChange,
    errors,
    onSuggest,
    suggesting,
    aiBlockedReason,
}: {
    value: Criterion[];
    onChange: (criteria: Criterion[]) => void;
    errors: Errors;
    onSuggest: (event: MouseEvent<HTMLButtonElement>) => void;
    suggesting: boolean;
    aiBlockedReason: string | null;
}) {
    const update = (index: number, patch: Partial<Criterion>) =>
        onChange(value.map((c, i) => (i === index ? { ...c, ...patch } : c)));

    return (
        <EditorSection
            title="Grille d’évaluation"
            description="Les critères sur lesquels l’IA note chaque CV. La note finale est la moyenne pondérée de ces critères. Interne : jamais affichée sur le site."
            actions={
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onSuggest}
                    disabled={suggesting || !!aiBlockedReason}
                    title={aiBlockedReason ?? undefined}
                >
                    {suggesting ? <Spinner /> : <Sparkles />}
                    Proposer avec l’IA
                </Button>
            }
        >
            {value.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    Sans grille, l’IA choisit elle-même 4 à 8 critères à partir
                    des missions et du profil recherché.
                </p>
            )}

            <ul className="space-y-3">
                {value.map((criterion, index) => (
                    <li key={index} className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <Input
                                name={`criteria[${index}][name]`}
                                value={criterion.name}
                                onChange={(e) =>
                                    update(index, { name: e.target.value })
                                }
                                required
                                maxLength={120}
                                placeholder="Ex. : Soudure TIG sur inox"
                                aria-label={`Critère ${index + 1}`}
                                className="min-w-48 flex-1"
                            />
                            <Select
                                name={`criteria[${index}][weight]`}
                                value={String(criterion.weight)}
                                onValueChange={(v) =>
                                    update(index, { weight: Number(v) })
                                }
                            >
                                <SelectTrigger
                                    className="w-36"
                                    aria-label={`Poids du critère ${index + 1}`}
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5].map((w) => (
                                        <SelectItem key={w} value={String(w)}>
                                            Poids {w}
                                            {w === 1 && ' (secondaire)'}
                                            {w === 5 && ' (déterminant)'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2 px-1">
                                <Checkbox
                                    id={`criterion-essential-${index}`}
                                    name={`criteria[${index}][essential]`}
                                    value="1"
                                    checked={criterion.essential}
                                    onCheckedChange={(checked) =>
                                        update(index, {
                                            essential: checked === true,
                                        })
                                    }
                                />
                                <Label
                                    htmlFor={`criterion-essential-${index}`}
                                    className="font-normal"
                                >
                                    Indispensable
                                </Label>
                            </div>
                            <RowActions
                                index={index}
                                count={value.length}
                                label={`le critère ${index + 1}`}
                                onMove={(offset) =>
                                    onChange(move(value, index, offset))
                                }
                                onRemove={() =>
                                    onChange(
                                        value.filter((_, i) => i !== index),
                                    )
                                }
                            />
                        </div>
                        <InputError
                            message={
                                errors[`criteria.${index}.name`] ??
                                errors[`criteria.${index}.weight`]
                            }
                        />
                    </li>
                ))}
            </ul>

            <InputError message={errors.criteria} />

            {value.length < 10 && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                        onChange([
                            ...value,
                            { name: '', weight: 3, essential: false },
                        ])
                    }
                >
                    <Plus />
                    Ajouter un critère
                </Button>
            )}

            <p className="text-xs text-muted-foreground">
                Un critère indispensable noté sous 5/10 limite l’avis à « À
                étudier », quelle que soit la note globale.
            </p>
        </EditorSection>
    );
}

export function QuestionsEditor({
    value,
    onChange,
    errors,
    types,
}: {
    value: EditedQuestion[];
    onChange: (questions: EditedQuestion[]) => void;
    errors: Errors;
    types: Option[];
}) {
    const update = (index: number, patch: Partial<EditedQuestion>) =>
        onChange(value.map((q, i) => (i === index ? { ...q, ...patch } : q)));

    return (
        <EditorSection
            title="Questions aux candidats"
            description="Posées dans le formulaire de candidature de cette offre. Les réponses sont transmises à l’IA et affichées dans chaque fiche."
        >
            <ul className="space-y-4">
                {value.map((question, index) => (
                    <li
                        key={question.id}
                        className="space-y-2 rounded-lg border p-3"
                    >
                        <input
                            type="hidden"
                            name={`questions[${index}][id]`}
                            value={question.id}
                        />
                        <div className="flex flex-wrap items-center gap-2">
                            <Input
                                name={`questions[${index}][label]`}
                                value={question.label}
                                onChange={(e) =>
                                    update(index, { label: e.target.value })
                                }
                                required
                                maxLength={300}
                                placeholder="Ex. : Quand pouvez-vous commencer ?"
                                aria-label={`Question ${index + 1}`}
                                className="min-w-56 flex-1"
                            />
                            <Select
                                name={`questions[${index}][type]`}
                                value={question.type}
                                onValueChange={(v) =>
                                    update(index, {
                                        type: v as EditedQuestion['type'],
                                    })
                                }
                            >
                                <SelectTrigger
                                    className="w-48"
                                    aria-label={`Type de la question ${index + 1}`}
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {types.map((t) => (
                                        <SelectItem
                                            key={t.value}
                                            value={t.value}
                                        >
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2 px-1">
                                <Checkbox
                                    id={`question-required-${index}`}
                                    name={`questions[${index}][required]`}
                                    value="1"
                                    checked={question.required}
                                    onCheckedChange={(checked) =>
                                        update(index, {
                                            required: checked === true,
                                        })
                                    }
                                />
                                <Label
                                    htmlFor={`question-required-${index}`}
                                    className="font-normal"
                                >
                                    Obligatoire
                                </Label>
                            </div>
                            <RowActions
                                index={index}
                                count={value.length}
                                label={`la question ${index + 1}`}
                                onMove={(offset) =>
                                    onChange(move(value, index, offset))
                                }
                                onRemove={() =>
                                    onChange(
                                        value.filter((_, i) => i !== index),
                                    )
                                }
                            />
                        </div>

                        {question.type === 'choice' && (
                            <Textarea
                                name={`questions[${index}][options]`}
                                value={question.options}
                                onChange={(e) =>
                                    update(index, { options: e.target.value })
                                }
                                rows={3}
                                maxLength={2000}
                                placeholder={
                                    'Une réponse possible par ligne\nImmédiatement\nSous 1 mois'
                                }
                                aria-label={`Réponses possibles de la question ${index + 1}`}
                            />
                        )}

                        <InputError
                            message={
                                errors[`questions.${index}.label`] ??
                                errors[`questions.${index}.options`] ??
                                errors[`questions.${index}.type`]
                            }
                        />
                    </li>
                ))}
            </ul>

            <InputError message={errors.questions} />

            {value.length < 10 && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                        onChange([
                            ...value,
                            {
                                id: newQuestionId(),
                                label: '',
                                type: 'text',
                                options: '',
                                required: false,
                            },
                        ])
                    }
                >
                    <Plus />
                    Ajouter une question
                </Button>
            )}
        </EditorSection>
    );
}
