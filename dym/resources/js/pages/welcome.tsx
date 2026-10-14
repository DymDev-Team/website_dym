import { Head } from '@inertiajs/react';
import { Activities } from '@/components/site/activities';
import { Equipment } from '@/components/site/equipment';
import { Hero } from '@/components/site/hero';
import { Intro } from '@/components/site/intro';
import { News } from '@/components/site/news';
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
    return (
        <>
            <Head title="DYM Manufacture — Le métal, de l'idée à la matière" />

            <div className="bg-paper text-ink">
                <SiteHeader />
                <Hero />

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
