<?php

require __DIR__ . '/vendor/autoload.php';

use App\Models\TypeRequete;
use App\Models\Service;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TEST CRUD TYPE REQUÊTE ===\n\n";

// 1. Lister les types existants
echo "1. Types de requêtes existants :\n";
$types = TypeRequete::with('service')->get();
foreach ($types as $type) {
    echo "   - ID: {$type->id}, Nom: {$type->nom}, Service: " . ($type->service ? $type->service->nom : 'Aucun') . "\n";
}
echo "\n";

// 2. Créer un type de test
echo "2. Création d'un type de test...\n";
$service = Service::first();
$typeTest = TypeRequete::create([
    'nom' => 'Type Test CRUD',
    'description' => 'Description du type test',
    'service_id' => $service ? $service->id : null,
]);
echo "   ✓ Type créé : ID={$typeTest->id}, Nom={$typeTest->nom}\n\n";

// 3. Modifier le type
echo "3. Modification du type...\n";
$typeTest->update([
    'nom' => 'Type Test CRUD (Modifié)',
    'description' => 'Description modifiée',
]);
$typeTest->refresh();
echo "   ✓ Type modifié : Nom={$typeTest->nom}\n\n";

// 4. Vérifier si le type est utilisé
echo "4. Vérification de l'utilisation...\n";
$nbRequetes = $typeTest->requetes()->count();
echo "   Nombre de requêtes utilisant ce type : {$nbRequetes}\n\n";

// 5. Supprimer le type
echo "5. Suppression du type...\n";
if ($nbRequetes > 0) {
    echo "   ⚠ Impossible de supprimer : type utilisé dans {$nbRequetes} requête(s)\n";
} else {
    $typeTest->delete();
    echo "   ✓ Type supprimé avec succès\n";
}

echo "\n=== FIN DU TEST ===\n";
