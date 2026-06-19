<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Exemple : Admin a toutes les permissions
        $permissions = Permission::pluck('id')->toArray();
        $adminRole = Role::where('libelle', 'ADMINISTRATEUR')->first();

        if ($adminRole) {
            // Associer toutes les permissions à l'admin sans créer de doublons
            $adminRole->permissions()->syncWithoutDetaching($permissions);
        }
    }
}
