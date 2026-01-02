<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            ['nom' => 'Étudiant', 'libelle' => 'ETUDIANT', 'description' => "Rôle d'un étudiant"],
            ['nom' => 'Agent Académique', 'libelle' => 'AGENT_ACADEMIQUE', 'description' => "Rôle d'un agent académique"],
            ['nom' => 'Responsable Pédagogique', 'libelle' => 'RESPONSABLE_PEDAGOGIQUE', 'description' => "Rôle d'un responsable pédagogique"],
            ['nom' => 'Administrateur', 'libelle' => 'ADMINISTRATEUR', 'description' => "Rôle d'un administrateur"],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['nom' => $role['nom']], // condition unique
                ['libelle' => $role['libelle'], 'description' => $role['description']]
            );
        }
    }
}
