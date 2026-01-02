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
        RolesSeeder::class,
        PermissionsSeeder::class,
        RolePermissionSeeder::class,
        EtatsSeeder::class,
        ServicesSeeder::class,
        TypeRequeteSeeder::class,
        UsersAndRolesSeeder::class,
        RequeteSeeder::class, // ajouté
    ]);
}
}
