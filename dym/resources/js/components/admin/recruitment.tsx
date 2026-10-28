import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { next } from '@/routes/admin/recruitment/analyses';
import type { AnalysisStatus, Recommendation } from '@/types/admin';

export const recommendationLabels: Record<Recommendation, string> = {
    priority: 'À rencontrer en priorité',
    consider: 'À étudier',
    not_matching: 'Ne correspond pas',
};

const recommendationStyles: Record<Recommendation, string> = {
    priority:
        'border-emerald-600/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    consider:
        'border-amber-600/30 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    not_matching: 'border-border bg-muted text-muted-foreground',
};

export const seniorityLabels: Record<string, string> = {
    junior: 'Débutant',
    intermediate: 'Confirmé',
    senior: 'Senior',
    expert: 'Expert',
};

// Couleur d'une note sur 100 : vert, ambre ou gris.
function scoreTone(score: number) {
    if (score >= 75) {
        return 'bg-emerald-600 text-white';
    }

    if (score >= 50) {
        return 'bg-amber-500 text-white';
    }

    return 'bg-muted text-muted-foreground';
}

export function ScoreBadge({
    score,
    size = 'sm',
}: {
    score: number | null;
    size?: 'sm' | 'lg';
}) {
    if (score === null) {
        return null;
    }

    return (
        <span
            title={`Adéquation au poste : ${score} / 100`}
            className={cn(
                'inline-grid shrink-0 place-items-center rounded-md font-semibold tabular-nums',
                size === 'lg'
                    ? 'size-16 text-2xl'
                    : 'h-6 min-w-9 px-1.5 text-xs',
                scoreTone(score),
            )}
        >
            {score}
        </span>
    );
}

export function RecommendationBadge({
    recommendation,
}: {
    recommendation: Recommendation | null;
}) {
    if (recommendation === null) {
        return null;
    }

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
                recommendationStyles[recommendation],
            )}
        >
            {recommendationLabels[recommendation]}
        </span>
    );
}

export function StageDot({ color }: { color: string }) {
    return (
        <span
            className="inline-block size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
        />
    );
}

export function AnalysisPending({ status }: { status: AnalysisStatus | null }) {
    if (status !== 'pending' && status !== 'processing') {
        return null;
    }

    return (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            {status === 'processing'
                ? 'Analyse en cours'
                : 'En attente d’analyse'}
        </span>
    );
}

// Jeton CSRF lu dans le cookie posé par Laravel, pour les envois hors Inertia.
function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

export async function postJson<T>(url: string, body?: FormData): Promise<T> {
    const response = await fetch(url, {
        method: 'POST',
        body,
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': xsrfToken(),
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const errors = (data as { errors?: Record<string, string[]> }).errors;
        const message =
            (errors && Object.values(errors)[0]?.[0]) ||
            (data as { message?: string }).message ||
            `Erreur ${response.status}`;

        throw new Error(message);
    }

    return data as T;
}

export type NextAnalysis = {
    processed: { id: number; status: string; error: string | null } | null;
    remaining: number;
    active: number;
    blocked: string | null;
};

export function runNextAnalysis(analysisId?: number): Promise<NextAnalysis> {
    const body = new FormData();

    if (analysisId) {
        body.append('analysis_id', String(analysisId));
    }

    return postJson<NextAnalysis>(next.url(), body);
}

const wait = (ms: number) =>
    new Promise((resolve) => window.setTimeout(resolve, ms));

// Fait avancer les analyses tant que la page est ouverte : une requête à la
// fois, chacune analyse un CV. Le serveur n'a besoin ni de cron ni de worker.
export function useAnalysisDriver(
    enabled: boolean,
    onProcessed: () => void,
    analysisId?: number,
) {
    const callback = useRef(onProcessed);

    useEffect(() => {
        callback.current = onProcessed;
    });

    useEffect(() => {
        if (!enabled) {
            return;
        }

        let cancelled = false;

        const drive = async () => {
            while (!cancelled) {
                let result: NextAnalysis | null = null;

                try {
                    result = await runNextAnalysis(analysisId);
                } catch {
                    // Coupure réseau ou erreur serveur : nouvel essai plus tard.
                }

                if (cancelled) {
                    return;
                }

                if (result?.processed) {
                    callback.current();
                    continue;
                }

                if (result?.blocked || result?.active === 0) {
                    return;
                }

                // Rien à lancer : une analyse tourne déjà ailleurs.
                await wait(10_000);
            }
        };

        void drive();

        return () => {
            cancelled = true;
        };
    }, [enabled, analysisId]);
}
