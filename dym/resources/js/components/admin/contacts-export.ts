// Coordonnées des candidatures sélectionnées : fichier CSV pour Excel ou
// copie dans le presse-papiers.

export type ContactRow = {
    name: string | null;
    phone: string | null;
    email: string | null;
    offer: string;
    stage: string;
    score: number | null;
    recommendation: string | null;
    test_score: number | null;
    dg_score: number | null;
    global_score: number | null;
    years_experience: number | null;
    seniority: string | null;
    location: string | null;
    summary: string | null;
    url: string;
};

const headers = ['Nom', 'Téléphone', 'E-mail', 'Poste visé'];

// Seuls les caractères d'un numéro sont gardés.
const phone = (value: string | null) =>
    (value ?? '').replace(/[^\d+() .-]/g, '').trim();

// Les données viennent des candidats : une cellule qui commence comme une
// formule est neutralisée.
const safe = (value: string | null) => {
    const text = (value ?? '').replace(/[\t\r\n]+/g, ' ').trim();

    return /^[=+\-@]/.test(text) ? `'${text}` : text;
};

const csvCell = (value: string) =>
    /[";]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;

/**
 * CSV lu tel quel par Excel en français : point-virgule, UTF-8 avec BOM.
 */
export function toCsv(rows: ContactRow[]): string {
    const lines = rows.map((row) => {
        const number = phone(row.phone);

        return [
            safe(row.name),
            // Formule texte : sinon Excel efface le 0 de tête du numéro.
            number ? `="${number}"` : '',
            safe(row.email),
            safe(row.offer),
        ]
            .map(csvCell)
            .join(';');
    });

    return '\uFEFF' + [headers.join(';'), ...lines].join('\r\n');
}

export function downloadCsv(rows: ContactRow[]): void {
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `candidats-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

const escapeHtml = (value: string) =>
    value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');

/**
 * Copie en tableau : collé dans Excel, chaque information tombe dans sa
 * colonne et le téléphone reste du texte ; ailleurs, une ligne par candidat.
 */
export async function copyRows(rows: ContactRow[]): Promise<void> {
    const cells = rows.map((row) => [
        safe(row.name),
        phone(row.phone),
        safe(row.email),
        safe(row.offer),
    ]);
    const text = [headers, ...cells].map((line) => line.join('\t')).join('\n');

    if (typeof ClipboardItem === 'undefined') {
        await navigator.clipboard.writeText(text);

        return;
    }

    const html = `<table><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>${cells
        .map(
            (line) =>
                `<tr>${line
                    .map(
                        (cell, i) =>
                            `<td${i === 1 ? ' style="mso-number-format:\'\\@\'"' : ''}>${escapeHtml(cell)}</td>`,
                    )
                    .join('')}</tr>`,
        )
        .join('')}</table>`;

    await navigator.clipboard.write([
        new ClipboardItem({
            'text/plain': new Blob([text], { type: 'text/plain' }),
            'text/html': new Blob([html], { type: 'text/html' }),
        }),
    ]);
}
