<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = \App\Models\Utilisateur::where('email', 'tetchoup@gmail.com')->first();

echo "=== Test du rôle étudiant ===\n";
echo "Email: {$user->email}\n";
echo "Roles en DB: " . $user->roles->pluck('libelle')->implode(', ') . "\n";
echo "hasRole('ETUDIANT'): " . ($user->hasRole('ETUDIANT') ? 'YES' : 'NO') . "\n";
echo "hasRole('etudiant'): " . ($user->hasRole('etudiant') ? 'YES' : 'NO') . "\n";
echo "hasRole('Étudiant'): " . ($user->hasRole('Étudiant') ? 'YES' : 'NO') . "\n";
echo "\n";

// Vérifier la relation roles
echo "Nombre de rôles: " . $user->roles->count() . "\n";
foreach ($user->roles as $role) {
    echo "  - ID: {$role->id}, Nom: '{$role->nom}', Libelle: '{$role->libelle}'\n";
}
