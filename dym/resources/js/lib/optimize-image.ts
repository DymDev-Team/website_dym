const MAX_EDGE = 1920;
const WEBP_QUALITY = 0.82;

/** Reduces large camera uploads before sending them to the server. */
export async function optimizeImage(file: File): Promise<File> {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size < 350_000) {
        return file;
    }

    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        const context = canvas.getContext('2d');

        if (!context) {
            bitmap.close();
            return file;
        }

        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();

        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY));

        if (!blob || blob.size >= file.size) {
            return file;
        }

        const name = file.name.replace(/\.[^.]+$/, '') || 'image';

        return new File([blob], `${name}.webp`, { type: 'image/webp', lastModified: file.lastModified });
    } catch {
        // Keep the original when the browser can't decode or convert the image.
        return file;
    }
}
