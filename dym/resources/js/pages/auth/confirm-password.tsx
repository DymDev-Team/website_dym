import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    index as confirmOptions,
    store as confirmStore,
} from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyConfirmationController';
import { authField, authLabel, authSubmit } from '@/lib/auth-styles';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Confirmer le mot de passe" />

            <PasskeyVerify
                routes={{
                    options: confirmOptions(),
                    submit: confirmStore(),
                }}
                label="Confirmer avec une clé d’accès"
                loadingLabel="Confirmation…"
                separator="ou avec votre mot de passe"
            />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="grid gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="password" className={authLabel}>
                                Mot de passe
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                autoFocus
                                className={authField}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <Button
                            className={authSubmit}
                            disabled={processing}
                            data-test="confirm-password-button"
                        >
                            {processing && <Spinner />}
                            Confirmer
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

ConfirmPassword.layout = {
    title: 'Confirmation',
    description:
        'Zone sécurisée : confirmez votre mot de passe avant de continuer.',
};
