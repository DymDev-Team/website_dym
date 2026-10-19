<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Fortify\CreateNewUser;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display the list of user accounts.
     */
    public function index(): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => User::query()
                ->orderByDesc('is_admin')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'is_admin', 'email_verified_at', 'created_at']),
        ]);
    }

    /**
     * Create an account from the admin panel (email considered verified).
     */
    public function store(Request $request, CreateNewUser $creator): RedirectResponse
    {
        $user = $creator->create($request->only(['name', 'email', 'password', 'password_confirmation']));

        $user->forceFill([
            'is_admin' => $request->boolean('is_admin'),
            'email_verified_at' => now(),
        ])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Compte créé.']);

        return to_route('admin.users.index');
    }

    /**
     * Grant or revoke admin access.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate(['is_admin' => ['required', 'boolean']]);

        if ($user->is($request->user()) && ! $validated['is_admin']) {
            return back()->withErrors(['is_admin' => 'Vous ne pouvez pas retirer vos propres droits d’administration.']);
        }

        $user->forceFill(['is_admin' => $validated['is_admin']])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => $validated['is_admin'] ? 'Accès admin accordé.' : 'Accès admin retiré.']);

        return to_route('admin.users.index');
    }

    /**
     * Delete an account.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($user->is($request->user()), 403, 'Vous ne pouvez pas supprimer votre propre compte ici.');

        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Compte supprimé.']);

        return to_route('admin.users.index');
    }
}
