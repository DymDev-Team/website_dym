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
    applications_count?: number;
};

export type ApplicationStatus =
    | 'new'
    | 'reviewing'
    | 'interview'
    | 'rejected'
    | 'hired';

export type StatusOption = { value: ApplicationStatus; label: string };

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

export type JobApplication = Timestamps & {
    id: number;
    job_offer_id: number | null;
    name: string;
    email: string;
    phone: string | null;
    message: string | null;
    cv_name: string;
    status: ApplicationStatus;
    job_offer: Pick<JobOffer, 'id' | 'title' | 'slug'> | null;
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
