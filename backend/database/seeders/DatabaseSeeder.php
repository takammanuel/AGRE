<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
         $this->call([
            RolesSeeder::class,        // Rôles de base
            PermissionsSeeder::class,  // Permissions
            RolePermissionSeeder::class, // Lier rôles et permissions
            EtatsSeeder::class,        // États des requêtes
            ServicesSeeder::class,
            TypeRequeteSeeder::class,  // Types de requêtes
            UsersAndRolesSeeder::class,
            // ProfilSeeder::class,
        ]);
    }
}
