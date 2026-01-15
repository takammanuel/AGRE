<?php

require __DIR__ . '/vendor/autoload.php';

use App\Models\Requete;
use App\Models\TypeRequete;
use App\Models\Utilisateur;
use App\Models\Etat;
use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CONFIGURATION DES APPROBATIONS ===\n\n";

// 1. Activer l'approbation sur tous les types
echo "1. Activation de l'approbation sur tous les types de requêtes...\n";
$updated = TypeRequete::query()->update(['necessite_approbation' => true]);
echo "   ✓ {$updated} type(s) mis à jour\n\n";

// 2. Récupérer les données nécessaires
echo "2. Récupération des données...\n";
$etudiant = Utilisateur::whereHas('roles', function($q) {
    $q->where('nom', 'Étudiant')->orWhere('libelle', 'ETUDIANT');
})->first();

if (!$etudiant) {
    echo "   ⚠ Aucun étudiant trouvé. Impossible de créer des requêtes.\n";
    exit(1);
}
echo "   ✓ Étudiant : {$etudiant->nom} {$etudiant->prenom}\n";

$type = TypeRequete::where('necessite_approbation', true)->first();
if (!$type) {
    echo "   ⚠ Aucun type de requête trouvé.\n";
    exit(1);
}
echo "   ✓ Type : {$type->nom}\n";

$etatEnAttente = Etat::where('libelle', 'EN_ATTENTE')->first();
if (!$etatEnAttente) {
    echo "   ⚠ État EN_ATTENTE non trouvé.\n";
    exit(1);
}
echo "   ✓ État : {$etatEnAttente->libelle}\n\n";

// 3. Créer des requêtes de test
echo "3. Création de requêtes de test...\n";

for ($i = 1; $i <= 4; $i++) {
    $requete = Requete::create([
        'code_requete' => 'APPRO-TEST-' . str_pad($i, 3, '0', STR_PAD_LEFT),
        'priorite' => $i % 2 == 0 ? 'URGENTE' : 'STANDARD',
        'description' => "Requête de test numéro $i nécessitant approbation admin. " .
                        "Cette requête doit être approuvée avant d'être traitée par un agent.",
        'etudiant_id' => $etudiant->id,
        'type_requete_id' => $type->id,
        'created_at' => now()->subHours($i),
        'updated_at' => now()->subHours($i),
    ]);

    DB::table('historique_requetes')->insert([
        'requete_id' => $requete->id,
        'etat_id' => $etatEnAttente->id,
        'date_etat' => now()->subHours($i),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $priorite = $requete->priorite === 'URGENTE' ? '🔴' : '🟢';
    echo "   $priorite {$requete->code_requete} - {$requete->priorite}\n";
}

echo "\n✅ Configuration terminée avec succès !\n\n";

// 4. Résumé
echo "=== RÉSUMÉ ===\n";
$totalApprobations = Requete::whereHas('typeRequete', function($q) {
    $q->where('necessite_approbation', true);
})
->whereHas('historiques', function($q) {
    $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'EN_ATTENTE'));
})
->count();

echo "Types nécessitant approbation : " . TypeRequete::where('necessite_approbation', true)->count() . "\n";
echo "Requêtes en attente d'approbation : {$totalApprobations}\n\n";

echo "👉 Recharge la page 'Approbations' dans le dashboard admin !\n";
echo "\n=== FIN ===\n";
