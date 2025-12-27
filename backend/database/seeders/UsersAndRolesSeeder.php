<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Utilisateur;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
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
                'nom' => 'Alice',
                'prenom' => 'Dupont',
                'email' => 'alice@test.com',
                'password' => Hash::make('password123'),
                'telephone' => '697932976'
            ],
            [
                'nom' => 'Bob',
                'prenom' => 'Martin',
                'email' => 'bob@test.com',
                'password' => Hash::make('password123'),
                'telephone' => '697932976'
            ],
            [
                'nom' => 'Charlie',
                'prenom' => 'Durand',
                'email' => 'charlie@test.com',
                'password' => Hash::make('password123'),
                'telephone' => '697932976'
            ],
            [
                'nom' => 'David',
                'prenom' => 'Leclerc',
                'email' => 'david@test.com',
                'password' => Hash::make('password123'),
                'telephone' => '697932976'
            ],
            [
                'nom' => 'Eva',
                'prenom' => 'Moreau',
                'email' => 'eva@test.com',
                'password' => Hash::make('password123'),
                'telephone' => '697932976'
            ],
        ];

        foreach ($users as $userData) {
            $user = Utilisateur::create($userData);

            // Affectation des rôles selon l'utilisateur
            switch ($user->email) {
                case 'alice@test.com':
                case 'bob@test.com':
                    $role = Role::where('libelle', 'ETUDIANT')->first();
                    break;
                case 'charlie@test.com':
                    $role = Role::where('libelle', 'AGENT_ACADEMIQUE')->first();
                    break;
                case 'david@test.com':
                    $role = Role::where('libelle', 'RESPONSABLE_PEDAGOGIQUE')->first();
                    break;
                case 'eva@test.com':
                    $role = Role::where('libelle', 'ADMINISTRATEUR')->first();
                    break;
            }

            if (isset($role)) {
                $user->roles()->attach($role->id);
            }
        }
    }
}
