<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\StoresUploads;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SavePartnerRequest;
use App\Models\Partner;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PartnerController extends Controller
{
    use StoresUploads;

    /**
     * Display the list of partners.
     */
    public function index(): Response
    {
        return Inertia::render('admin/partners/index', [
            'partners' => Partner::query()->ordered()->get(),
        ]);
    }

    /**
     * Show the creation form.
     */
    public function create(): Response
    {
        return Inertia::render('admin/partners/form', [
            'partner' => null,
            'nextPosition' => (int) Partner::query()->max('position') + 1,
        ]);
    }

    /**
     * Store a new partner.
     */
    public function store(SavePartnerRequest $request): RedirectResponse
    {
        Partner::query()->create([
            ...$request->safe()->except(['logo', 'logo_media']),
            'position' => $request->integer('position', (int) Partner::query()->max('position') + 1),
            'logo' => $this->storeUpload($request, 'logo', 'partners'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Partenaire ajouté.']);

        return to_route('admin.partners.index');
    }

    /**
     * Show the edit form.
     */
    public function edit(Partner $partner): Response
    {
        return Inertia::render('admin/partners/form', [
            'partner' => $partner,
        ]);
    }

    /**
     * Update the partner.
     */
    public function update(SavePartnerRequest $request, Partner $partner): RedirectResponse
    {
        $partner->update([
            ...$request->safe()->except(['logo', 'logo_media']),
            'position' => $request->integer('position', $partner->position),
            'logo' => $this->storeUpload($request, 'logo', 'partners', $partner->logo),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Partenaire mis à jour.']);

        return to_route('admin.partners.index');
    }

    /**
     * Delete the partner.
     */
    public function destroy(Partner $partner): RedirectResponse
    {
        $partner->delete();
        $this->deleteUpload($partner->logo);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Partenaire supprimé.']);

        return to_route('admin.partners.index');
    }
}
