<?php

require __DIR__ . '/vendor/autoload.php';

use App\Models\Utilisateur;
use Illuminate\Support\Facades\Hash;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TEST DE CRÉATION D'UTILISATEUR ===\n\n";

// Créer un utilisateur de test
$email = 'test_' . time() . '@test.com';

echo "Création d'un utilisateur avec email: {$email}\n";

$utilisateur = Utilisateur::create([
    'nom' => 'TEST',
    'prenom' => 'User',
    'email' => $email,
    'password' => Hash::make('password123'),
    'telephone' => '697000000',
    'is_active' => true,
    'email_verified_at' => now(),
]);

echo "✓ Utilisateur créé : ID={$utilisateur->id}\n";

// Assigner le rôle
echo "\nAssignation du rôle 'Étudiant'...\n";
$utilisateur->assignRole('Étudiant');

// Recharger l'utilisateur avec les relations
$utilisateur->refresh();
$utilisateur->load('roles');

echo "✓ Rôle assigné\n";
echo "Nombre de rôles : " . $utilisateur->roles->count() . "\n";

if ($utilisateur->roles->count() > 0) {
    echo "Rôles de l'utilisateur :\n";
    foreach ($utilisateur->roles as $role) {
        echo "  - ID: {$role->id}, Nom: {$role->nom}, Libellé: {$role->libelle}\n";
    }
} else {
    echo "⚠ PROBLÈME : Aucun rôle assigné !\n";
}

// Vérifier la table pivot
echo "\nVérification dans la table pivot :\n";
$pivotData = \DB::table('utilisateur_roles')
    ->where('utilisateur_id', $utilisateur->id)
    ->get();

if ($pivotData->count() > 0) {
    echo "✓ Données trouvées dans utilisateur_roles :\n";
    foreach ($pivotData as $pivot) {
        echo "  - utilisateur_id: {$pivot->utilisateur_id}, role_id: {$pivot->role_id}\n";
    }
} else {
    echo "⚠ PROBLÈME : Aucune donnée dans la table pivot !\n";
}

// Nettoyer
echo "\nSuppression de l'utilisateur de test...\n";
$utilisateur->forceDelete();
echo "✓ Utilisateur supprimé\n";

echo "\n=== FIN DU TEST ===\n";
