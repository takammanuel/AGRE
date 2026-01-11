<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RequeteController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\ProfileController;
use App\Http\Controllers\Api\Admin\UtilisateurController;
use App\Http\Controllers\Api\Admin\ServiceController;
use App\Http\Controllers\Api\Admin\TypeRequeteController;
use App\Http\Controllers\Api\Admin\RolePermissionController;

/*
|--------------------------------------------------------------------------
| API Routes - Projet AGRE
|--------------------------------------------------------------------------
*/

// --- ROUTES PUBLIQUES ---
Route::prefix('auth')->group(function () {
    Route::post('/register', RegisterController::class);
    Route::post('/login', LoginController::class)->name('login');
});

// --- ROUTES PROTÉGÉES (SANCTUM) ---
Route::middleware('auth:sanctum')->group(function () {

    // Authentification & Profil
    Route::post('/auth/logout', LogoutController::class);
    Route::prefix('auth/profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::put('/', [ProfileController::class, 'update']);
        Route::post('/photo', [ProfileController::class, 'updatePhoto']);
        Route::put('/password', [ProfileController::class, 'changePassword']);
    });

    // --- MODULE REQUÊTES ---
    Route::prefix('requetes')->group(function () {
        Route::get('/', [RequeteController::class, 'index']);
        Route::get('/etudiant/{id}', [RequeteController::class, 'getByEtudiant']);
        Route::post('/', [RequeteController::class, 'store']);
        Route::get('/{id}', [RequeteController::class, 'show']);
        Route::put('/{id}/statut', [RequeteController::class, 'updateStatut']);
        Route::get('/{id}/notifications', [RequeteController::class, 'notifications']);
        Route::get('/{id}/historiques', [RequeteController::class, 'historiques']);

        // Messages d'une requête spécifique
        Route::get('/{requete_id}/messages', [MessageController::class, 'getByRequete']);
    });

    // --- MODULE MESSAGES ---
    Route::prefix('messages')->group(function () {
        Route::post('/', [MessageController::class, 'store']); // Envoi de message + Création notif
        Route::get('/{requete_id}', [MessageController::class, 'getByRequete']);
    });

    // --- MODULE NOTIFICATIONS ---
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']); // Pour le badge rouge
        Route::patch('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/clear', [NotificationController::class, 'clearAll']);
    });

    // --- ADMINISTRATION ---
    Route::prefix('admin')->middleware('role:ADMINISTRATEUR')->group(function () {
        Route::apiResource('utilisateurs', UtilisateurController::class);
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

    // --- ACCÈS AGENTS / RESPONSABLES ---
    Route::middleware('role:RESPONSABLE_PEDAGOGIQUE,AGENT_ACADEMIQUE')->group(function () {
        Route::get('/liste-etudiants', function () {
            return \App\Models\Utilisateur::whereHas('roles', function($q) {
                $q->where('nom', 'ETUDIANT');
            })->paginate(20);
        });
    });
});
