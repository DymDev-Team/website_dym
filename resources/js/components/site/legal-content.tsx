import type { ReactNode } from 'react';

type Block = { type: 'h2'; text: string } | { type: 'ul'; items: string[] } | { type: 'p'; text: string };

// Syntaxe légère des pages légales : « ## Titre », « - élément de liste »,
// paragraphes séparés par une ligne vide.
export function parseLegalBody(body: string): Block[] {
    const blocks: Block[] = [];
    let paragraph: string[] = [];
    let list: string[] = [];

    const flush = () => {
        if (paragraph.length) {
            blocks.push({ type: 'p', text: paragraph.join('\n') });
            paragraph = [];
        }

        if (list.length) {
            blocks.push({ type: 'ul', items: list });
            list = [];
        }
    };

    for (const raw of body.replace(/\r\n/g, '\n').split('\n')) {
        const line = raw.trim();

        if (line === '') {
            flush();
        } else if (line.startsWith('## ')) {
            flush();
            blocks.push({ type: 'h2', text: line.slice(3).trim() });
        } else if (/^[-•]\s+/.test(line)) {
            if (paragraph.length) {
                flush();
            }

            list.push(line.replace(/^[-•]\s+/, ''));
        } else {
            if (list.length) {
                flush();
            }

            paragraph.push(line);
        }
    }

    flush();

    return blocks;
}

// Met en évidence les mentions restant à compléter.
function highlight(text: string): ReactNode {
    return text.split(/(\[à compléter\]|\[[^\]]*à compléter\])/g).map((part, i) =>
        part.includes('à compléter') ? (
            <mark key={i} className="bg-dym/15 px-1 text-dym">
                {part}
            </mark>
        ) : (
            part
        ),
    );
}

export function LegalContent({ body }: { body: string }) {
    return (
        <div className="space-y-5 text-[16px] leading-[1.8] text-neutral-700">
            {parseLegalBody(body).map((block, i) => {
                if (block.type === 'h2') {
                    return (
                        <h2 key={i} className="!mt-12 flex items-center gap-3 font-display text-[clamp(24px,3vw,30px)] leading-tight text-ink uppercase first:!mt-0">
                            <span className="size-[6px] shrink-0 bg-dym" aria-hidden />
                            {block.text}
                        </h2>
                    );
                }

                if (block.type === 'ul') {
                    return (
                        <ul key={i} className="space-y-2">
                            {block.items.map((item, j) => (
                                <li key={j} className="flex gap-3">
                                    <span className="mt-[0.75em] size-[5px] shrink-0 bg-dym" aria-hidden />
                                    <span>{highlight(item)}</span>
                                </li>
                            ))}
                        </ul>
                    );
                }

                return (
                    <p key={i} className="whitespace-pre-line">
                        {highlight(block.text)}
                    </p>
                );
            })}
        </div>
    );
}
