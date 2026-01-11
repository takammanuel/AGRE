<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Requete;

class RequeteSeeder extends Seeder
{
    public function run(): void
    {
        // Requete::create([
        //     'code_requete'    => 'REQ-001',
        //     'priorite'        => 'URGENTE',
        //     'description'     => 'Test de notification pour Alice',
        //     'etudiant_id'     => 1, // Alice
        //     'type_requete_id' => 1, // Assure-toi qu’un type existe
        //     'utilisateur_id'  => 1,
        //     'statut'          => 'En attente',
        // ]);

        // Requete::create([
        //     'code_requete'    => 'REQ-002',
        //     'priorite'        => 'STANDARD',
        //     'description'     => 'Test de notification pour Bob',
        //     'etudiant_id'     => 2, // Bob
        //     'type_requete_id' => 1,
        //     'utilisateur_id'  => 2,
        //     'statut'          => 'Validée',
        // ]);
    }
}
