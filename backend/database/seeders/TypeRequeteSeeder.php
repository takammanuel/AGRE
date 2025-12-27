<?php

namespace Database\Seeders;

use App\Models\Service;
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
         $serviceScolarite = Service::where('nom', 'Service de la Scolarité')->first();
        $serviceExamens = Service::where('nom', 'Service des Examens et Concours')->first();

        TypeRequete::insert([
            [
                'libelle' => 'CERTIFICAT_SCOLAIRE',
                'description' => 'Demande de certificat scolaire',
                'service_id' => $serviceScolarite ? $serviceScolarite->id : null
            ],
            [
                'libelle' => 'RELEVE_NOTES',
                'description' => 'Demande de relevé de notes',
                'service_id' => $serviceExamens ? $serviceExamens->id : null
            ],
            [
                'libelle' => 'ATTESTATION_STAGE',
                'description' => 'Demande d\'attestation de stage',
                'service_id' => $serviceScolarite ? $serviceScolarite->id : null
            ],
            [
                'libelle' => 'CONVENTION_STAGE',
                'description' => 'Demande de convention de stage',
                'service_id' => Service::where('nom', 'Service des Stages et Insertion Professionnelle')->first()->id ?? null
            ],
            [
                'libelle' => 'DEMANDE_BOURSE',
                'description' => 'Demande de bourse',
                'service_id' => Service::where('nom', 'Service des Bourses et Aides Sociales')->first()->id ?? null
            ],
            [
                'libelle' => 'CERTIFICAT_DIPLOME',
                'description' => 'Demande de certificat de diplôme',
                'service_id' => $serviceScolarite ? $serviceScolarite->id : null
            ],
            [
                'libelle' => 'CHANGEMENT_FILIERE',
                'description' => 'Demande de changement de filière',
                'service_id' => $serviceScolarite ? $serviceScolarite->id : null
            ],
            [
                'libelle' => 'REEVALUATION_NOTE',
                'description' => 'Demande de réévaluation de note',
                'service_id' => $serviceExamens ? $serviceExamens->id : null
            ],
        ]);
    }
}
