<?php

namespace Database\Seeders;

use App\Models\ProfilAgentAdministratif;
use App\Models\ProfilEtudiant;
use App\Models\ProfilResponsablePedagogique;
use App\Models\Utilisateur;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProfilSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ====== Profils Étudiants ======
        $etudiants = Utilisateur::whereHas('roles', function($q) {
            $q->where('libelle', 'ETUDIANT');
        })->get();

        foreach ($etudiants as $index => $etudiant) {
            ProfilEtudiant::create([
                'utilisateur_id' => $etudiant->id,
                'matricule' => 'MAT2025' . ($index + 1),
                'niveau' => rand(1, 5),
                'filiere' => 'Informatique',
            ]);
        }

        // ====== Profils Agents Administratifs ======
        $agents = Utilisateur::whereHas('roles', function($q) {
            $q->where('libelle', 'AGENT_ACADEMIQUE');
        })->get();

        foreach ($agents as $agent) {
            ProfilAgentAdministratif::create([
                'utilisateur_id' => $agent->id,
                'poste' => 'Agent académique',
            ]);
        }

        // ====== Profils Responsables Pédagogiques ======
        $responsables = Utilisateur::whereHas('roles', function($q) {
            $q->where('libelle', 'RESPONSABLE_PEDAGOGIQUE');
        })->get();

        foreach ($responsables as $responsable) {
            ProfilResponsablePedagogique::create([
            'utilisateur_id' => $responsable->id,
                'departement' => 'Informatique',
            ]);
        }
    }
}
