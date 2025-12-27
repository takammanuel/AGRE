<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ServicesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            [
                'nom' => 'Service de la Scolarité',
                'description' => 'Gestion des inscriptions, des dossiers étudiants, des réinscriptions et des certificats de scolarité.'
            ],
            [
                'nom' => 'Service des Relations Internationales',
                'description' => 'Gestion des échanges internationaux, des partenariats avec les universités étrangères et des mobilités étudiantes.'
            ],
            [
                'nom' => 'Service de la Formation Continue',
                'description' => 'Organisation et gestion des formations continues, des certifications professionnelles et des programmes de développement des compétences.'
            ],
            [
                'nom' => 'Service des Stages et Insertion Professionnelle',
                'description' => 'Accompagnement des étudiants dans la recherche de stages, suivi des conventions de stage et insertion professionnelle.'
            ],
            [
                'nom' => 'Service de la Vie Étudiante',
                'description' => 'Animation de la vie étudiante, gestion des associations, organisation des activités culturelles et sportives.'
            ],
            [
                'nom' => 'Service des Bourses et Aides Sociales',
                'description' => 'Gestion des dossiers de bourses, des aides d\'urgence et accompagnement social des étudiants.'
            ],
            [
                'nom' => 'Service Informatique et Numérique',
                'description' => 'Maintenance des infrastructures informatiques, gestion des systèmes d\'information et support technique.'
            ],
            [
                'nom' => 'Service des Bibliothèques et Documentation',
                'description' => 'Gestion des ressources documentaires, des bibliothèques et des services d\'accès à l\'information scientifique.'
            ],
            [
                'nom' => 'Service Financier et Comptable',
                'description' => 'Gestion budgétaire, comptabilité, paiement des factures et suivi des opérations financières.'
            ],
            [
                'nom' => 'Service des Ressources Humaines',
                'description' => 'Gestion du personnel, recrutement, paie, formation des personnels et administration du personnel.'
            ],
            [
                'nom' => 'Service de la Communication',
                'description' => 'Communication interne et externe, relations presse, événementiel et gestion des supports de communication.'
            ],
            [
                'nom' => 'Service Juridique',
                'description' => 'Conseil juridique, rédaction des contrats, gestion des contentieux et veille réglementaire.'
            ],
            [
                'nom' => 'Service Hygiène et Sécurité',
                'description' => 'Application des normes d\'hygiène et de sécurité, prévention des risques et gestion des urgences.'
            ],
            [
                'nom' => 'Service des Examens et Concours',
                'description' => 'Organisation des examens, gestion des jurys, suivi des résultats et délivrance des diplômes.'
            ],
        ];

        foreach ($services as $service) {
            Service::insert($services);
        }
    }
}
