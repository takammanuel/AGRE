<?php

use App\Http\Controllers\Api\Admin\RolePermissionController;
use App\Http\Controllers\Api\Admin\ServiceController;
use App\Http\Controllers\Api\Admin\TypeRequeteController;
use App\Http\Controllers\Api\Admin\UtilisateurController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\VerificationController;
use App\Http\Controllers\Api\Auth\ProfileController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RequeteController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', RegisterController::class);
    Route::post('/login', LoginController::class)->name('login');

    // Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])
    //     ->middleware('signed')
    //     ->name('verification.verify');

    // Route::post('/email/resend/{userId}', [VerificationController::class, 'resend'])
    //     ->name('verification.resend');
});

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/auth/logout', LogoutController::class);

    Route::prefix('auth/profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::put('/', [ProfileController::class, 'update']);
        Route::post('/photo', [ProfileController::class, 'updatePhoto']);
        Route::put('/password', [ProfileController::class, 'changePassword']);
    });

    /*
    |--------------------------------------------------------------------------
    | Routes pour les responsables pédagogiques
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:RESPONSABLE_PEDAGOGIQUE')->group(function () {
        Route::get('/etudiants', function () {
            $etudiants = \App\Models\Utilisateur::with('profilEtudiant')
                ->whereHas('roles', function($q) {
                    $q->where('nom', 'ETUDIANT');
                })
                ->where('is_active', true)
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $etudiants
            ]);
        });

        Route::get('/agents', function () {
            $agents = \App\Models\Utilisateur::with(['profilAgentAdministratif', 'profilAgentAdministratif.service'])
                ->whereHas('roles', function($q) {
                    $q->where('nom', 'AGENT_ACADEMIQUE');
                })
                ->where('is_active', true)
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $agents
            ]);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Routes pour les agents académiques
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:AGENT_ACADEMIQUE')->group(function () {
        Route::get('/etudiants', function () {
            $etudiants = \App\Models\Utilisateur::with('profilEtudiant')
                ->whereHas('roles', function($q) {
                    $q->where('nom', 'ETUDIANT');
                })
                ->where('is_active', true)
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $etudiants
            ]);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Routes ADMIN - Accessible uniquement aux administrateurs
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')->middleware('role:ADMINISTRATEUR')->group(function () {
        Route::get('/utilisateurs', [UtilisateurController::class, 'index']);
        Route::get('/utilisateurs/{id}', [UtilisateurController::class, 'show']);
        Route::post('/utilisateurs', [UtilisateurController::class, 'store']);
        Route::put('/utilisateurs/{id}', [UtilisateurController::class, 'update']);
        Route::delete('/utilisateurs/{id}', [UtilisateurController::class, 'destroy']);

        Route::put('/utilisateurs/{id}/activate', [UtilisateurController::class, 'toggleActivation']);
        Route::post('/utilisateurs/{id}/roles', [UtilisateurController::class, 'manageRoles']);
        Route::put('/utilisateurs/{id}/reset-password', [UtilisateurController::class, 'resetPassword']);

        Route::apiResource('services', ServiceController::class)->except(['create', 'edit']);
        Route::apiResource('type-requetes', TypeRequeteController::class)->except(['create', 'edit']);

        Route::prefix('roles-permissions')->group(function () {
            Route::get('/roles', [RolePermissionController::class, 'roles']);
            Route::get('/roles/{role}', [RolePermissionController::class, 'showRole']);
            Route::put('/roles/{role}/permissions', [RolePermissionController::class, 'updateRolePermissions']);
            Route::get('/permissions', [RolePermissionController::class, 'permissions']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Routes pour le module Messages
    |--------------------------------------------------------------------------
    */
    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::patch('/messages/{id}/read', [MessageController::class, 'markAsRead']);

    /*
    |--------------------------------------------------------------------------
    | Routes pour le module Notifications
    |--------------------------------------------------------------------------
    */
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications', [NotificationController::class, 'store']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
});
Route::middleware('auth:sanctum')->group(function () {
    // Requêtes

Route::post('/requetes', [RequeteController::class, 'store']);
Route::get('/requetes/{id}', [RequeteController::class, 'show']);
Route::put('/requetes/{id}/statut', [RequeteController::class, 'updateStatut']);
Route::get('/requetes/{id}/notifications', [RequeteController::class, 'notifications']);
Route::get('/requetes/{id}/historiques', [RequeteController::class, 'historiques']);

});

