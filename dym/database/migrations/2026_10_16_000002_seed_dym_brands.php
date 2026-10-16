<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Marques de DYM Manufacture, importées ici car le conteneur de prod lance les
// migrations mais pas les seeders. Modifiables ensuite dans /admin/brands.
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $brands = [
            [
                'name' => 'IvoirCuisson',
                'logo' => '/images/marques/ivoircuisson.png',
                'description' => 'Barbecues, fumoirs et foyers conçus et fabriqués en Côte d’Ivoire : l’innovation au service du goût.',
                'website_url' => 'https://ivoircuisson.ci',
                'position' => 1,
            ],
            [
                'name' => 'NovaMec',
                'logo' => '/images/marques/novamec.png',
                'description' => 'Équipements agroalimentaires et agricoles pour producteurs, coopératives et entreprises : broyeurs, unités de transformation et solutions durables.',
                'website_url' => 'https://www.novamec.ci',
                'position' => 2,
            ],
        ];

        foreach ($brands as $brand) {
            DB::table('brands')->updateOrInsert(
                ['name' => $brand['name']],
                [...$brand, 'is_published' => true, 'created_at' => now(), 'updated_at' => now()],
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('brands')->whereIn('name', ['IvoirCuisson', 'NovaMec'])->delete();
    }
};
