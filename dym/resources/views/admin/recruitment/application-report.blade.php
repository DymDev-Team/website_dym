@php
    $evaluation = $result['evaluation'] ?? null;
    $profile = $result['profile'] ?? [];
    $assessment = $result['assessment'] ?? null;
    $recommendations = [
        'priority' => ['À rencontrer en priorité', 'positive'],
        'consider' => ['À étudier', 'neutral'],
        'not_matching' => ['Ne correspond pas', 'negative'],
    ];
    [$recommendationLabel, $recommendationTone] = $recommendations[$evaluation['recommendation'] ?? ''] ?? ['Avis non défini', 'neutral'];
@endphp
<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Analyse IA - {{ $application->candidate->display_name }}</title>
    <style>
        @page { margin: 38pt 42pt 52pt; }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            color: #25231f;
            font-family: "DejaVu Sans", sans-serif;
            font-size: 9.3pt;
            line-height: 1.45;
        }
        h1, h2, h3, p { margin-top: 0; }
        h1 { margin-bottom: 4pt; font-size: 22pt; line-height: 1.15; letter-spacing: -0.4pt; }
        h2 {
            margin: 0 0 11pt;
            padding-bottom: 5pt;
            border-bottom: 1.5pt solid #c8a96a;
            color: #171713;
            font-size: 13pt;
        }
        h3 { margin-bottom: 4pt; font-size: 9.5pt; }
        p { margin-bottom: 7pt; }
        ul { margin: 3pt 0 0; padding-left: 15pt; }
        li { margin-bottom: 3pt; }
        .header {
            margin-bottom: 18pt;
            padding-bottom: 11pt;
            border-bottom: 2pt solid #171713;
        }
        .header-table { width: 100%; border-collapse: collapse; }
        .header-table td { padding: 0; vertical-align: middle; }
        .header-table td:last-child { text-align: right; }
        .brand { color: #171713; font-size: 16pt; font-weight: bold; letter-spacing: 1.3pt; }
        .brand-accent { color: #b18d49; }
        .document-label { color: #6f6b63; font-size: 7.5pt; letter-spacing: 0.7pt; text-transform: uppercase; }
        .eyebrow { margin-bottom: 5pt; color: #8c6c32; font-size: 8pt; font-weight: bold; letter-spacing: 0.8pt; text-transform: uppercase; }
        .subtitle { color: #67635c; font-size: 10pt; }
        .meta { width: 100%; margin: 14pt 0 18pt; border-collapse: collapse; }
        .meta td { width: 25%; padding: 8pt 9pt; border: 1pt solid #dedbd4; vertical-align: top; }
        .meta-label { display: block; margin-bottom: 2pt; color: #77726a; font-size: 7pt; text-transform: uppercase; }
        .meta-value { font-weight: bold; }
        .score-card { width: 100%; margin-bottom: 16pt; border-collapse: collapse; background: #f5f2eb; }
        .score-card td { padding: 12pt; vertical-align: middle; }
        .score-box { width: 76pt; border-right: 1pt solid #d8d3c9; text-align: center; }
        .score-number { color: #9b7738; font-size: 27pt; font-weight: bold; line-height: 1; }
        .score-denominator { color: #77726a; font-size: 8pt; }
        .badge { display: inline-block; margin-bottom: 5pt; padding: 3pt 7pt; border-radius: 10pt; font-size: 7.5pt; font-weight: bold; }
        .badge.positive { color: #1f633d; background: #dcefe4; }
        .badge.neutral { color: #73591f; background: #f1e7c8; }
        .badge.negative { color: #8c2f2b; background: #f5dedd; }
        .notice { margin-bottom: 14pt; padding: 9pt 11pt; border-left: 3pt solid #c48724; background: #fff4dc; color: #634716; }
        .section { margin-bottom: 17pt; }
        .keep { page-break-inside: avoid; }
        .criterion { margin-bottom: 10pt; page-break-inside: avoid; }
        .criterion-head { width: 100%; border-collapse: collapse; }
        .criterion-head td { padding: 0 0 3pt; }
        .criterion-score { width: 50pt; color: #6f6b63; text-align: right; }
        .bar { height: 5pt; margin-bottom: 3pt; background: #e7e4de; }
        .bar-fill { height: 5pt; background: #b18d49; }
        .evidence { margin: 0; color: #6b665e; font-size: 8.2pt; }
        .columns { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .columns td { width: 50%; padding: 0 12pt 0 0; vertical-align: top; }
        .columns td + td { padding: 0 0 0 12pt; border-left: 1pt solid #dedbd4; }
        .panel { margin-bottom: 12pt; padding: 11pt 12pt; background: #f5f2eb; page-break-inside: avoid; }
        .chips { margin-top: 5pt; }
        .chip { display: inline-block; margin: 0 3pt 4pt 0; padding: 3pt 6pt; background: #e9e5dc; font-size: 7.8pt; }
        .timeline { margin: 0; padding: 0; list-style: none; }
        .timeline li { margin-bottom: 10pt; padding-left: 10pt; border-left: 2pt solid #c8a96a; page-break-inside: avoid; }
        .muted { color: #6f6b63; }
        .small { font-size: 8pt; }
        .page-break { page-break-before: always; }
        .footer {
            position: fixed;
            right: 0;
            bottom: -32pt;
            left: 0;
            padding-top: 6pt;
            border-top: 0.6pt solid #d8d3c9;
            color: #77726a;
            font-size: 7.5pt;
        }
        .footer-right { float: right; margin-right: 78pt; }
        a { color: #795b28; text-decoration: none; }
    </style>
</head>
<body>
    <div class="footer">
        <span>Document confidentiel - Analyse d'aide à la décision</span>
        <span class="footer-right">DYM Recrutement</span>
    </div>

    <div class="header">
        <table class="header-table"><tr>
            <td><span class="brand">DYM<span class="brand-accent">.</span></span></td>
            <td><span class="document-label">Rapport d'analyse candidat</span></td>
        </tr></table>
    </div>

    <div class="eyebrow">Analyse générée par intelligence artificielle</div>
    <h1>{{ $application->candidate->display_name }}</h1>
    <p class="subtitle">
        {{ $profile['headline'] ?? $application->candidate->summary ?? 'Profil candidat' }}
    </p>

    <table class="meta">
        <tr>
            <td><span class="meta-label">Poste analysé</span><span class="meta-value">{{ $analysis->jobOffer?->title ?? 'Candidature spontanée' }}</span></td>
            <td><span class="meta-label">Expérience</span><span class="meta-value">{{ isset($profile['years_experience']) ? $profile['years_experience'].' an(s)' : 'Non précisée' }}</span></td>
            <td><span class="meta-label">Localisation</span><span class="meta-value">{{ $profile['location'] ?? $application->candidate->location ?? 'Non précisée' }}</span></td>
            <td><span class="meta-label">Analyse terminée</span><span class="meta-value">{{ $analysis->finished_at?->format('d/m/Y à H:i') ?? 'Non précisée' }}</span></td>
        </tr>
    </table>

    @if ($evaluation)
        <table class="score-card keep">
            <tr>
                <td class="score-box">
                    <div class="score-number">{{ $evaluation['score'] }}</div>
                    <div class="score-denominator">sur 100</div>
                </td>
                <td>
                    <span class="badge {{ $recommendationTone }}">{{ $recommendationLabel }}</span>
                    <p style="margin: 0;">{{ $result['summary'] }}</p>
                </td>
            </tr>
        </table>
    @else
        <div class="panel"><strong>Synthèse</strong><br>{{ $result['summary'] }}</div>
    @endif

    @if (! empty($result['warnings']))
        <div class="notice keep">
            <strong>Points d'attention sur les données analysées</strong>
            <ul>
                @foreach ($result['warnings'] as $warning)
                    <li>{{ $warning }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    @if ($evaluation)
        <div class="section">
            <h2>Grille d'évaluation</h2>
            @foreach ($evaluation['criteria'] as $criterion)
                <div class="criterion">
                    <table class="criterion-head">
                        <tr>
                            <td><strong>{{ $criterion['name'] }}</strong></td>
                            <td class="criterion-score">{{ $criterion['score'] }} / 10</td>
                        </tr>
                    </table>
                    <div class="bar"><div class="bar-fill" style="width: {{ $criterion['score'] * 10 }}%;"></div></div>
                    <p class="evidence">{{ $criterion['evidence'] }}</p>
                </div>
            @endforeach
            @if (isset($evaluation['model_score']) && $evaluation['model_score'] !== $evaluation['score'])
                <p class="small muted">Note calculée sur la grille de l'offre (estimation directe de l'IA : {{ $evaluation['model_score'] }} / 100).</p>
            @endif
        </div>
    @endif

    <div class="page-break"></div>
    <div class="header">
        <table class="header-table"><tr>
            <td><span class="brand">DYM<span class="brand-accent">.</span></span></td>
            <td><span class="document-label">Synthèse et entretien</span></td>
        </tr></table>
    </div>

    @if ($assessment)
        <div class="section">
            <h2>Avis général</h2>
            <div class="panel">{{ $assessment['overall'] }}</div>
            <table class="columns">
                <tr>
                    <td>
                        <h3>Atouts</h3>
                        <ul>
                            @forelse ($assessment['strengths'] as $item)<li>{{ $item }}</li>@empty<li class="muted">Aucun élément renseigné.</li>@endforelse
                        </ul>
                    </td>
                    <td>
                        <h3>Réserves</h3>
                        <ul>
                            @forelse ($assessment['concerns'] as $item)<li>{{ $item }}</li>@empty<li class="muted">Aucun élément renseigné.</li>@endforelse
                        </ul>
                    </td>
                </tr>
            </table>
            @if (! empty($assessment['suggested_roles']))
                <div class="keep" style="margin-top: 12pt;">
                    <h3>Postes suggérés</h3>
                    <div class="chips">@foreach ($assessment['suggested_roles'] as $role)<span class="chip">{{ $role }}</span>@endforeach</div>
                </div>
            @endif
        </div>
    @endif

    @if ($evaluation)
        <div class="section">
            <h2>Décision et préparation de l'entretien</h2>
            <table class="columns">
                <tr>
                    <td>
                        <h3>Points forts pour le poste</h3>
                        <ul>@forelse ($evaluation['strengths'] as $item)<li>{{ $item }}</li>@empty<li class="muted">Aucun élément renseigné.</li>@endforelse</ul>
                    </td>
                    <td>
                        <h3>Points à vérifier</h3>
                        <ul>@forelse ($evaluation['concerns'] as $item)<li>{{ $item }}</li>@empty<li class="muted">Aucun élément renseigné.</li>@endforelse</ul>
                    </td>
                </tr>
            </table>
            @if (! empty($evaluation['interview_questions']))
                <div style="margin-top: 14pt;">
                    <h3>Questions d'entretien suggérées</h3>
                    <ol>
                        @foreach ($evaluation['interview_questions'] as $question)<li>{{ $question }}</li>@endforeach
                    </ol>
                </div>
            @endif
        </div>
    @endif

    @if (! empty($result['offer_matches']))
        <div class="section">
            <h2>Autres postes compatibles</h2>
            @foreach ($result['offer_matches'] as $match)
                <div class="panel">
                    <strong>{{ $matchedOffers[$match['offer_id']] ?? 'Offre archivée' }} - {{ $match['score'] }} / 100</strong><br>
                    {{ $match['reason'] }}
                </div>
            @endforeach
        </div>
    @endif

    <div class="page-break"></div>
    <div class="header">
        <table class="header-table"><tr>
            <td><span class="brand">DYM<span class="brand-accent">.</span></span></td>
            <td><span class="document-label">Profil extrait du CV</span></td>
        </tr></table>
    </div>

    <div class="section">
        <h2>Profil professionnel</h2>
        <table class="meta">
            <tr>
                <td><span class="meta-label">Famille de métier</span><span class="meta-value">{{ $profile['job_family'] ?? 'Non précisée' }}</span></td>
                <td><span class="meta-label">Niveau</span><span class="meta-value">{{ $application->candidate->seniority?->label() ?? ($profile['seniority'] ?? 'Non précisé') }}</span></td>
                <td><span class="meta-label">E-mail</span><span class="meta-value">{{ $profile['email'] ?? $application->candidate->email ?? 'Non précisé' }}</span></td>
                <td><span class="meta-label">Téléphone</span><span class="meta-value">{{ $profile['phone'] ?? $application->candidate->phone ?? 'Non précisé' }}</span></td>
            </tr>
        </table>
        @if (! empty($profile['skills']))
            <h3>Compétences identifiées</h3>
            <div class="chips">@foreach ($profile['skills'] as $skill)<span class="chip">{{ $skill }}</span>@endforeach</div>
        @endif
    </div>

    @if (! empty($profile['experiences']))
        <div class="section">
            <h2>Expériences</h2>
            <ul class="timeline">
                @foreach ($profile['experiences'] as $experience)
                    <li>
                        <strong>{{ $experience['title'] }}</strong>@if (! empty($experience['company'])) - {{ $experience['company'] }}@endif
                        @if (! empty($experience['period']))<div class="small muted">{{ $experience['period'] }}</div>@endif
                        @if (! empty($experience['highlights']))<p style="margin: 3pt 0 0;">{{ $experience['highlights'] }}</p>@endif
                    </li>
                @endforeach
            </ul>
        </div>
    @endif

    @if (! empty($profile['education']) || ! empty($profile['certifications']))
        <div class="section">
            <h2>Formation et certifications</h2>
            @if (! empty($profile['education']))
                <ul>
                    @foreach ($profile['education'] as $education)
                        <li><strong>{{ $education['degree'] }}</strong>@if (! empty($education['institution'])) - {{ $education['institution'] }}@endif @if (! empty($education['year']))({{ $education['year'] }})@endif</li>
                    @endforeach
                </ul>
            @endif
            @if (! empty($profile['certifications']))
                <h3 style="margin-top: 10pt;">Certifications</h3>
                <ul>@foreach ($profile['certifications'] as $certification)<li>{{ $certification }}</li>@endforeach</ul>
            @endif
        </div>
    @endif

    @if (! empty($profile['languages']))
        <div class="section keep">
            <h2>Langues</h2>
            <ul>@foreach ($profile['languages'] as $language)<li>{{ $language }}</li>@endforeach</ul>
        </div>
    @endif

    @if (! empty($result['research']))
        <div class="section">
            <h2>Recherches sur le parcours</h2>
            @foreach ($result['research'] as $item)
                <div class="panel">
                    <strong>{{ $item['subject'] }}</strong>
                    <span class="small muted">({{ $item['kind'] === 'school' ? 'formation' : ($item['kind'] === 'company' ? 'entreprise' : 'organisme') }})</span><br>
                    {{ $item['finding'] }}
                    @if (! empty($item['source_url']))<br><a href="{{ $item['source_url'] }}">{{ $item['source_url'] }}</a>@endif
                </div>
            @endforeach
        </div>
    @endif

    <div class="panel small muted">
        <strong>Note importante</strong><br>
        Cette analyse constitue une aide à la lecture du CV. Elle ne remplace ni l'entretien, ni la vérification des références et justificatifs, ni la décision de l'équipe de recrutement. Modèle utilisé : {{ $analysis->model ?? 'non précisé' }}.
    </div>
</body>
</html>
