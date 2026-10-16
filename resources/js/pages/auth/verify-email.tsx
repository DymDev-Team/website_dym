import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { authLink, authStatus, authSubmit } from '@/lib/auth-styles';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Vérification de l’e-mail" />

            {status === 'verification-link-sent' && (
                <div className={authStatus}>
                    Un nouveau lien de vérification vient d’être envoyé à votre
                    adresse e-mail.
                </div>
            )}

            <Form {...send.form()} className="grid gap-6 text-center">
                {({ processing }) => (
                    <>
                        <Button disabled={processing} className={authSubmit}>
                            {processing && <Spinner />}
                            Renvoyer l’e-mail de vérification
                        </Button>

                        <TextLink
                            href={logout()}
                            className={`mx-auto block text-sm ${authLink}`}
                        >
                            Se déconnecter
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Vérifiez votre e-mail',
    description:
        'Cliquez sur le lien que nous venons de vous envoyer par e-mail pour confirmer votre adresse.',
};
