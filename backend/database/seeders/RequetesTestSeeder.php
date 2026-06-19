<?php

namespace Database\Seeders;

use App\Models\Requete;
use App\Models\Utilisateur;
use App\Models\TypeRequete;
use App\Models\Etat;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RequetesTestSeeder extends Seeder
{
    public function run(): void
    {
        // Récupérer les utilisateurs
        $etudiant = Utilisateur::whereHas('roles', fn($q) => $q->where('libelle', 'ETUDIANT'))->first();
        $agent = Utilisateur::whereHas('roles', fn($q) => $q->where('libelle', 'AGENT_ACADEMIQUE'))->first();
        
        if (!$etudiant || !$agent) {
            $this->command->error('❌ Utilisateurs non trouvés. Exécutez d\'abord UsersAndRolesSeeder');
            return;
        }

        // Récupérer les types de requêtes
        $typeRequetes = TypeRequete::all();
        if ($typeRequetes->isEmpty()) {
            $this->command->error('❌ Aucun type de requête trouvé');
            return;
        }

        // Récupérer les états
        $etatEnAttente = Etat::where('libelle', 'EN_ATTENTE')->first();
        $etatEnCours = Etat::where('libelle', 'EN_COURS')->first();
        $etatTraitee = Etat::where('libelle', 'TRAITEE')->first();
        $etatRejetee = Etat::where('libelle', 'REJETEE')->first();

        $this->command->info('🔄 Création de 20 requêtes de test...');

        // Créer 20 requêtes
        for ($i = 1; $i <= 20; $i++) {
            $typeRequete = $typeRequetes->random();
            $priorite = $i % 4 == 0 ? 'URGENTE' : 'STANDARD';
            
            // Créer la requête
            $requete = Requete::create([
                'code_requete' => 'REQ-' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'priorite' => $priorite,
                'description' => "Ceci est une requête de test numéro $i pour le type {$typeRequete->nom}. " .
                                "Elle permet de tester le système de gestion des requêtes.",
                'etudiant_id' => $etudiant->id,
                'agent_id' => $agent->id,
                'type_requete_id' => $typeRequete->id,
                'created_at' => now()->subDays(rand(0, 30)),
            ]);

            // Ajouter un historique selon le numéro
            if ($i <= 5) {
                // 5 requêtes en attente
                DB::table('historique_requetes')->insert([
                    'requete_id' => $requete->id,
                    'etat_id' => $etatEnAttente->id,
                    'date_etat' => $requete->created_at,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } elseif ($i <= 10) {
                // 5 requêtes en cours
                DB::table('historique_requetes')->insert([
                    [
                        'requete_id' => $requete->id,
                        'etat_id' => $etatEnAttente->id,
                        'date_etat' => $requete->created_at,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'requete_id' => $requete->id,
                        'etat_id' => $etatEnCours->id,
                        'date_etat' => $requete->created_at->addHours(2),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                ]);
            } elseif ($i <= 15) {
                // 5 requêtes traitées
                DB::table('historique_requetes')->insert([
                    [
                        'requete_id' => $requete->id,
                        'etat_id' => $etatEnAttente->id,
                        'date_etat' => $requete->created_at,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'requete_id' => $requete->id,
                        'etat_id' => $etatEnCours->id,
                        'date_etat' => $requete->created_at->addHours(2),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'requete_id' => $requete->id,
                        'etat_id' => $etatTraitee->id,
                        'date_etat' => $requete->created_at->addDays(1),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                ]);
            } else {
                // 5 requêtes rejetées
                DB::table('historique_requetes')->insert([
                    [
                        'requete_id' => $requete->id,
                        'etat_id' => $etatEnAttente->id,
                        'date_etat' => $requete->created_at,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'requete_id' => $requete->id,
                        'etat_id' => $etatRejetee->id,
                        'date_etat' => $requete->created_at->addHours(1),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                ]);
            }
        }

        $this->command->info('✅ 20 requêtes créées avec succès!');
        $this->command->info('   - 5 en attente');
        $this->command->info('   - 5 en cours');
        $this->command->info('   - 5 traitées');
        $this->command->info('   - 5 rejetées');
    }
}
