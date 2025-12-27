<?php

namespace Database\Seeders;

use App\Models\TypeRequete;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TypeRequeteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        TypeRequete::insert([
            ['libelle' => 'CERTIFICAT_SCOLAIRE', 'description' => 'Demande de certificat scolaire'],
            ['libelle' => 'RELEVE_NOTES', 'description' => 'Demande de relevé de notes'],
            ['libelle' => 'AUTRE', 'description' => 'Autres types de requêtes'],
        ]);
    }
}
