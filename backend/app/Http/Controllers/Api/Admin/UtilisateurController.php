<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUtilisateurRequest;
use App\Http\Requests\Admin\UpdateUtilisateurRequest;
use App\Models\ProfilAdministrateur;
use App\Models\ProfilAgentAdministratif;
use App\Models\ProfilEtudiant;
use App\Models\ProfilResponsablePedagogique;
use App\Models\Utilisateur;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UtilisateurController extends Controller
{
    /**
     * Liste les utilisateurs selon le rôle
     *
     * Règles d'accès :
     * - Admin : Voir tous
     * - Responsable : Voir étudiants et agents
     * - Agent : Voir étudiants uniquement
     * - Étudiant : Accès interdit
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();

            // Définir les rôles autorisés à voir selon le rôle de l'utilisateur connecté
            $allowedRoles = $this->getAllowedRolesForView($user);

            if (empty($allowedRoles)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès interdit.',
                ], 403);
            }

            $query = Utilisateur::with(['roles', 'profilEtudiant', 'profilAgentAdministratif', 'profilResponsablePedagogique', 'profilAdministrateur']);

            // Filtrer par rôle autorisé
            $query->whereHas('roles', function($q) use ($allowedRoles) {
                $q->whereIn('nom', $allowedRoles);
            });

            // Filtre par rôle spécifique (si fourni et autorisé)
            if ($request->has('role') && in_array($request->role, $allowedRoles)) {
                $query->withRole($request->role);
            }

            // Filtre par statut actif/inactif
            if ($request->has('is_active')) {
                $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
                $query->where('is_active', $isActive);
            }

            // Filtre email vérifié/non vérifié
            if ($request->has('email_verified')) {
                $emailVerified = filter_var($request->email_verified, FILTER_VALIDATE_BOOLEAN);
                if ($emailVerified) {
                    $query->verified();
                } else {
                    $query->unverified();
                }
            }

            // Recherche par nom, prénom ou email
            if ($request->has('search')) {
                $query->search($request->search);
            }

            // Exclure l'utilisateur courant
            $query->where('id', '!=', $user->id);

            // Tri
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $utilisateurs = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $utilisateurs->items(),
                'pagination' => [
                    'total' => $utilisateurs->total(),
                    'per_page' => $utilisateurs->perPage(),
                    'current_page' => $utilisateurs->currentPage(),
                    'last_page' => $utilisateurs->lastPage(),
                    'from' => $utilisateurs->firstItem(),
                    'to' => $utilisateurs->lastItem(),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des utilisateurs', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des utilisateurs.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Détermine quels rôles un utilisateur peut voir
     */
    private function getAllowedRolesForView(Utilisateur $user): array
    {
        if ($user->isAdmin()) {
            return ['ETUDIANT', 'AGENT_ACADEMIQUE', 'RESPONSABLE_PEDAGOGIQUE', 'ADMINISTRATEUR'];
        }

        if ($user->isResponsable()) {
            return ['ETUDIANT', 'AGENT_ACADEMIQUE'];
        }

        if ($user->isAgent()) {
            return ['ETUDIANT'];
        }

        // Étudiant ne peut voir personne
        return [];
    }

    /**
     * Afficher les détails d'un utilisateur (avec vérification d'accès)
     */
    public function show(int $id): JsonResponse
    {
        try {
            $currentUser = auth()->user();
            $utilisateur = Utilisateur::with([
                'roles.permissions',
                'profilEtudiant',
                'profilAgentAdministratif.service',
                'profilResponsablePedagogique',
                'profilAdministrateur'
            ])->findOrFail($id);

            // Vérifier si l'utilisateur courant a le droit de voir cet utilisateur
            if (!$this->canViewUser($currentUser, $utilisateur)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès interdit.',
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $utilisateur->id,
                    'nom' => $utilisateur->nom,
                    'prenom' => $utilisateur->prenom,
                    'nom_complet' => $utilisateur->nom_complet,
                    'email' => $utilisateur->email,
                    'telephone' => $utilisateur->telephone,
                    'photo' => $utilisateur->photo,
                    'photo_url' => $utilisateur->photo_url,
                    'is_active' => $utilisateur->is_active,
                    'email_verified_at' => $utilisateur->email_verified_at,
                    'is_verified' => $utilisateur->isEmailVerified(),
                    'roles' => $utilisateur->roles,
                    'profil_type' => $utilisateur->getProfilType(),
                    'profil' => $utilisateur->getProfil(),
                    'created_at' => $utilisateur->created_at,
                    'updated_at' => $utilisateur->updated_at,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé.',
            ], 404);
        }
    }

    /**
     * Vérifie si un utilisateur peut en voir un autre
     */
    private function canViewUser(Utilisateur $viewer, Utilisateur $target): bool
    {
        // On peut toujours se voir soi-même
        if ($viewer->id === $target->id) {
            return true;
        }

        // Admin peut voir tout le monde
        if ($viewer->isAdmin()) {
            return true;
        }

        // Responsable peut voir étudiants et agents
        if ($viewer->isResponsable()) {
            return $target->isEtudiant() || $target->isAgent();
        }

        // Agent peut voir seulement les étudiants
        if ($viewer->isAgent()) {
            return $target->isEtudiant();
        }

        // Étudiant ne peut voir personne d'autre
        return false;
    }

    /**
     * Créer un nouvel utilisateur (Admin uniquement)
     */
    public function store(StoreUtilisateurRequest $request): JsonResponse
    {
        // Vérifier que seul l'admin peut créer des utilisateurs
        if (!auth()->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès interdit. Admin uniquement.',
            ], 403);
        }

        DB::beginTransaction();

        try {
            // 1. Créer l'utilisateur
            $utilisateur = Utilisateur::create([
                'nom' => strtoupper($request->nom),
                'prenom' => ucfirst(strtolower($request->prenom)),
                'email' => strtolower($request->email),
                'password' => Hash::make($request->password),
                'telephone' => $request->telephone,
                'is_active' => $request->get('is_active', true),
                'email_verified_at' => now(),
            ]);

            // 2. Assigner le rôle
            $utilisateur->assignRole($request->role);

            // 3. Créer le profil selon le rôle
            $this->createProfil($utilisateur, $request->role, $request->profil_data ?? []);

            DB::commit();

            Log::info('Utilisateur créé par admin', [
                'admin_id' => auth()->id(),
                'utilisateur_id' => $utilisateur->id,
                'role' => $request->role
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur créé avec succès.',
                'data' => $utilisateur->load(['roles', 'profilEtudiant', 'profilAgentAdministratif', 'profilResponsablePedagogique', 'profilAdministrateur']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erreur lors de la création d\'utilisateur', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de l\'utilisateur.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Mettre à jour un utilisateur (Admin uniquement)
     */
    public function update(UpdateUtilisateurRequest $request, int $id): JsonResponse
    {
        // Vérifier que seul l'admin peut modifier les utilisateurs
        if (!auth()->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès interdit. Admin uniquement.',
            ], 403);
        }

        DB::beginTransaction();

        try {
            $utilisateur = Utilisateur::findOrFail($id);

            // Mise à jour des données de base
            $dataToUpdate = $request->only(['nom', 'prenom', 'email', 'telephone', 'is_active']);

            if ($request->has('nom')) {
                $dataToUpdate['nom'] = strtoupper($request->nom);
            }
            if ($request->has('prenom')) {
                $dataToUpdate['prenom'] = ucfirst(strtolower($request->prenom));
            }
            if ($request->has('email')) {
                $dataToUpdate['email'] = strtolower($request->email);
            }
            if ($request->has('password')) {
                $dataToUpdate['password'] = Hash::make($request->password);
            }

            $utilisateur->update($dataToUpdate);

            // Mise à jour du profil si profil_data fourni
            if ($request->has('profil_data')) {
                $this->updateProfil($utilisateur, $request->profil_data);
            }

            DB::commit();

            Log::info('Utilisateur modifié par admin', [
                'admin_id' => auth()->id(),
                'utilisateur_id' => $utilisateur->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur modifié avec succès.',
                'data' => $utilisateur->fresh()->load(['roles', 'profilEtudiant', 'profilAgentAdministratif', 'profilResponsablePedagogique', 'profilAdministrateur']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erreur lors de la modification d\'utilisateur', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la modification de l\'utilisateur.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Supprimer un utilisateur (Admin uniquement)
     */
    public function destroy(int $id): JsonResponse
    {
        // Vérifier que seul l'admin peut supprimer des utilisateurs
        if (!auth()->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès interdit. Admin uniquement.',
            ], 403);
        }

        try {
            $utilisateur = Utilisateur::findOrFail($id);

            // Empêcher la suppression de son propre compte
            if ($utilisateur->id === auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez pas supprimer votre propre compte.',
                ], 403);
            }

            $utilisateur->delete();

            Log::info('Utilisateur supprimé par admin', [
                'admin_id' => auth()->id(),
                'utilisateur_id' => $utilisateur->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur supprimé avec succès.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé.',
            ], 404);
        }
    }

    // Les autres méthodes restent similaires mais doivent aussi vérifier les permissions...

    /**
     * HELPER: Créer le profil selon le rôle
     */
    private function createProfil(Utilisateur $utilisateur, string $role, array $profilData): void
    {
        // Même code que précédemment
    }

    /**
     * HELPER: Mettre à jour le profil
     */
    private function updateProfil(Utilisateur $utilisateur, array $profilData): void
    {
        // Même code que précédemment
    }
}
