import { Form, router, usePage } from '@inertiajs/react';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import AdminPage from '@/components/admin/admin-page';
import DeleteButton from '@/components/admin/delete-button';
import Field from '@/components/admin/field';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes/admin';
import { destroy, index, store, update } from '@/routes/admin/users';
import type { AdminUser } from '@/types/admin';

function CreateUserDialog() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus />
                    Nouveau compte
                </Button>
            </DialogTrigger>
            <DialogContent>
                <Form
                    {...store.form()}
                    resetOnSuccess
                    onSuccess={() => setOpen(false)}
                    className="space-y-5"
                >
                    {({ errors, processing }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Nouveau compte</DialogTitle>
                                <DialogDescription>
                                    Le compte est actif immédiatement, sans
                                    vérification d’e-mail.
                                </DialogDescription>
                            </DialogHeader>

                            <Field id="name" label="Nom" error={errors.name}>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    autoComplete="off"
                                />
                            </Field>
                            <Field
                                id="email"
                                label="E-mail"
                                error={errors.email}
                            >
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="off"
                                />
                            </Field>
                            <Field
                                id="password"
                                label="Mot de passe"
                                error={errors.password}
                            >
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    autoComplete="new-password"
                                />
                            </Field>
                            <Field
                                id="password_confirmation"
                                label="Confirmation du mot de passe"
                            >
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    required
                                    autoComplete="new-password"
                                />
                            </Field>
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="is_admin"
                                    name="is_admin"
                                    defaultChecked
                                />
                                <Label htmlFor="is_admin">
                                    Accès au panneau d’administration
                                </Label>
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary">Annuler</Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    Créer le compte
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default function UsersIndex({ users }: { users: AdminUser[] }) {
    const { auth, errors } = usePage<{ errors: Record<string, string> }>()
        .props;

    const toggleAdmin = (user: AdminUser, isAdmin: boolean) => {
        router.visit(update(user.id), {
            data: { is_admin: isAdmin },
            preserveScroll: true,
        });
    };

    return (
        <AdminPage
            title="Utilisateurs"
            description="Comptes ayant accès à l’application. Seuls les administrateurs peuvent modifier le site."
            actions={<CreateUserDialog />}
        >
            <InputError message={errors.is_admin} />

            <div className="overflow-hidden rounded-xl border">
                <ul className="divide-y">
                    {users.map((user) => {
                        const isSelf = user.id === auth.user.id;

                        return (
                            <li
                                key={user.id}
                                className="flex flex-wrap items-center gap-4 p-3 sm:px-4"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">
                                        {user.name}
                                        {isSelf && (
                                            <span className="ml-2 text-xs text-muted-foreground">
                                                (vous)
                                            </span>
                                        )}
                                    </p>
                                    <p className="truncate text-sm text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>

                                {!user.email_verified_at && (
                                    <Badge variant="outline">
                                        E-mail non vérifié
                                    </Badge>
                                )}

                                <label className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                        checked={user.is_admin}
                                        disabled={isSelf}
                                        onCheckedChange={(checked) =>
                                            toggleAdmin(user, checked === true)
                                        }
                                        aria-label={`Accès admin pour ${user.name}`}
                                    />
                                    Admin
                                </label>

                                {isSelf ? (
                                    <span className="size-9" />
                                ) : (
                                    <DeleteButton
                                        action={destroy.form(user.id)}
                                        label={user.name}
                                    />
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </AdminPage>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Utilisateurs', href: index() },
    ],
};
