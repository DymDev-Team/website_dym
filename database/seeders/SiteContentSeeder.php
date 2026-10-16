<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\Equipment;
use App\Models\Partner;
use App\Models\Post;
use App\Models\Project;
use App\Models\Testimonial;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;

/**
 * Initial content of the public site (images shipped in public/images).
 *
 * Each table is only filled when empty, so it is safe to run again.
 */
class SiteContentSeeder extends Seeder
{
    /**
     * Seed the site content.
     */
    public function run(): void
    {
        $this->fill(Activity::class, [
            ['title' => 'Chaudronnerie industrielle', 'description' => 'Cuiseurs, séchoirs, semouleuses et ensembles soudés pour l’agro-industrie et l’industrie.', 'image' => '/images/activites/chaudronnerie.jpg', 'image_alt' => 'Semouleuse bleue fabriquée par DYM'],
            ['title' => 'Usinage métallique', 'description' => 'Pièces mécaniques de précision en tournage et fraisage, contrôlées au micron.', 'image' => '/images/activites/usinage.jpg', 'image_alt' => 'Contrôle d’une pièce usinée au pied à coulisse'],
            ['title' => 'Menuiserie métallique', 'description' => 'Escaliers, garde-corps, portails, pergolas et structures sur mesure.', 'image' => '/images/activites/menuiserie.jpg', 'image_alt' => 'Escalier hélicoïdal en métal découpé au laser'],
            ['title' => 'Art & décoration métallique', 'description' => 'Claustras, tableaux et mobilier découpés au laser pour habiller vos espaces.', 'image' => '/images/activites/art-deco.jpg', 'image_alt' => 'Tableau décoratif en métal découpé représentant un arbre'],
        ]);

        $this->fill(Project::class, array_map(fn (array $p) => [
            'title' => $p[0],
            'category' => $p[1],
            'image' => '/images/realisations/'.$p[2],
        ], [
            ['Pergola en claustra', 'Menuiserie métallique', 'pergola.jpg'],
            ['Portail décoratif', 'Art & décoration', 'portail-claustra.jpg'],
            ['Terrasse couverte', 'Menuiserie métallique', 'terrasse.jpg'],
            ['Façade perforée', 'Habillage de façade', 'facade-perforee.jpg'],
            ['Garde-corps végétal', 'Art & décoration', 'garde-corps.jpg'],
            ['Semouleuses en série', 'Chaudronnerie', 'semouleuses.jpg'],
            ['Portes d’entrée', 'Menuiserie métallique', 'portes.jpg'],
            ['Table papillon', 'Mobilier découpé', 'table-deco.jpg'],
            ['Marquise d’entrée', 'Menuiserie métallique', 'marquise.jpg'],
            ['Brise-soleil d’immeuble', 'Habillage de façade', 'facade-immeuble.jpg'],
        ]));

        $this->fill(Equipment::class, [
            ['name' => 'Découpe laser', 'description' => 'Découpe fine de tôles acier, inox et aluminium, motifs décoratifs compris.', 'image' => '/images/equipements/decoupe-laser.jpg'],
            ['name' => 'Pliage CNC', 'description' => 'Plieuses à commande numérique pour des angles nets et répétables.', 'image' => '/images/equipements/pliage-cnc.jpg'],
            ['name' => 'Usinage de précision', 'description' => 'Tours et centres d’usinage CNC pour des pièces au micron.', 'image' => '/images/equipements/usinage.jpg'],
            ['name' => 'Soudure haute qualité', 'description' => 'Postes MIG, TIG et à l’arc, mis en œuvre par des soudeurs qualifiés.', 'image' => '/images/equipements/soudure.jpg'],
        ]);

        $this->fill(Partner::class, array_map(fn (array $p) => [
            'name' => $p[1],
            'logo' => '/images/partenaires/'.$p[0],
        ], [
            ['1.png', 'GESTOCI'],
            ['2.png', 'Ministère de l’Éducation nationale'],
            ['3.png', 'Commune de Cocody'],
            ['4.png', 'ANADER'],
            ['5.png', 'FIDRA'],
            ['6.png', 'BIA'],
            ['7.png', 'PETROCI'],
        ]));

        // Textes d'exemple : à remplacer par de vrais témoignages depuis l'admin.
        $this->fill(Testimonial::class, [
            ['quote' => 'Une équipe à l’écoute, des plans clairs dès le départ et une pergola posée dans les délais. Le rendu du métal découpé dépasse nos attentes.', 'author' => 'Client particulier', 'role' => 'Villa — Cocody', 'project' => 'Pergola en claustra', 'image' => '/images/realisations/pergola.jpg'],
            ['quote' => 'DYM a fabriqué nos semouleuses en série avec un suivi rigoureux. Les machines tournent tous les jours depuis leur livraison.', 'author' => 'Responsable de production', 'role' => 'Agro-industrie', 'project' => 'Machines agricoles', 'image' => '/images/realisations/semouleuses.jpg'],
            ['quote' => 'Réactivité, précision et respect du cahier des charges : un partenaire fiable pour l’habillage de notre façade.', 'author' => 'Directeur technique', 'role' => 'Promotion immobilière', 'project' => 'Façade perforée', 'image' => '/images/realisations/facade-perforee.jpg'],
        ]);

        if (Post::query()->doesntExist()) {
            $posts = [
                ['Chantier', 'Portails de l’École de gendarmerie d’Abidjan', 'portail-gendarmerie.jpg'],
                ['Événement', 'Nos machines agricoles présentées en salon', 'salon-machines.jpg'],
                ['Réalisation', 'Escalier hélicoïdal découpé pour Mi Sôa', 'escalier-mi-soa.jpg'],
                ['Réalisation', 'Garde-corps et brise-soleil pour un immeuble', 'immeuble-garde-corps.jpg'],
            ];

            foreach ($posts as $i => [$category, $title, $image]) {
                Post::query()->create([
                    'category' => $category,
                    'title' => $title,
                    'image' => '/images/actualites/'.$image,
                    'published_at' => now()->subDays($i),
                ]);
            }
        }
    }

    /**
     * Insert rows in order when the table is still empty.
     *
     * @param  class-string<Model>  $model
     * @param  array<int, array<string, mixed>>  $rows
     */
    private function fill(string $model, array $rows): void
    {
        if ($model::query()->exists()) {
            return;
        }

        foreach ($rows as $position => $row) {
            $model::query()->create([...$row, 'position' => $position + 1]);
        }
    }
}
