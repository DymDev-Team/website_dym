<?php

namespace App\Support;

use App\Models\Activity;
use App\Models\Brand;
use App\Models\Equipment;
use App\Models\Partner;
use App\Models\Post;
use App\Models\Project;
use App\Models\SiteText;
use App\Models\Testimonial;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Médiathèque : toutes les images du serveur, qu'elles soient fournies avec le
 * site (public/images, chemin « /images/… ») ou envoyées depuis l'admin (disque
 * public, chemin relatif « media/… »). C'est la valeur stockée en base.
 */
class MediaLibrary
{
    public const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'];

    /** Dossier des images envoyées depuis la médiathèque. */
    public const UPLOAD_DIRECTORY = 'media';

    /**
     * Colonnes qui contiennent une image : [modèle, colonne, colonne du nom, libellé].
     *
     * @var list<array{class-string, string, string, string}>
     */
    private const USAGES = [
        [Activity::class, 'image', 'title', 'Activité'],
        [Project::class, 'image', 'title', 'Réalisation'],
        [Post::class, 'image', 'title', 'Actualité'],
        [Equipment::class, 'image', 'name', 'Équipement'],
        [Partner::class, 'logo', 'name', 'Partenaire'],
        [Brand::class, 'logo', 'name', 'Marque'],
        [Testimonial::class, 'image', 'author', 'Témoignage'],
    ];

    /**
     * Every image, most recent first.
     *
     * @return list<array{path: string, url: string, name: string, folder: string, source: string, size: int, modified: int, used_by: list<string>}>
     */
    public static function all(): array
    {
        $usages = self::usages();
        $items = [];

        foreach (self::shippedPaths() as $path) {
            $file = public_path(ltrim($path, '/'));
            $items[] = self::item($path, $path, 'site', File::size($file), File::lastModified($file), $usages);
        }

        $disk = Storage::disk('public');

        foreach (self::uploadedPaths() as $path) {
            $items[] = self::item($path, $disk->url($path), 'upload', $disk->size($path), $disk->lastModified($path), $usages);
        }

        usort($items, fn (array $a, array $b) => $b['modified'] <=> $a['modified']);

        return $items;
    }

    /**
     * Whether a path can be picked: an existing image of the library.
     */
    public static function exists(string $path): bool
    {
        if (str_contains($path, '..') || ! in_array(Str::lower(pathinfo($path, PATHINFO_EXTENSION)), self::EXTENSIONS, true)) {
            return false;
        }

        if (Str::startsWith($path, '/images/')) {
            return File::isFile(public_path(ltrim($path, '/')));
        }

        return ! Str::startsWith($path, ['/', 'http://', 'https://']) && Storage::disk('public')->exists($path);
    }

    /**
     * Where each image is used, keyed by stored path.
     *
     * @return array<string, list<string>>
     */
    public static function usages(): array
    {
        $usages = [];

        foreach (self::USAGES as [$model, $column, $name, $label]) {
            $model::query()->whereNotNull($column)->get([$column, $name])
                ->each(function ($record) use (&$usages, $column, $name, $label) {
                    $usages[$record->{$column}][] = "{$label} « {$record->{$name}} »";
                });
        }

        // Photos des textes du site : valeur envoyée, sinon photo par défaut.
        $stored = SiteText::query()->whereIn('key', SiteText::imageKeys())->pluck('value', 'key');

        foreach (SiteText::imageKeys() as $key) {
            $usages[$stored[$key] ?? SiteText::defaults()[$key]][] = 'Texte du site « '.self::textLabel($key).' »';
        }

        return $usages;
    }

    /**
     * Number of places that use an image.
     */
    public static function usageCount(?string $path): int
    {
        return blank($path) ? 0 : count(self::usages()[$path] ?? []);
    }

    /**
     * @return list<string>
     */
    private static function shippedPaths(): array
    {
        $root = public_path('images');

        if (! File::isDirectory($root)) {
            return [];
        }

        return collect(File::allFiles($root))
            ->filter(fn ($file) => in_array(Str::lower($file->getExtension()), self::EXTENSIONS, true))
            ->map(fn ($file) => '/images/'.str_replace('\\', '/', $file->getRelativePathname()))
            ->values()
            ->all();
    }

    /**
     * @return list<string>
     */
    private static function uploadedPaths(): array
    {
        return collect(Storage::disk('public')->allFiles())
            ->filter(fn (string $path) => ! Str::startsWith(basename($path), '.')
                && in_array(Str::lower(pathinfo($path, PATHINFO_EXTENSION)), self::EXTENSIONS, true))
            ->values()
            ->all();
    }

    /**
     * @param  array<string, list<string>>  $usages
     * @return array{path: string, url: string, name: string, folder: string, source: string, size: int, modified: int, used_by: list<string>}
     */
    private static function item(string $path, string $url, string $source, int $size, int $modified, array $usages): array
    {
        $relative = ltrim(Str::after($path, '/images/'), '/');

        return [
            'path' => $path,
            'url' => $url,
            'name' => basename($path),
            'folder' => ($source === 'site' ? 'images/' : '').(dirname($relative) === '.' ? '' : dirname($relative)),
            'source' => $source,
            'size' => $size,
            'modified' => $modified,
            'used_by' => $usages[$path] ?? [],
        ];
    }

    private static function textLabel(string $key): string
    {
        [$page, $section, $field] = explode('.', $key);

        return config("site-texts.{$page}.sections.{$section}.fields.{$field}.label", $key);
    }
}
