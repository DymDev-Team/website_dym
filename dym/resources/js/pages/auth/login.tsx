import { Form, Head } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Connexion" />

            {status && <div className={authStatus}>{status}</div>}

            <PasskeyVerify
                label="Se connecter avec une clé d’accès"
                loadingLabel="Vérification…"
                separator="ou avec votre e-mail"
            />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
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
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                placeholder="nom@dym.ci"
                                className={authField}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password" className={authLabel}>
                                    Mot de passe
                                </Label>
                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className={`ml-auto text-[13px] ${authLink}`}
                                        tabIndex={5}
                                    >
                                        Mot de passe oublié ?
                                    </TextLink>
                                )}
                            </div>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className={authField}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="remember"
                                name="remember"
                                tabIndex={3}
                                className="data-[state=checked]:border-dym data-[state=checked]:bg-dym"
                            />
                            <Label
                                htmlFor="remember"
                                className="text-sm font-normal text-neutral-700"
                            >
                                Se souvenir de moi
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            className={authSubmit}
                            tabIndex={4}
                            disabled={processing}
                            data-test="login-button"
                        >
                            {processing && <Spinner />}
                            Se connecter
                            {!processing && (
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            )}
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Connexion',
    description:
        'Connectez-vous à l’espace d’administration du site DYM Manufacture.',
};
