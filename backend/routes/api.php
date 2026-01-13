<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RequeteController;
use App\Http\Controllers\Api\Admin\ServiceController;
use App\Http\Controllers\Api\Admin\TypeRequeteController;
use App\Http\Controllers\Api\Admin\UtilisateurController;
use App\Http\Controllers\Api\Admin\DashboardController;
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
use App\Http\Controllers\Api\Agent\RequeteAgentController;
use App\Http\Controllers\Api\Agent\MessagerieController;
use App\Http\Controllers\Api\Etudiant\RequeteEtudiantController;

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
        Route::delete('/', [ProfileController::class, 'destroy']);
    });

    /*
    |--------------------------------------------------------------------------
    | Routes pour les notifications (tous les utilisateurs authentifiés)
    |--------------------------------------------------------------------------
    */
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });

    /*
    |--------------------------------------------------------------------------
    | Routes pour les étudiants
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:ETUDIANT')->prefix('etudiant')->group(function () {
        // Dashboard
        Route::get('/dashboard', [RequeteEtudiantController::class, 'dashboard']);

        // Requêtes
        Route::get('/requetes', [RequeteEtudiantController::class, 'index']);
        Route::get('/requetes/search', [RequeteEtudiantController::class, 'search']);
        Route::get('/requetes/{id}', [RequeteEtudiantController::class, 'show']);
        Route::post('/requetes', [RequeteEtudiantController::class, 'store']);

        // Types de requêtes
        Route::get('/types-requetes', [RequeteEtudiantController::class, 'typesRequetes']);
    });

    Route::get('/type-requetes/students', [TypeRequeteController::class, 'typeRequestForStudents']);

    /*
    |--------------------------------------------------------------------------
    | Routes pour les responsables pédagogiques
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:RESPONSABLE_PEDAGOGIQUE')->prefix('responsable')->group(function () {
        // Dashboard
        Route::get('/dashboard', [\App\Http\Controllers\Api\Responsable\RequeteResponsableController::class, 'dashboard']);

        // Requêtes
        Route::get('/requetes', [\App\Http\Controllers\Api\Responsable\RequeteResponsableController::class, 'index']);
        Route::get('/requetes/search', [\App\Http\Controllers\Api\Responsable\RequeteResponsableController::class, 'search']);
        Route::get('/requetes/{id}', [\App\Http\Controllers\Api\Responsable\RequeteResponsableController::class, 'show']);

        // Approbations
        Route::get('/approbations', [\App\Http\Controllers\Api\Responsable\RequeteResponsableController::class, 'approbations']);
        Route::post('/approbations/{id}/approuver', [\App\Http\Controllers\Api\Responsable\RequeteResponsableController::class, 'approuver']);
        Route::post('/approbations/{id}/rejeter', [\App\Http\Controllers\Api\Responsable\RequeteResponsableController::class, 'rejeter']);

        // Requêtes escaladées
        Route::get('/requetes-escaladees', [\App\Http\Controllers\Api\Responsable\RequeteResponsableController::class, 'requetesEscaladees']);

        // Historique
        Route::get('/historique', [\App\Http\Controllers\Api\Responsable\RequeteResponsableController::class, 'historique']);

        // Statistiques
        Route::get('/statistiques', [\App\Http\Controllers\Api\Responsable\RequeteResponsableController::class, 'statistiques']);

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
    /*
    |--------------------------------------------------------------------------
    | Routes pour les agents académiques
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:AGENT_ACADEMIQUE')->prefix('agent')->group(function () {
        // Dashboard et requêtes
        Route::get('/dashboard', [RequeteAgentController::class, 'dashboard']);
        Route::get('/statistiques', [RequeteAgentController::class, 'statistiques']);
        Route::get('/requetes', [RequeteAgentController::class, 'index']);
        Route::get('/requetes/search', [RequeteAgentController::class, 'search']);
        Route::get('/requetes/{id}', [RequeteAgentController::class, 'show']);

        // Actions sur les requêtes
        Route::post('/requetes/{id}/prendre-en-charge', [RequeteAgentController::class, 'prendreEnCharge']);
        Route::post('/requetes/{id}/traiter', [RequeteAgentController::class, 'traiter']);
        Route::post('/requetes/{id}/rejeter', [RequeteAgentController::class, 'rejeter']);
        Route::post('/requetes/{id}/commentaire', [RequeteAgentController::class, 'ajouterCommentaire']);
        Route::post('/requetes/{id}/escalader', [RequeteAgentController::class, 'escalader']);

        // Messagerie
        Route::prefix('messagerie')->group(function () {
            Route::get('/conversations', [MessagerieController::class, 'conversations']);
            Route::get('/conversation/{userId}', [MessagerieController::class, 'conversation']);
            Route::post('/send', [MessagerieController::class, 'send']);
            Route::put('/{messageId}/read', [MessagerieController::class, 'markAsRead']);
            Route::get('/unread-count', [MessagerieController::class, 'unreadCount']);
            Route::get('/etudiants', [MessagerieController::class, 'etudiants']);
        });

        // Liste des étudiants (accessible aux agents)
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

        // Dashboard et statistiques
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/badge-counts', [DashboardController::class, 'badgeCounts']);
        Route::get('/requetes/search', [DashboardController::class, 'searchRequetes']);
        Route::get('/approbations', [DashboardController::class, 'approbations']);
        Route::post('/approbations/{id}/approuver', [DashboardController::class, 'approuver']);
        Route::post('/approbations/{id}/rejeter', [DashboardController::class, 'rejeter']);
        Route::get('/requetes-escaladees', [DashboardController::class, 'requetesEscaladees']);
        Route::get('/historique', [DashboardController::class, 'historique']);

        // CRUD Utilisateurs
        Route::get('/utilisateurs', [UtilisateurController::class, 'index']);
        Route::get('/utilisateurs/{id}', [UtilisateurController::class, 'show']);
        Route::post('/utilisateurs', [UtilisateurController::class, 'store']);
        Route::put('/utilisateurs/{id}', [UtilisateurController::class, 'update']);
        Route::delete('/utilisateurs/{id}', [UtilisateurController::class, 'destroy']);

        // Actions supplémentaires sur les utilisateurs
        Route::put('/utilisateurs/{id}/activate', [UtilisateurController::class, 'toggleActivation']);
        Route::post('/utilisateurs/{id}/roles', [UtilisateurController::class, 'manageRoles']);
        Route::put('/utilisateurs/{id}/reset-password', [UtilisateurController::class, 'resetPassword']);

        Route::apiResource('services', ServiceController::class)->except(['create', 'edit']);
        Route::apiResource('types-requetes', TypeRequeteController::class)->except(['create', 'edit']);

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


