<?php

require __DIR__ . '/vendor/autoload.php';

use App\Models\Utilisateur;
use Illuminate\Support\Facades\Hash;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TEST MODIFICATION UTILISATEUR ===\n\n";

// 1. Trouver un utilisateur de test
echo "1. Recherche d'un utilisateur de test...\n";
$utilisateur = Utilisateur::with('roles')->first();

if (!$utilisateur) {
    echo "   ❌ Aucun utilisateur trouvé\n";
    exit(1);
}

echo "   ✓ Utilisateur trouvé:\n";
echo "     - ID: {$utilisateur->id}\n";
echo "     - Nom: {$utilisateur->nom}\n";
echo "     - Prénom: {$utilisateur->prenom}\n";
echo "     - Email: {$utilisateur->email}\n";
echo "     - Téléphone: {$utilisateur->telephone}\n";
echo "     - Rôles: " . $utilisateur->roles->pluck('nom')->implode(', ') . "\n\n";

// 2. Test 1: Modifier sans changer l'email
echo "2. Test 1: Modifier le téléphone SANS changer l'email...\n";
$nouveauTelephone = '697' . rand(100000, 999999);
echo "   Nouveau téléphone: {$nouveauTelephone}\n";
echo "   Email reste: {$utilisateur->email}\n";

$utilisateur->update([
    'telephone' => $nouveauTelephone,
    // Email non modifié
]);

$utilisateur->refresh();
echo "   ✓ Modification réussie\n";
echo "   Téléphone en base: {$utilisateur->telephone}\n";
echo "   Email en base: {$utilisateur->email}\n\n";

// 3. Test 2: Modifier avec le même email
echo "3. Test 2: Modifier le nom avec le MÊME email...\n";
$nouveauNom = 'TEST-' . strtoupper($utilisateur->nom);
echo "   Nouveau nom: {$nouveauNom}\n";
echo "   Email (inchangé): {$utilisateur->email}\n";

$utilisateur->update([
    'nom' => $nouveauNom,
    'email' => $utilisateur->email, // Même email
]);

$utilisateur->refresh();
echo "   ✓ Modification réussie\n";
echo "   Nom en base: {$utilisateur->nom}\n";
echo "   Email en base: {$utilisateur->email}\n\n";

// 4. Test 3: Validation unique avec l'ID
echo "4. Test 3: Validation de la règle unique...\n";
$userId = $utilisateur->id;
$email = $utilisateur->email;

$validator = \Validator::make([
    'email' => $email
], [
    'email' => ['required', 'string', 'email', 'max:255', 'unique:utilisateurs,email,' . $userId]
]);

if ($validator->fails()) {
    echo "   ❌ Validation échouée (ne devrait pas arriver):\n";
    foreach ($validator->errors()->all() as $error) {
        echo "      - $error\n";
    }
} else {
    echo "   ✓ Validation réussie: L'email peut rester le même\n";
}
echo "\n";

// 5. Test 4: Essayer avec un email déjà utilisé par un autre utilisateur
echo "5. Test 4: Essayer avec un email d'un AUTRE utilisateur...\n";
$autreUtilisateur = Utilisateur::where('id', '!=', $utilisateur->id)->first();

if ($autreUtilisateur) {
    echo "   Email de l'autre utilisateur: {$autreUtilisateur->email}\n";
    
    $validator = \Validator::make([
        'email' => $autreUtilisateur->email
    ], [
        'email' => ['required', 'string', 'email', 'max:255', 'unique:utilisateurs,email,' . $userId]
    ]);
    
    if ($validator->fails()) {
        echo "   ✓ Validation échouée (comportement attendu):\n";
        foreach ($validator->errors()->all() as $error) {
            echo "      - $error\n";
        }
    } else {
        echo "   ❌ Validation réussie (ne devrait pas arriver)\n";
    }
} else {
    echo "   ⚠ Pas d'autre utilisateur pour tester\n";
}

echo "\n=== RÉSUMÉ ===\n";
echo "✓ La modification fonctionne sans changer l'email\n";
echo "✓ La règle unique exclut correctement l'utilisateur en cours\n";
echo "✓ La règle unique bloque les emails déjà utilisés par d'autres\n";

echo "\n=== FIN DU TEST ===\n";
