<?php

namespace Database\Seeders;

use App\Models\ProfilAdministrateur;
use App\Models\ProfilAgentAdministratif;
use App\Models\ProfilEtudiant;
use App\Models\ProfilResponsablePedagogique;
use App\Models\Role;
use App\Models\Service;
use App\Models\Utilisateur;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersAndRolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
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
                'role' => 'etudiant',
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
                'role' => 'etudiant',
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
                'role' => 'agent_academique',
                'profil_data' => [
                    'poste' => 'Agent de Scolarité',
                    'date_embauche' => '2020-01-15',
                    // service_id sera ajouté dynamiquement
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
                'role' => 'responsable_pedagogique',
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
                'role' => 'administrateur',
                'profil_data' => [
                    'niveau_acces' => 'super_admin',
                ]
            ],
        ];

        foreach ($users as $userData) {
            $role = $userData['role'];
            $profilData = $userData['profil_data'];
            unset($userData['role'], $userData['profil_data']);

            // Créer l'utilisateur
            $user = Utilisateur::create($userData);

            // Assigner le rôle
            $user->assignRole($role);

            // Créer le profil selon le rôle
            $this->createProfil($user, $role, $profilData);

            $this->command->info("Utilisateur créé : {$user->email} (Rôle: {$role})");
        }

        $this->command->info("{$this->count()} utilisateurs créés avec succès !");
    }

    /**
     * Créer le profil selon le rôle
     */
    private function createProfil(Utilisateur $utilisateur, string $role, array $profilData): void
    {
        switch ($role) {
            case 'etudiant':
                ProfilEtudiant::create([
                    'utilisateur_id' => $utilisateur->id,
                    'matricule' => $profilData['matricule'],
                    'filiere' => $profilData['filiere'],
                    'niveau' => $profilData['niveau'],
                ]);
                break;

            case 'agent_academique':
                // Récupérer un service (ex: Scolarité)
                $service = Service::where('nom', 'Service de la Scolarité')->first();

                ProfilAgentAdministratif::create([
                    'utilisateur_id' => $utilisateur->id,
                    'poste' => $profilData['poste'],
                    'service_id' => $service ? $service->id : null,
                ]);
                break;

            case 'responsable_pedagogique':
                ProfilResponsablePedagogique::create([
                    'utilisateur_id' => $utilisateur->id,
                    'departement' => $profilData['departement']
                ]);
                break;

            case 'administrateur':
                ProfilAdministrateur::create([
                    'utilisateur_id' => $utilisateur->id,
                    'niveau_acces' => $profilData['niveau_acces'] ?? 'admin',
                ]);
                break;
        }
    }

    /**
     * Compter le nombre d'utilisateurs
     */
    private function count(): int
    {
        return 5;
    }
}
