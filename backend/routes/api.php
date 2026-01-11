<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RequeteController;
use App\Http\Controllers\Api\Admin\ServiceController;
use App\Http\Controllers\Api\Admin\TypeRequeteController;
use App\Http\Controllers\Api\Admin\UtilisateurController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\VerificationController;
use App\Http\Controllers\Api\Auth\ProfileController;
use App\Http\Controllers\Api\Etudiant\EtudiantRequestController;
use App\Http\Controllers\Api\Agent\AgentRequestController;
use App\Http\Controllers\Api\Responsable\ResponsableRequestController;
use App\Http\Controllers\Api\AttachmentController;
use App\Http\Controllers\Api\RequestHistoryController;
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

    Route::get('/type-requetes/students', [TypeRequeteController::class, 'typeRequestForStudents']);

    /*
    |--------------------------------------------------------------------------
    | Routes pour les responsables pédagogiques
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:RESPONSABLE_PEDAGOGIQUE')->group(function () {
        // Liste des étudiants (accessible aux responsables)
        Route::get('/etudiants', function () {
            $etudiants = \App\Models\Utilisateur::with('profilEtudiant')
                ->whereHas('roles', function($q) {
                    $q->where('nom', 'ETUDIANT');
                })
                ->where('is_active', true)
                ->paginate(15);
            return response()->json($etudiants);
        });
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
        Route::get('/conversations', [MessageController::class, 'getConversations']); // Liste des conversations
        Route::post('/', [MessageController::class, 'store']); // Envoi de message + Création notif
        Route::post('/{requete_id}/mark-read', [MessageController::class, 'markAsRead']); // Marquer comme lu
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

    /*
    |--------------------------------------------------------------------------
    | Routes pour les REQUÊTES (Module 2)
    |--------------------------------------------------------------------------
    */

    // Routes Étudiant - Requêtes
    Route::middleware('role:ETUDIANT')->prefix('my-requests')->group(function () {
        Route::get('/', [EtudiantRequestController::class, 'index']);
        Route::post('/', [EtudiantRequestController::class, 'store']);
        Route::get('/{requete}', [EtudiantRequestController::class, 'show']);
        Route::put('/{requete}', [EtudiantRequestController::class, 'update']);
        Route::delete('/{requete}', [EtudiantRequestController::class, 'destroy']);
    });

    // Routes Agent - Requêtes
    Route::middleware('role:AGENT_ACADEMIQUE')->prefix('assigned-requests')->group(function () {
        Route::get('/', [AgentRequestController::class, 'index']);
        Route::get('/{requete}', [AgentRequestController::class, 'show']);
        Route::post('/{requete}/take-charge', [AgentRequestController::class, 'takeCharge']);
        Route::post('/{requete}/process', [AgentRequestController::class, 'process']);
        Route::post('/{requete}/reassign', [AgentRequestController::class, 'reassign']);
    });

    // Routes Responsable Pédagogique - Requêtes
    Route::middleware('role:RESPONSABLE_PEDAGOGIQUE')->prefix('pending-approvals')->group(function () {
        Route::get('/', [ResponsableRequestController::class, 'index']);
        Route::get('/{requete}', [ResponsableRequestController::class, 'show']);
        Route::post('/{requete}/approve', [ResponsableRequestController::class, 'approve']);
    });

    // Routes communes - Pièces jointes et Historique
    Route::prefix('requests')->group(function () {
        Route::get('/{requete}/history', [RequestHistoryController::class, 'index']);
        Route::post('/{requete}/attachments', [AttachmentController::class, 'store']);
    });

    Route::prefix('attachments')->group(function () {
        Route::get('/{attachment}/download', [AttachmentController::class, 'download']);
        Route::delete('/{attachment}', [AttachmentController::class, 'destroy']);
    });
});


