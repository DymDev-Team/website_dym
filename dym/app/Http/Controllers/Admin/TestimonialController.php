<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\StoresUploads;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveTestimonialRequest;
use App\Models\Testimonial;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TestimonialController extends Controller
{
    use StoresUploads;

    /**
     * Display the list of testimonials.
     */
    public function index(): Response
    {
        return Inertia::render('admin/testimonials/index', [
            'testimonials' => Testimonial::query()->ordered()->get(),
        ]);
    }

    /**
     * Show the creation form.
     */
    public function create(): Response
    {
        return Inertia::render('admin/testimonials/form', [
            'testimonial' => null,
            'nextPosition' => (int) Testimonial::query()->max('position') + 1,
        ]);
    }

    /**
     * Store a new testimonial.
     */
    public function store(SaveTestimonialRequest $request): RedirectResponse
    {
        Testimonial::query()->create([
            ...$request->safe()->except(['image', 'image_media']),
            'position' => $request->integer('position', (int) Testimonial::query()->max('position') + 1),
            'image' => $this->storeUpload($request, 'image', 'testimonials'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Témoignage ajouté.']);

        return to_route('admin.testimonials.index');
    }

    /**
     * Show the edit form.
     */
    public function edit(Testimonial $testimonial): Response
    {
        return Inertia::render('admin/testimonials/form', [
            'testimonial' => $testimonial,
        ]);
    }

    /**
     * Update the testimonial.
     */
    public function update(SaveTestimonialRequest $request, Testimonial $testimonial): RedirectResponse
    {
        $testimonial->update([
            ...$request->safe()->except(['image', 'image_media']),
            'position' => $request->integer('position', $testimonial->position),
            'image' => $this->storeUpload($request, 'image', 'testimonials', $testimonial->image),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Témoignage mis à jour.']);

        return to_route('admin.testimonials.index');
    }

    /**
     * Delete the testimonial.
     */
    public function destroy(Testimonial $testimonial): RedirectResponse
    {
        $testimonial->delete();
        $this->deleteUpload($testimonial->image);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Témoignage supprimé.']);

        return to_route('admin.testimonials.index');
    }
}
