<?php

require __DIR__ . '/vendor/autoload.php';

use App\Models\Requete;
use App\Models\TypeRequete;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TEST APPROBATIONS ===\n\n";

// 1. Vérifier les types de requêtes nécessitant approbation
echo "1. Types de requêtes nécessitant approbation :\n";
$typesAvecApprobation = TypeRequete::where('necessite_approbation', true)->get();
echo "   Nombre : " . $typesAvecApprobation->count() . "\n";

if ($typesAvecApprobation->count() > 0) {
    foreach ($typesAvecApprobation as $type) {
        echo "   - {$type->nom} (ID: {$type->id})\n";
    }
} else {
    echo "   ⚠ AUCUN type de requête ne nécessite d'approbation !\n";
}

echo "\n2. Requêtes en attente d'approbation :\n";

// Récupérer les requêtes en attente nécessitant approbation
$requetesEnAttente = Requete::whereHas('typeRequete', function($q) {
    $q->where('necessite_approbation', true);
})
->whereHas('historiques', function($q) {
    $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'EN_ATTENTE'));
})
->with(['etudiant', 'typeRequete', 'historiques.etat'])
->get();

echo "   Nombre : " . $requetesEnAttente->count() . "\n";

if ($requetesEnAttente->count() > 0) {
    foreach ($requetesEnAttente as $req) {
        echo "   - {$req->code_requete} - {$req->typeRequete->nom}\n";
        echo "     Étudiant : {$req->etudiant->nom} {$req->etudiant->prenom}\n";
        $dernierEtat = $req->historiques->sortByDesc('date_etat')->first();
        echo "     État : " . ($dernierEtat?->etat->libelle ?? 'N/A') . "\n\n";
    }
} else {
    echo "   ⚠ AUCUNE requête en attente d'approbation !\n\n";
    echo "   Solutions :\n";
    echo "   1. Marquer un type de requête comme nécessitant approbation\n";
    echo "   2. Créer une requête avec ce type\n";
}

echo "\n=== SOLUTION ===\n";
echo "Pour activer l'approbation sur un type de requête :\n\n";
echo "php artisan tinker\n";
echo ">>> \$type = \\App\\Models\\TypeRequete::first();\n";
echo ">>> \$type->necessite_approbation = true;\n";
echo ">>> \$type->save();\n";
echo ">>> exit\n";

echo "\n=== FIN DU TEST ===\n";
