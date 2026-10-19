<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\StoresUploads;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveBrandRequest;
use App\Models\Brand;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    use StoresUploads;

    /**
     * Display the list of brands.
     */
    public function index(): Response
    {
        return Inertia::render('admin/brands/index', [
            'brands' => Brand::query()->ordered()->get(),
        ]);
    }

    /**
     * Show the creation form.
     */
    public function create(): Response
    {
        return Inertia::render('admin/brands/form', [
            'brand' => null,
            'nextPosition' => (int) Brand::query()->max('position') + 1,
        ]);
    }

    /**
     * Store a new brand.
     */
    public function store(SaveBrandRequest $request): RedirectResponse
    {
        Brand::query()->create([
            ...$request->safe()->except(['logo', 'logo_media']),
            'position' => $request->integer('position', (int) Brand::query()->max('position') + 1),
            'logo' => $this->storeUpload($request, 'logo', 'brands'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Marque ajoutée.']);

        return to_route('admin.brands.index');
    }

    /**
     * Show the edit form.
     */
    public function edit(Brand $brand): Response
    {
        return Inertia::render('admin/brands/form', [
            'brand' => $brand,
        ]);
    }

    /**
     * Update the brand.
     */
    public function update(SaveBrandRequest $request, Brand $brand): RedirectResponse
    {
        $brand->update([
            ...$request->safe()->except(['logo', 'logo_media']),
            'position' => $request->integer('position', $brand->position),
            'logo' => $this->storeUpload($request, 'logo', 'brands', $brand->logo),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Marque mise à jour.']);

        return to_route('admin.brands.index');
    }

    /**
     * Delete the brand.
     */
    public function destroy(Brand $brand): RedirectResponse
    {
        $brand->delete();
        $this->deleteUpload($brand->logo);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Marque supprimée.']);

        return to_route('admin.brands.index');
    }
}
