import { Form } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Paperclip } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { apply } from '@/routes/careers';
import { show as showLegal } from '@/routes/legal';
import { useTexts } from '@/components/site/use-texts';
import type { OfferQuestion } from '@/types/admin';

const inputClass = 'w-full border border-black/15 bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-neutral-400 focus:border-dym aria-invalid:border-red-500';

function SiteField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <label className="block">
            <span className="hx-mono mb-2 block text-[10px] tracking-[0.1em] text-neutral-500 uppercase">{label}</span>
            {children}
            {error && <span className="mt-1.5 block text-sm text-red-600">{error}</span>}
        </label>
    );
}

// Questions propres à l'offre, définies dans l'admin ; réponses envoyées dans answers[id].
function OfferQuestionField({ question, error }: { question: OfferQuestion; error?: string }) {
    const t = useTexts();
    const name = `answers[${question.id}]`;
    const label = question.required ? `${question.label} *` : question.label;

    if (question.type === 'yes_no') {
        return (
            <fieldset>
                <legend className="hx-mono mb-2 block text-[10px] tracking-[0.1em] text-neutral-500 uppercase">{label}</legend>
                <div className="flex gap-6">
                    {(['oui', 'non'] as const).map((value) => (
                        <label key={value} className="flex items-center gap-2 text-[15px] text-ink">
                            <input type="radio" name={name} value={value} required={question.required} className="size-4 accent-dym" />
                            {value === 'oui' ? t.c('careers.form.yes') : t.c('careers.form.no')}
                        </label>
                    ))}
                </div>
                {error && <span className="mt-1.5 block text-sm text-red-600">{error}</span>}
            </fieldset>
        );
    }

    return (
        <SiteField label={label} error={error}>
            {question.type === 'choice' ? (
                <select name={name} required={question.required} defaultValue="" className={inputClass} aria-invalid={!!error}>
                    <option value="" disabled={question.required}>{t('careers.form.choose')}</option>
                    {question.options.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
            ) : question.type === 'textarea' ? (
                <textarea name={name} rows={4} maxLength={3000} required={question.required} className={inputClass} aria-invalid={!!error} />
            ) : (
                <input name={name} type={question.type === 'number' ? 'number' : 'text'} min={question.type === 'number' ? 0 : undefined} maxLength={question.type === 'text' ? 500 : undefined} required={question.required} className={inputClass} aria-invalid={!!error} />
            )}
        </SiteField>
    );
}

// Formulaire de candidature (offre précise ou candidature spontanée).
export function ApplicationForm({ offerId, questions = [] }: { offerId?: number; questions?: OfferQuestion[] }) {
    const [sent, setSent] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const t = useTexts();

    if (sent) {
        return (
            <div className="flex items-start gap-4 border border-black/10 bg-white p-6 sm:p-8">
                <CheckCircle2 className="size-6 shrink-0 text-dym" />
                <div>
                    <p className="text-lg font-semibold text-ink">{t.c('careers.form.success_title')}</p>
                    <p className="mt-2 text-neutral-600">{t.c('careers.form.success_text')}</p>
                    <button type="button" onClick={() => setSent(false)} className="hx-mono mt-5 text-[10px] tracking-[0.1em] text-dym uppercase hover:underline">
                        {t.c('careers.form.success_again')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <Form
            {...apply.form()}
            encType="multipart/form-data"
            options={{ preserveScroll: true }}
            resetOnSuccess
            onSuccess={() => {
                setSent(true);
                setFileName(null);
            }}
            className="space-y-5"
        >
            {({ errors, processing }) => (
                <>
                    {offerId && <input type="hidden" name="job_offer_id" value={offerId} />}
                    {/* Champ piège pour les robots, invisible pour les visiteurs. */}
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

                    <div className="grid gap-5 sm:grid-cols-2">
                        <SiteField label={t('careers.form.name')} error={errors.name}>
                            <input name="name" required maxLength={120} autoComplete="name" className={inputClass} aria-invalid={!!errors.name} />
                        </SiteField>
                        <SiteField label={t('careers.form.email')} error={errors.email}>
                            <input name="email" type="email" required autoComplete="email" className={inputClass} aria-invalid={!!errors.email} />
                        </SiteField>
                    </div>

                    <SiteField label={t('careers.form.phone')} error={errors.phone}>
                        <input name="phone" type="tel" maxLength={40} autoComplete="tel" className={inputClass} />
                    </SiteField>

                    {questions.map((question) => <OfferQuestionField key={question.id} question={question} error={errors[`answers.${question.id}` as keyof typeof errors]} />)}

                    <SiteField label={t('careers.form.message')} error={errors.message}>
                        <textarea name="message" rows={5} maxLength={5000} placeholder={t('careers.form.message_placeholder')} className={inputClass} />
                    </SiteField>

                    <SiteField label={t('careers.form.cv')} error={errors.cv}>
                        <span className={`${inputClass} flex cursor-pointer items-center gap-3 ${errors.cv ? 'border-red-500' : ''}`}>
                            <Paperclip className="size-4 shrink-0 text-dym" />
                            <span className={`truncate ${fileName ? 'text-ink' : 'text-neutral-400'}`}>{fileName ?? t.c('careers.form.cv_placeholder')}</span>
                            <input
                                name="cv"
                                type="file"
                                required
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                className="sr-only"
                                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                            />
                        </span>
                    </SiteField>

                    <label className="flex items-start gap-3 text-sm text-neutral-600">
                        <input type="checkbox" name="consent" value="1" required className="mt-1 size-4 accent-dym" />
                        <span>
                            {t.c('careers.form.consent')} (
                            <a href={showLegal('politique-de-confidentialite').url} target="_blank" rel="noreferrer" className="text-dym underline underline-offset-2">
                                {t.c('careers.form.consent_link')}
                            </a>
                            ).
                        </span>
                    </label>
                    {errors.consent && <p className="text-sm text-red-600">{errors.consent}</p>}
                    {errors.job_offer_id && <p className="text-sm text-red-600">{errors.job_offer_id}</p>}

                    <button
                        type="submit"
                        disabled={processing}
                        style={t.style(processing ? 'careers.form.sending' : 'careers.form.submit')}
                        className="hd-cta relative inline-flex items-center gap-2 overflow-hidden bg-dym px-6 py-4 text-[11px] font-semibold tracking-[0.14em] text-white uppercase transition-colors hover:bg-dym-dark disabled:opacity-60"
                    >
                        {processing ? t('careers.form.sending') : t('careers.form.submit')}
                        <ArrowRight className="hd-arrow size-3.5" />
                    </button>
                </>
            )}
        </Form>
    );
}
