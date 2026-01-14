<?php

require __DIR__ . '/vendor/autoload.php';

use App\Models\Role;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TEST D'ASSIGNATION DE RÔLE ===\n\n";

// Afficher tous les rôles
echo "Rôles disponibles :\n";
$roles = Role::all();
foreach ($roles as $role) {
    echo "  - ID: {$role->id}, Nom: {$role->nom}, Libellé: {$role->libelle}\n";
}
echo "\n";

// Test de recherche de rôle
$testNames = ['Étudiant', 'Agent Académique', 'ETUDIANT', 'etudiant'];
echo "Tests de recherche de rôle :\n";
foreach ($testNames as $name) {
    $role = Role::where('nom', $name)->first();
    if ($role) {
        echo "  ✓ Trouvé '{$name}' : ID={$role->id}, Nom={$role->nom}, Libellé={$role->libelle}\n";
    } else {
        echo "  ✗ Pas trouvé '{$name}'\n";
    }
}
echo "\n";

// Test avec libelle
echo "Tests de recherche par libellé :\n";
$testLibelles = ['ETUDIANT', 'AGENT_ACADEMIQUE'];
foreach ($testLibelles as $libelle) {
    $role = Role::where('libelle', $libelle)->first();
    if ($role) {
        echo "  ✓ Trouvé '{$libelle}' : ID={$role->id}, Nom={$role->nom}, Libellé={$role->libelle}\n";
    } else {
        echo "  ✗ Pas trouvé '{$libelle}'\n";
    }
}
echo "\n";

// Tester l'assignation sur un utilisateur existant
$user = Utilisateur::first();
if ($user) {
    echo "Test d'assignation sur l'utilisateur : {$user->nom} {$user->prenom}\n";
    echo "Rôles actuels : " . $user->roles->pluck('nom')->implode(', ') . "\n";
    
    // Tester assignRole avec différents formats
    echo "\nTest assignRole('Étudiant')...\n";
    $user->assignRole('Étudiant');
    $user->refresh();
    echo "Rôles après : " . $user->roles->pluck('nom')->implode(', ') . "\n";
}

echo "\n=== FIN DU TEST ===\n";
