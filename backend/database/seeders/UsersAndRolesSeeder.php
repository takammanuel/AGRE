<?php

namespace Database\Seeders;

use App\Models\ProfilAdministrateur;
use App\Models\ProfilAgentAdministratif;
use App\Models\ProfilEtudiant;
use App\Models\ProfilResponsablePedagogique;
use App\Models\Service;
use App\Models\Utilisateur;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersAndRolesSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'nom' => 'DUPONT',
                'prenom' => 'Alice',
                'email' => 'alice@test.com',
                'password' => Hash::make('password123'),
                'telephone' => '697932976',
                'email_verified_at' => now(),
                'is_active' => true,
                'role' => 'ETUDIANT',
                'profil_data' => [
                    'matricule' => 'ETU2024001',
                    'filiere' => 'Informatique',
                    'niveau' => 3,
                ]
            ],
            [
                'nom' => 'MARTIN',
                'prenom' => 'Bob',
                'email' => 'bob@test.com',
                'password' => Hash::make('password123'),
                'telephone' => '697932977',
                'email_verified_at' => now(),
                'is_active' => true,
                'role' => 'ETUDIANT',
                'profil_data' => [
                    'matricule' => 'ETU2024002',
                    'filiere' => 'Génie Civil',
                    'niveau' => 2,
                ]
            ],
            [
                'nom' => 'DURAND',
                'prenom' => 'Charlie',
                'email' => 'charlie@test.com',
                'password' => Hash::make('password123'),
                'telephone' => '697932978',
                'email_verified_at' => now(),
                'is_active' => true,
                'role' => 'AGENT_ACADEMIQUE',
                'profil_data' => [
                    'poste' => 'Agent de Scolarité',
                ]
            ],
            [
                'nom' => 'LECLERC',
                'prenom' => 'David',
                'email' => 'david@test.com',
                'password' => Hash::make('password123'),
                'telephone' => '697932979',
                'email_verified_at' => now(),
                'is_active' => true,
                'role' => 'RESPONSABLE_PEDAGOGIQUE',
                'profil_data' => [
                    'departement' => 'Département Informatique',
                ]
            ],
            [
                'nom' => 'MOREAU',
                'prenom' => 'Eva',
                'email' => 'eva@test.com',
                'password' => Hash::make('password123'),
                'telephone' => '697932980',
                'email_verified_at' => now(),
                'is_active' => true,
                'role' => 'ADMINISTRATEUR',
                'profil_data' => [
                    'niveau_acces' => 'super_admin',
                ]
            ],
        ];

        foreach ($users as $userData) {
            $role = $userData['role'];
            $profilData = $userData['profil_data'];
            unset($userData['role'], $userData['profil_data']);

            // Créer ou mettre à jour l'utilisateur
            $user = Utilisateur::updateOrCreate(
                ['email' => $userData['email']], // condition unique
                $userData
            );

            // Assigner le rôle (évite doublons)
            $user->assignRole($role);

            // Créer le profil si inexistant
            $this->createProfil($user, $role, $profilData);

            $this->command->info("Utilisateur créé/mis à jour : {$user->email} (Rôle: {$role})");
        }

        $this->command->info(count($users) . " utilisateurs créés/mis à jour avec succès !");
    }

    private function createProfil(Utilisateur $utilisateur, string $role, array $profilData): void
    {
        switch (strtolower($role)) {
            case 'etudiant':
                ProfilEtudiant::updateOrCreate(
                    ['utilisateur_id' => $utilisateur->id],
                    $profilData
                );
                break;

            case 'agent_academique':
                $service = Service::where('nom', 'Service de la Scolarité')->first();
                ProfilAgentAdministratif::updateOrCreate(
                    ['utilisateur_id' => $utilisateur->id],
                    ['poste' => $profilData['poste'], 'service_id' => $service?->id]
                );
                break;

            case 'responsable_pedagogique':
                ProfilResponsablePedagogique::updateOrCreate(
                    ['utilisateur_id' => $utilisateur->id],
                    $profilData
                );
                break;

            case 'administrateur':
                ProfilAdministrateur::updateOrCreate(
                    ['utilisateur_id' => $utilisateur->id],
                    ['niveau_acces' => $profilData['niveau_acces'] ?? 'admin']
                );
                break;
        }
    }
}
