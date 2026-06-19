<?php

// Test direct de l'accès étudiant sans passer par le serveur

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Http\Kernel');

// 1. Login d'abord
echo "=== LOGIN ===\n";
$loginRequest = \Illuminate\Http\Request::create(
    '/api/auth/login',
    'POST',
    [
        'email' => 'tetchoup@gmail.com',
        'password' => 'password123'
    ]
);
$loginRequest->headers->set('Accept', 'application/json');

$loginResponse = $kernel->handle($loginRequest);
$loginData = json_decode($loginResponse->getContent(), true);

if ($loginResponse->getStatusCode() === 200) {
    $token = $loginData['access_token'];
    echo "✅ Login réussi! Token: " . substr($token, 0, 20) . "...\n\n";
    
    // 2. Tester l'accès à /api/etudiant/requetes
    echo "=== TEST ACCÈS LISTE REQUÊTES ===\n";
    $requetesRequest = \Illuminate\Http\Request::create(
        '/api/etudiant/requetes',
        'GET'
    );
    $requetesRequest->headers->set('Accept', 'application/json');
    $requetesRequest->headers->set('Authorization', 'Bearer ' . $token);
    
    $requetesResponse = $kernel->handle($requetesRequest);
    echo "Status: " . $requetesResponse->getStatusCode() . "\n";
    echo "Response: " . $requetesResponse->getContent() . "\n\n";
    
    // 3. Tester la création de requête
    echo "=== TEST CRÉATION REQUÊTE ===\n";
    $createRequest = \Illuminate\Http\Request::create(
        '/api/etudiant/requetes',
        'POST',
        [
            'type_requete_id' => 1,
            'description' => 'Test de création depuis script PHP',
            'priorite' => 'STANDARD'
        ]
    );
    $createRequest->headers->set('Accept', 'application/json');
    $createRequest->headers->set('Authorization', 'Bearer ' . $token);
    
    $createResponse = $kernel->handle($createRequest);
    echo "Status: " . $createResponse->getStatusCode() . "\n";
    echo "Response: " . substr($createResponse->getContent(), 0, 500) . "...\n";
} else {
    echo "❌ Échec du login\n";
    echo $loginResponse->getContent() . "\n";
}
