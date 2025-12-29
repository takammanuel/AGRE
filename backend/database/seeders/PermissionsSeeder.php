<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Permission::insert([
            ['libelle' => 'create_requete', 'description' => 'Créer une requête'],
            ['libelle' => 'update_requete', 'description' => 'Mettre à jour une requête'],
            ['libelle' => 'delete_requete', 'description' => 'Supprimer une requête'],
            ['libelle' => 'view_requete', 'description' => 'Voir toutes les requêtes'],
            ['libelle' => 'manage_users', 'description' => 'Gérer les utilisateurs'],
        ]);
    }
}
