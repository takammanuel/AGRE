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
                'nom' => 'TETCHOUP',
                'prenom' => 'Steve',
                'email' => 'tetchoup@gmail.com',
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
                'nom' => 'TAKAM',
                'prenom' => 'Manuel',
                'email' => 'takam@gmail.com',
                'password' => Hash::make('password123'),
                'telephone' => '697932978',
                'email_verified_at' => now(),
                'is_active' => true,
                'role' => 'AGENT_ACADEMIQUE',
                'profil_data' => [
                    'poste' => 'Agent de Scolarité',
                    'service' => 'Service de la Scolarité',
                ]
            ],
            [
                'nom' => 'AMINA',
                'prenom' => 'Sandrine',
                'email' => 'amina@gmail.com',
                'password' => Hash::make('password123'),
                'telephone' => '697932978',
                'email_verified_at' => now(),
                'is_active' => true,
                'role' => 'AGENT_ACADEMIQUE',
                'profil_data' => [
                    'poste' => 'Agent des Examens',
                    'service' => 'Service des Examens et Concours',
                ]
            ],
            [
                'nom' => 'AMINA',
                'prenom' => 'sandrine',
                'email' => 'amina@gmail.com',
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
                'nom' => 'NGUETSOP',
                'prenom' => 'Richnelle',
                'email' => 'nguetsop@gmail.com',
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
                'nom' => 'SOBZE',
                'prenom' => 'Lustrelle',
                'email' => 'sobze@gmail.com',
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
                $service = Service::where('nom', $profilData['service'] ?? null)->first();

                ProfilAgentAdministratif::updateOrCreate(
                    ['utilisateur_id' => $utilisateur->id],
                    [
                        'poste' => $profilData['poste'],
                        'service_id' => $service?->id
                    ]
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
