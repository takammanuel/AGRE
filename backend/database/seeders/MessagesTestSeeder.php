<?php

namespace Database\Seeders;

use App\Models\Message;
use App\Models\Utilisateur;
use Illuminate\Database\Seeder;

class MessagesTestSeeder extends Seeder
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

        $this->command->info('🔄 Création de messages de test...');

        // Conversation 1: Étudiant -> Agent
        Message::create([
            'emetteur_id' => $etudiant->id,
            'recepteur_id' => $agent->id,
            'contenu' => 'Bonjour, j\'ai soumis une requête pour un relevé de notes. Pouvez-vous me dire où en est le traitement ?',
            'lu' => true,
            'created_at' => now()->subDays(2),
        ]);

        // Agent -> Étudiant
        Message::create([
            'emetteur_id' => $agent->id,
            'recepteur_id' => $etudiant->id,
            'contenu' => 'Bonjour, votre requête est en cours de traitement. Elle devrait être prête d\'ici 2 jours ouvrables.',
            'lu' => true,
            'created_at' => now()->subDays(2)->addHours(1),
        ]);

        // Étudiant -> Agent
        Message::create([
            'emetteur_id' => $etudiant->id,
            'recepteur_id' => $agent->id,
            'contenu' => 'Merci pour votre réponse. C\'est urgent car j\'en ai besoin pour une candidature.',
            'lu' => true,
            'created_at' => now()->subDays(1),
        ]);

        // Agent -> Étudiant
        Message::create([
            'emetteur_id' => $agent->id,
            'recepteur_id' => $etudiant->id,
            'contenu' => 'Je comprends. Je vais accélérer le traitement. Vous devriez recevoir votre relevé demain.',
            'lu' => false,
            'created_at' => now()->subHours(3),
        ]);

        $this->command->info('✅ Messages de test créés avec succès!');
        $this->command->info('   - 4 messages dans la conversation Agent <-> Étudiant');
    }
}
