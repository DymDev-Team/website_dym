import { Form } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Paperclip } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { apply } from '@/routes/careers';
import { show as showLegal } from '@/routes/legal';
import { useTexts } from '@/components/site/use-texts';

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

// Formulaire de candidature (offre précise ou candidature spontanée).
export function ApplicationForm({ offerId }: { offerId?: number }) {
    const [sent, setSent] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const t = useTexts();

    if (sent) {
        return (
            <div className="flex items-start gap-4 border border-black/10 bg-white p-6 sm:p-8">
                <CheckCircle2 className="size-6 shrink-0 text-dym" />
                <div>
                    <p className="text-lg font-semibold text-ink">{t('careers.form.success_title')}</p>
                    <p className="mt-2 text-neutral-600">{t('careers.form.success_text')}</p>
                    <button type="button" onClick={() => setSent(false)} className="hx-mono mt-5 text-[10px] tracking-[0.1em] text-dym uppercase hover:underline">
                        {t('careers.form.success_again')}
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

                    <SiteField label={t('careers.form.message')} error={errors.message}>
                        <textarea name="message" rows={5} maxLength={5000} placeholder={t('careers.form.message_placeholder')} className={inputClass} />
                    </SiteField>

                    <SiteField label={t('careers.form.cv')} error={errors.cv}>
                        <span className={`${inputClass} flex cursor-pointer items-center gap-3 ${errors.cv ? 'border-red-500' : ''}`}>
                            <Paperclip className="size-4 shrink-0 text-dym" />
                            <span className={`truncate ${fileName ? 'text-ink' : 'text-neutral-400'}`}>{fileName ?? t('careers.form.cv_placeholder')}</span>
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
                            {t('careers.form.consent')} (
                            <a href={showLegal('politique-de-confidentialite').url} target="_blank" rel="noreferrer" className="text-dym underline underline-offset-2">
                                {t('careers.form.consent_link')}
                            </a>
                            ).
                        </span>
                    </label>
                    {errors.consent && <p className="text-sm text-red-600">{errors.consent}</p>}
                    {errors.job_offer_id && <p className="text-sm text-red-600">{errors.job_offer_id}</p>}

                    <button
                        type="submit"
                        disabled={processing}
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
