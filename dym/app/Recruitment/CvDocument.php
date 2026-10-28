<?php

namespace App\Recruitment;

use App\Recruitment\Exceptions\PermanentAnalysisError;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

/**
 * A CV in a form Claude can read: PDF and images as they are, Word files as
 * their extracted text.
 */
final readonly class CvDocument
{
    public const PDF = 'pdf';

    public const IMAGE = 'image';

    public const TEXT = 'text';

    private const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    // Limite de l'API pour une image.
    private const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

    public function __construct(
        public string $kind,
        public string $data,
        public string $mediaType,
    ) {}

    /**
     * Load a stored CV.
     *
     * @throws PermanentAnalysisError when the file is missing or cannot be read
     */
    public static function fromStorage(string $disk, string $path): self
    {
        $storage = Storage::disk($disk);

        if (! $storage->exists($path)) {
            throw new PermanentAnalysisError('Le fichier du CV est introuvable.');
        }

        $contents = (string) $storage->get($path);
        $mime = (string) $storage->mimeType($path);

        if ($mime === 'application/pdf') {
            return new self(self::PDF, base64_encode($contents), $mime);
        }

        if (in_array($mime, self::IMAGE_TYPES, true)) {
            if (strlen($contents) > self::MAX_IMAGE_BYTES) {
                throw new PermanentAnalysisError('L’image du CV dépasse 5 Mo : envoyez-la en PDF.');
            }

            return new self(self::IMAGE, base64_encode($contents), $mime);
        }

        if (str_ends_with(strtolower($path), '.docx') || $mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return new self(self::TEXT, self::docxText($storage->path($path)), 'text/plain');
        }

        throw new PermanentAnalysisError('Format non analysable (ancien .doc ou fichier inconnu) : demandez un PDF.');
    }

    /**
     * Plain text of a .docx file, one paragraph per line.
     */
    private static function docxText(string $file): string
    {
        $zip = new ZipArchive;

        if ($zip->open($file) !== true) {
            throw new PermanentAnalysisError('Le fichier Word est illisible.');
        }

        $xml = $zip->getFromName('word/document.xml');
        $zip->close();

        if ($xml === false) {
            throw new PermanentAnalysisError('Le fichier Word est illisible.');
        }

        $xml = str_replace(['</w:p>', '<w:tab/>', '<w:br/>'], ["\n", "\t", "\n"], $xml);
        $text = trim(html_entity_decode(strip_tags($xml), ENT_QUOTES | ENT_XML1, 'UTF-8'));

        if ($text === '') {
            throw new PermanentAnalysisError('Le fichier Word ne contient pas de texte.');
        }

        return preg_replace("/\n{3,}/", "\n\n", $text) ?? $text;
    }
}
