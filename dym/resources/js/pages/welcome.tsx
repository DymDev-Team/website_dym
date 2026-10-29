import { Head } from '@inertiajs/react';
import { Activities } from '@/components/site/activities';
import { AnniversaryModal } from '@/components/site/anniversary-modal';
import { Equipment } from '@/components/site/equipment';
import { Hero } from '@/components/site/hero';
import { Intro } from '@/components/site/intro';
import { News } from '@/components/site/news';
import { PageLoader } from '@/components/site/page-loader';
import { Partners } from '@/components/site/partners';
import { Process } from '@/components/site/process';
import { Projects } from '@/components/site/projects';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { Testimonials } from '@/components/site/testimonials';
import type {
    Activity,
    Equipment as EquipmentItem,
    Partner,
    Post,
    Project,
    SiteSettings,
    Testimonial,
} from '@/types/admin';
import { useTexts } from '@/components/site/use-texts';

type Props = {
    activities: Activity[];
    projects: Project[];
    equipment: EquipmentItem[];
    partners: Partner[];
    testimonials: Testimonial[];
    posts: Post[];
    site: SiteSettings;
};

export default function Welcome({
    activities,
    projects,
    equipment,
    partners,
    testimonials,
    posts,
    site,
}: Props) {
    const t = useTexts();

    return (
        <>
            <Head title={t('home.meta.title')}>
                <meta name="description" content={t('home.meta.description')} />
            </Head>

            <div className="bg-paper text-ink">
                <PageLoader />
                <AnniversaryModal />
                <SiteHeader />
                <Hero whatsappUrl={site.whatsapp_url} />

                <Intro />

                <Activities activities={activities} />

                <Process />

                <Projects projects={projects} />

                <Equipment equipment={equipment} />

                <Partners partners={partners} />

                <Testimonials testimonials={testimonials} />

                <News posts={posts} />

                <SiteFooter activities={activities} site={site} />
            </div>
        </>
    );
}
