<?php

namespace Database\Seeders;

use App\Models\RolePermission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Exemple : Admin a toutes les permissions
        $permissions = \App\Models\Permission::all();
        $adminRole = \App\Models\Role::where('libelle', 'ADMINISTRATEUR')->first();

        foreach ($permissions as $permission) {
            RolePermission::create([
                'role_id' => $adminRole->id,
                'permission_id' => $permission->id,
            ]);
        }
    }
}
