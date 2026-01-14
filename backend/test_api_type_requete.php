<?php

require __DIR__ . '/vendor/autoload.php';

use App\Models\TypeRequete;
use App\Models\Service;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\Hash;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TEST API TYPE REQUÊTE ===\n\n";

// 1. Créer un utilisateur admin pour les tests
echo "1. Création d'un utilisateur admin de test...\n";
$admin = Utilisateur::where('email', 'admin@test.com')->first();
if (!$admin) {
    $admin = Utilisateur::create([
        'nom' => 'ADMIN',
        'prenom' => 'Test',
        'email' => 'admin@test.com',
        'password' => Hash::make('password'),
        'telephone' => '697000000',
        'is_active' => true,
    ]);
    $admin->assignRole('Administrateur');
}
echo "   ✓ Admin: {$admin->email}\n\n";

// 2. Créer un type de test
echo "2. Création d'un type de test...\n";
$service = Service::first();
$typeTest = TypeRequete::create([
    'nom' => 'Type API Test ' . time(),
    'description' => 'Description initiale',
    'service_id' => $service ? $service->id : null,
]);
echo "   ✓ Type créé: ID={$typeTest->id}, Nom={$typeTest->nom}\n\n";

// 3. Simuler une requête PUT (modification)
echo "3. Simulation d'une requête PUT /api/admin/types-requetes/{$typeTest->id}...\n";
$updateData = [
    'nom' => 'Type API Test Modifié',
    'description' => 'Description modifiée via API',
    'service_id' => $service ? $service->id : null,
];
echo "   Données envoyées: " . json_encode($updateData) . "\n";

// Simuler la validation
$validator = \Validator::make($updateData, [
    'nom' => ['required', 'string', 'max:255', 'unique:type_requetes,nom,' . $typeTest->id],
    'description' => ['required', 'string'],
    'service_id' => ['nullable', 'exists:services,id'],
]);

if ($validator->fails()) {
    echo "   ❌ Validation échouée:\n";
    foreach ($validator->errors()->all() as $error) {
        echo "      - $error\n";
    }
} else {
    echo "   ✓ Validation réussie\n";
    $typeTest->update($updateData);
    $typeTest->refresh();
    echo "   ✓ Type modifié: Nom={$typeTest->nom}\n";
}
echo "\n";

// 4. Vérifier en base de données
echo "4. Vérification en base de données...\n";
$typeFromDb = TypeRequete::find($typeTest->id);
echo "   Nom en base: {$typeFromDb->nom}\n";
echo "   Description en base: {$typeFromDb->description}\n";
echo "   Service ID en base: " . ($typeFromDb->service_id ?? 'null') . "\n\n";

// 5. Simuler une requête DELETE
echo "5. Simulation d'une requête DELETE /api/admin/types-requetes/{$typeTest->id}...\n";
$nbRequetes = $typeTest->requetes()->count();
echo "   Nombre de requêtes utilisant ce type: {$nbRequetes}\n";

if ($nbRequetes > 0) {
    echo "   ⚠ Suppression refusée: type utilisé\n";
} else {
    $typeTest->delete();
    echo "   ✓ Type supprimé avec succès\n";
    
    // Vérifier la suppression
    $typeDeleted = TypeRequete::find($typeTest->id);
    if ($typeDeleted) {
        echo "   ❌ ERREUR: Le type existe encore en base !\n";
    } else {
        echo "   ✓ Vérification: Type bien supprimé de la base\n";
    }
}

echo "\n=== FIN DU TEST ===\n";
