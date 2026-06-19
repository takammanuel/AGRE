<?php

require __DIR__ . '/vendor/autoload.php';

use App\Models\Requete;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TEST REQUÊTES EN BASE ===\n\n";

// Compter les requêtes
$totalRequetes = Requete::count();
echo "Nombre total de requêtes : {$totalRequetes}\n\n";

if ($totalRequetes === 0) {
    echo "⚠ AUCUNE REQUÊTE EN BASE DE DONNÉES !\n";
    echo "\nPour créer des requêtes de test, exécutez :\n";
    echo "php artisan db:seed --class=RequetesTestSeeder\n";
} else {
    echo "Détails des requêtes :\n\n";
    
    $requetes = Requete::with(['etudiant', 'typeRequete', 'agent', 'historiques.etat'])
        ->limit(5)
        ->get();
    
    foreach ($requetes as $index => $req) {
        echo "--- Requête " . ($index + 1) . " ---\n";
        echo "Code: {$req->code_requete}\n";
        echo "Étudiant: " . ($req->etudiant ? "{$req->etudiant->nom} {$req->etudiant->prenom}" : "N/A") . "\n";
        echo "Type: " . ($req->typeRequete ? $req->typeRequete->nom : "N/A") . "\n";
        echo "Agent: " . ($req->agent ? "{$req->agent->nom} {$req->agent->prenom}" : "Non assigné") . "\n";
        echo "Nombre d'historiques: " . $req->historiques->count() . "\n";
        
        if ($req->historiques->count() > 0) {
            $dernierHistorique = $req->historiques->sortByDesc('date_etat')->first();
            echo "Statut actuel: " . ($dernierHistorique->etat->libelle ?? "N/A") . "\n";
        }
        
        echo "Date création: {$req->created_at}\n\n";
    }
}

echo "=== FIN DU TEST ===\n";
