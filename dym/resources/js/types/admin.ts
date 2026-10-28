type Timestamps = {
    created_at: string;
    updated_at: string;
};

type Orderable = {
    position: number;
    is_published: boolean;
};

export type Activity = Timestamps &
    Orderable & {
        id: number;
        title: string;
        description: string;
        image: string;
        image_alt: string | null;
        image_url: string | null;
        detail_content: string | null;
        detail_image: string | null;
        detail_image_url: string | null;
        detail_image_alt: string | null;
    };

export type Project = Timestamps &
    Orderable & {
        id: number;
        title: string;
        category: string;
        description: string | null;
        image: string;
        image_url: string | null;
    };

export type Equipment = Timestamps &
    Orderable & {
        id: number;
        name: string;
        description: string;
        image: string;
        image_url: string | null;
    };

export type Partner = Timestamps &
    Orderable & {
        id: number;
        name: string;
        logo: string;
        logo_url: string | null;
        website_url: string | null;
    };

export type Brand = Timestamps &
    Orderable & {
        id: number;
        name: string;
        logo: string;
        logo_url: string | null;
        description: string | null;
        website_url: string | null;
    };

export type Testimonial = Timestamps &
    Orderable & {
        id: number;
        quote: string;
        author: string;
        role: string | null;
        project: string | null;
        image: string | null;
        image_url: string | null;
    };

export type Post = Timestamps & {
    id: number;
    title: string;
    slug: string;
    category: string;
    excerpt: string | null;
    body: string | null;
    image: string;
    image_url: string | null;
    published_at: string | null;
};

export type SiteSettings = {
    logo_path?: string | null;
    logo_url: string | null;
    section_colors: Record<string, string>;
    label_color: string | null;
    tagline: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    linkedin_url: string | null;
    facebook_url: string | null;
    whatsapp_url: string | null;
    instagram_url: string | null;
    youtube_url: string | null;
};

export type AdminUser = {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    email_verified_at: string | null;
    created_at: string;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export type JobOffer = Timestamps & {
    id: number;
    title: string;
    slug: string;
    department: string | null;
    location: string;
    contract_type: string;
    summary: string | null;
    description: string | null;
    requirements: string | null;
    closes_at: string | null;
    is_published: boolean;
    // Grille d'évaluation : seulement dans l'admin, jamais envoyée au site.
    criteria?: Criterion[] | null;
    questions?: OfferQuestion[] | null;
    applications_count?: number;
    matches_count?: number;
};

export type Criterion = { name: string; weight: number; essential: boolean };

export type QuestionType = 'text' | 'textarea' | 'choice' | 'yes_no' | 'number';

export type OfferQuestion = {
    id: string;
    label: string;
    type: QuestionType;
    options: string[];
    required: boolean;
};

export type SourcingMatch = {
    id: number;
    score: number;
    reason: string;
    updated_at: string;
    candidate: {
        id: number;
        display_name: string;
        location: string | null;
        years_experience: number | null;
        summary: string | null;
        skills: string[];
        job_family: string | null;
        seniority: string | null;
        application_id: number | null;
    };
};

export type QuoteStatus = 'new' | 'in_progress' | 'quoted' | 'won' | 'lost';

export type QuoteStatusOption = { value: QuoteStatus; label: string };

export type QuoteRequest = Timestamps & {
    id: number;
    name: string;
    company: string | null;
    email: string;
    phone: string;
    activity: string | null;
    message: string;
    deadline: string | null;
    attachment_name: string | null;
    status: QuoteStatus;
};

// --- Recrutement (ATS) -------------------------------------------------

export type Option = { value: string; label: string };

export type StageKind = 'open' | 'hired' | 'rejected';

export type RecruitmentStage = {
    id: number;
    name: string;
    color: string;
    kind: StageKind;
};

export type Recommendation = 'priority' | 'consider' | 'not_matching';

export type AnalysisStatus =
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'skipped';

export type Labelled = { id: number; label: string };

export type PipelineCard = {
    id: number;
    stage_id: number;
    score: number | null;
    recommendation: Recommendation | null;
    viewed: boolean;
    created_at: string;
    analysis_status: AnalysisStatus | null;
    offer: string | null;
    candidate: {
        name: string;
        summary: string | null;
        job_family: string | null;
        seniority: string | null;
        years_experience: number | null;
    };
};

export type PipelineStage = RecruitmentStage & {
    total: number;
    applications: PipelineCard[];
};

export type AnalysisResult = {
    profile: {
        name: string | null;
        email: string | null;
        phone: string | null;
        location: string | null;
        headline: string | null;
        years_experience: number | null;
        seniority: string | null;
        job_family: string | null;
        skills: string[];
        languages: string[];
        certifications: string[];
        education: {
            degree: string;
            institution: string | null;
            year: string | null;
        }[];
        experiences: {
            title: string;
            company: string | null;
            period: string | null;
            highlights: string | null;
        }[];
    };
    summary: string;
    evaluation: {
        score: number;
        // Note proposée par le modèle, avant le calcul sur la grille.
        model_score?: number;
        recommendation: Recommendation;
        criteria: { name: string; score: number; evidence: string }[];
        strengths: string[];
        concerns: string[];
        interview_questions: string[];
    } | null;
    offer_matches: { offer_id: number; score: number; reason: string }[];
    // Absents des analyses faites avant leur introduction.
    research?: {
        subject: string;
        kind: 'school' | 'company' | 'other';
        finding: string;
        source_url: string | null;
    }[];
    assessment?: {
        overall: string;
        strengths: string[];
        concerns: string[];
        suggested_roles: string[];
    };
    warnings: string[];
};

export type ApplicationEvent = {
    id: number;
    type:
        | 'received'
        | 'added_manually'
        | 'sourced'
        | 'stage_changed'
        | 'note'
        | 'analysis_requested'
        | 'analysis_completed'
        | 'analysis_failed'
        | 'candidate_merged';
    data: Record<string, string | number | null> | null;
    user: string | null;
    created_at: string;
};

export type ApplicationFile = {
    id: number;
    job_offer_id: number | null;
    stage_id: number;
    source_id: number | null;
    message: string | null;
    answers: { id: string; label: string; answer: string }[] | null;
    cv_name: string;
    cv_mime: string | null;
    score: number | null;
    recommendation: Recommendation | null;
    created_at: string;
    candidate: {
        id: number;
        name: string | null;
        email: string | null;
        phone: string | null;
        location: string | null;
        display_name: string;
        years_experience: number | null;
        skills: string[] | null;
        profile: Pick<
            AnalysisResult['profile'],
            | 'headline'
            | 'languages'
            | 'certifications'
            | 'education'
            | 'experiences'
        > | null;
        summary: string | null;
        seniority: string | null;
        job_family: string | null;
    };
    job_offer: Pick<JobOffer, 'id' | 'title' | 'slug'> | null;
    source: string | null;
    added_by: string | null;
    // Dernière analyse réussie : reste affichée pendant une nouvelle analyse.
    analysis: {
        id: number;
        result: AnalysisResult | null;
        model: string | null;
        job_offer_id: number | null;
        offer: string | null;
        cost: number;
        finished_at: string | null;
    } | null;
    // Tentative plus récente que cette analyse (en cours, échouée, ignorée).
    latest_attempt: {
        id: number;
        status: AnalysisStatus;
        status_label: string;
        error: string | null;
        attempts: number;
    } | null;
    other_applications: {
        id: number;
        offer: string | null;
        stage: Pick<RecruitmentStage, 'name' | 'color'>;
        score: number | null;
        created_at: string;
    }[];
    events: ApplicationEvent[];
};

export type CandidateRow = {
    id: number;
    display_name: string;
    email: string | null;
    phone: string | null;
    location: string | null;
    years_experience: number | null;
    summary: string | null;
    skills: string[];
    seniority: string | null;
    job_family: string | null;
    applications: {
        id: number;
        offer: string | null;
        stage: Pick<RecruitmentStage, 'name' | 'color'>;
        score: number | null;
    }[];
};

// Image de la médiathèque (App\Support\MediaLibrary). « path » est la valeur
// enregistrée : « /images/… » (fournie avec le site) ou « media/… » (envoyée).
export type MediaItem = {
    path: string;
    url: string;
    name: string;
    folder: string;
    source: 'site' | 'upload';
    size: number;
    modified: number;
    used_by: string[];
};
