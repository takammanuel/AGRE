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
                'nom' => 'Certificat de scolarité',
                'description' => 'Demande de certificat scolaire',
                'service_id' => $serviceScolarite ? $serviceScolarite->id : null,
                'necessite_approbation' => true
            ],
            [
                'nom' => 'Rélevé de notes',
                'description' => 'Demande de relevé de notes',
                'service_id' => $serviceExamens ? $serviceExamens->id : null,
                'necessite_approbation' => true
            ],
            [
                'nom' => 'Attestation de stages',
                'description' => 'Demande d\'attestation de stage',
                'service_id' => $serviceScolarite ? $serviceScolarite->id : null,
                'necessite_approbation' => false
            ],
            [
                'nom' => 'Demande de bourse',
                'description' => 'Demande de bourse',
                'service_id' => Service::where('nom', 'Service des Bourses et Aides Sociales')->first()->id ?? null,
                'necessite_approbation' => true
            ],
            [
                'nom' => 'Certificat du diplôme',
                'description' => 'Demande de certificat de diplôme',
                'service_id' => $serviceScolarite ? $serviceScolarite->id : null,
                'necessite_approbation' => true
            ],
            [
                'nom' => 'Changement de filière',
                'description' => 'Demande de changement de filière',
                'service_id' => $serviceScolarite ? $serviceScolarite->id : null,
                'necessite_approbation' => false
            ],
            [
                'nom' => 'Réévaluation de note',
                'description' => 'Demande de réévaluation de note',
                'service_id' => $serviceExamens ? $serviceExamens->id : null,
                'necessite_approbation' => true
            ],
        ]);
    }
}
