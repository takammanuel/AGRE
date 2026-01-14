<?php

require __DIR__ . '/vendor/autoload.php';

use App\Models\Utilisateur;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TEST API INDEX (SIMULATION) ===\n\n";

// Simuler ce que fait la méthode index()
$query = Utilisateur::with(['roles', 'profilEtudiant', 'profilAgentAdministratif', 'profilResponsablePedagogique', 'profilAdministrateur']);

$utilisateurs = $query->limit(3)->get();

echo "Nombre d'utilisateurs récupérés : " . $utilisateurs->count() . "\n\n";

foreach ($utilisateurs as $index => $user) {
    echo "--- Utilisateur " . ($index + 1) . " ---\n";
    echo "ID: {$user->id}\n";
    echo "Nom: {$user->nom} {$user->prenom}\n";
    echo "Email: {$user->email}\n";
    echo "Nombre de rôles chargés: " . $user->roles->count() . "\n";
    
    if ($user->roles->count() > 0) {
        echo "Rôles:\n";
        foreach ($user->roles as $role) {
            echo "  - {$role->nom} (libellé: {$role->libelle})\n";
        }
    } else {
        echo "⚠ AUCUN RÔLE !\n";
    }
    
    echo "\n";
}

echo "\n=== TEST DE SÉRIALISATION JSON ===\n\n";

$firstUser = $utilisateurs->first();
if ($firstUser) {
    echo "Utilisateur: {$firstUser->nom} {$firstUser->prenom}\n";
    echo "JSON:\n";
    $json = $firstUser->toArray();
    echo json_encode($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";
    
    if (isset($json['roles'])) {
        echo "✓ La clé 'roles' est présente dans le JSON\n";
        echo "Nombre de rôles dans le JSON: " . count($json['roles']) . "\n";
    } else {
        echo "⚠ La clé 'roles' est ABSENTE du JSON !\n";
    }
}

echo "\n=== TEST DE LA RÉPONSE COMPLÈTE ===\n\n";

$response = [
    'success' => true,
    'message' => 'Utilisateurs récupérés avec succès',
    'data' => $utilisateurs->toArray(),
];

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";

echo "\n=== FIN DU TEST ===\n";
