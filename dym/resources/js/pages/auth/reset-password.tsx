import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { authField, authLabel, authSubmit } from '@/lib/auth-styles';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
    passwordRules: string;
};

export default function ResetPassword({ token, email, passwordRules }: Props) {
    return (
        <>
            <Head title="Nouveau mot de passe" />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                className="grid gap-5"
            >
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
                                autoComplete="email"
                                value={email}
                                className={`${authField} text-neutral-500`}
                                readOnly
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password" className={authLabel}>
                                Nouveau mot de passe
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                className={authField}
                                autoFocus
                                placeholder="••••••••"
                                passwordrules={passwordRules}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="password_confirmation"
                                className={authLabel}
                            >
                                Confirmer le mot de passe
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                className={authField}
                                placeholder="••••••••"
                                passwordrules={passwordRules}
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>

                        <Button
                            type="submit"
                            className={authSubmit}
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing && <Spinner />}
                            Enregistrer le mot de passe
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

ResetPassword.layout = {
    title: 'Nouveau mot de passe',
    description: 'Choisissez votre nouveau mot de passe.',
};
