<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\StoresUploads;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SavePostRequest;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    use StoresUploads;

    /**
     * Display the list of posts, drafts first.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search'));

        return Inertia::render('admin/posts/index', [
            'posts' => Post::query()
                ->when($search !== '', fn ($query) => $query->where('title', 'like', "%{$search}%"))
                ->orderByRaw('published_at is not null')
                ->latest('published_at')
                ->latest('id')
                ->paginate(15)
                ->withQueryString(),
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Show the creation form.
     */
    public function create(): Response
    {
        return Inertia::render('admin/posts/form', [
            'post' => null,
            'categories' => $this->categories(),
        ]);
    }

    /**
     * Store a new post.
     */
    public function store(SavePostRequest $request): RedirectResponse
    {
        Post::query()->create([
            ...$request->safe()->except(['image', 'image_media']),
            'image' => $this->storeUpload($request, 'image', 'posts'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Actualité créée.']);

        return to_route('admin.posts.index');
    }

    /**
     * Show the edit form.
     */
    public function edit(Post $post): Response
    {
        return Inertia::render('admin/posts/form', [
            'post' => $post,
            'categories' => $this->categories(),
        ]);
    }

    /**
     * Update the post.
     */
    public function update(SavePostRequest $request, Post $post): RedirectResponse
    {
        $post->update([
            ...$request->safe()->except(['image', 'image_media']),
            'slug' => $request->validated('slug') ?? Post::uniqueSlug($request->validated('title'), $post->id),
            'image' => $this->storeUpload($request, 'image', 'posts', $post->image),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Actualité mise à jour.']);

        return to_route('admin.posts.index');
    }

    /**
     * Delete the post.
     */
    public function destroy(Post $post): RedirectResponse
    {
        $post->delete();
        $this->deleteUpload($post->image);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Actualité supprimée.']);

        return to_route('admin.posts.index');
    }

    /**
     * Categories already in use, suggested in the form.
     *
     * @return array<int, string>
     */
    private function categories(): array
    {
        return Post::query()
            ->select('category')
            ->distinct()
            ->orderBy('category')
            ->get()
            ->map(fn (Post $post) => $post->category)
            ->values()
            ->all();
    }
}
