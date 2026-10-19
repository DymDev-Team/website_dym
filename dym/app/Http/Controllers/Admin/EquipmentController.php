<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\StoresUploads;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveEquipmentRequest;
use App\Models\Equipment;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EquipmentController extends Controller
{
    use StoresUploads;

    /**
     * Display the list of equipment.
     */
    public function index(): Response
    {
        return Inertia::render('admin/equipment/index', [
            'equipment' => Equipment::query()->ordered()->get(),
        ]);
    }

    /**
     * Show the creation form.
     */
    public function create(): Response
    {
        return Inertia::render('admin/equipment/form', [
            'equipment' => null,
            'nextPosition' => (int) Equipment::query()->max('position') + 1,
        ]);
    }

    /**
     * Store a new equipment.
     */
    public function store(SaveEquipmentRequest $request): RedirectResponse
    {
        Equipment::query()->create([
            ...$request->safe()->except(['image', 'image_media']),
            'position' => $request->integer('position', (int) Equipment::query()->max('position') + 1),
            'image' => $this->storeUpload($request, 'image', 'equipment'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Équipement créé.']);

        return to_route('admin.equipment.index');
    }

    /**
     * Show the edit form.
     */
    public function edit(Equipment $equipment): Response
    {
        return Inertia::render('admin/equipment/form', [
            'equipment' => $equipment,
        ]);
    }

    /**
     * Update the equipment.
     */
    public function update(SaveEquipmentRequest $request, Equipment $equipment): RedirectResponse
    {
        $equipment->update([
            ...$request->safe()->except(['image', 'image_media']),
            'position' => $request->integer('position', $equipment->position),
            'image' => $this->storeUpload($request, 'image', 'equipment', $equipment->image),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Équipement mis à jour.']);

        return to_route('admin.equipment.index');
    }

    /**
     * Delete the equipment.
     */
    public function destroy(Equipment $equipment): RedirectResponse
    {
        $equipment->delete();
        $this->deleteUpload($equipment->image);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Équipement supprimé.']);

        return to_route('admin.equipment.index');
    }
}
