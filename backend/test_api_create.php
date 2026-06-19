<?php

require __DIR__ . '/vendor/autoload.php';

use App\Models\Utilisateur;
use App\Models\ProfilEtudiant;
use Illuminate\Support\Facades\Hash;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TEST COMPLET DE CRÉATION (SIMULATION API) ===\n\n";

// Simuler la création comme le fait le contrôleur
$email = 'test_api_' . time() . '@test.com';

echo "1. Création de l'utilisateur...\n";
$utilisateur = Utilisateur::create([
    'nom' => strtoupper('Dupont'),
    'prenom' => ucfirst(strtolower('Jean')),
    'email' => strtolower($email),
    'password' => Hash::make('password123'),
    'telephone' => '697123456',
    'is_active' => true,
    'email_verified_at' => now(),
]);
echo "   ✓ Utilisateur créé : ID={$utilisateur->id}\n";

echo "\n2. Assignation du rôle 'Étudiant'...\n";
$utilisateur->assignRole('Étudiant');
echo "   ✓ Rôle assigné\n";

echo "\n3. Création du profil étudiant...\n";
ProfilEtudiant::create([
    'utilisateur_id' => $utilisateur->id,
    'matricule' => 'TEST' . time(),
    'filiere' => 'Informatique',
    'niveau' => 1,
]);
echo "   ✓ Profil créé\n";

echo "\n4. Rechargement avec relations (comme dans le contrôleur)...\n";
$utilisateur->refresh();
$utilisateur->load(['roles', 'profilEtudiant', 'profilAgentAdministratif', 'profilResponsablePedagogique', 'profilAdministrateur']);
echo "   ✓ Relations chargées\n";

echo "\n5. Vérification des données retournées :\n";
echo "   - ID: {$utilisateur->id}\n";
echo "   - Nom: {$utilisateur->nom}\n";
echo "   - Prénom: {$utilisateur->prenom}\n";
echo "   - Email: {$utilisateur->email}\n";
echo "   - Nombre de rôles: " . $utilisateur->roles->count() . "\n";

if ($utilisateur->roles->count() > 0) {
    echo "   - Rôles:\n";
    foreach ($utilisateur->roles as $role) {
        echo "     * {$role->nom} (libellé: {$role->libelle})\n";
    }
} else {
    echo "   ⚠ PROBLÈME : Aucun rôle chargé !\n";
}

echo "\n6. Simulation de la réponse JSON :\n";
$response = [
    'success' => true,
    'message' => 'Utilisateur créé avec succès.',
    'data' => [
        'id' => $utilisateur->id,
        'nom' => $utilisateur->nom,
        'prenom' => $utilisateur->prenom,
        'email' => $utilisateur->email,
        'telephone' => $utilisateur->telephone,
        'is_active' => $utilisateur->is_active,
        'roles' => $utilisateur->roles->map(function($role) {
            return [
                'id' => $role->id,
                'nom' => $role->nom,
                'libelle' => $role->libelle,
            ];
        }),
        'created_at' => $utilisateur->created_at,
    ]
];

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";

echo "\n7. Nettoyage...\n";
$utilisateur->profilEtudiant()->delete();
$utilisateur->forceDelete();
echo "   ✓ Utilisateur supprimé\n";

echo "\n=== TEST TERMINÉ AVEC SUCCÈS ===\n";
