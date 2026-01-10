<?php

namespace Database\Seeders;

use App\Models\Etat;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EtatsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Etat::insert([
            ['libelle' => 'EN_ATTENTE'],
            ['libelle' => 'AFFECTEE'],
            ['libelle' => 'EN_COURS'],
            ['libelle' => 'TRAITEE'],
            ['libelle' => 'REJETEE'],
            ['libelle' => 'INFORMATIONS_REQUISES'],
            ['libelle' => 'EN_ATTENTE_APPROBATION'],
        ]);
    }
}
