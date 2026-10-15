import { Form, Head } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    authField,
    authLabel,
    authLink,
    authStatus,
    authSubmit,
} from '@/lib/auth-styles';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Mot de passe oublié" />

            {status && <div className={authStatus}>{status}</div>}

            <Form {...email.form()} className="grid gap-5">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className={authLabel}>
                                Adresse e-mail
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="off"
                                autoFocus
                                placeholder="nom@dym.ci"
                                className={authField}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <Button
                            className={authSubmit}
                            disabled={processing}
                            data-test="email-password-reset-link-button"
                        >
                            {processing && <Spinner />}
                            Envoyer le lien
                            {!processing && (
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            )}
                        </Button>
                    </>
                )}
            </Form>

            <TextLink
                href={login()}
                className={`mt-8 inline-flex items-center gap-2 self-start text-sm ${authLink}`}
            >
                <ArrowLeft className="size-3.5" /> Retour à la connexion
            </TextLink>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Mot de passe oublié',
    description:
        'Indiquez votre adresse e-mail : nous vous enverrons un lien pour choisir un nouveau mot de passe.',
};
