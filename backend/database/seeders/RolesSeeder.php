<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::insert([
            ['libelle' => 'ETUDIANT', 'description' => 'Rôle d\'un étudiant'],
            ['libelle' => 'AGENT_ACADEMIQUE', 'description' => 'Rôle d\'un agent académique'],
            ['libelle' => 'RESPONSABLE_PEDAGOGIQUE', 'description' => 'Rôle d\'un responsable pédagogique'],
            ['libelle' => 'ADMINISTRATEUR', 'description' => 'Rôle d\'un administrateur'],
        ]);
    }
}
