<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\ChangePasswordRequest;
use App\Http\Requests\Profile\UpdatePhotoRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Récupérer le profil complet de l'utilisateur connecté
     */
    public function show(): JsonResponse
    {
        $user = auth()->user();

        // Charger les relations selon le rôle
        $user->load('roles');

        if ($user->isAgent() && $user->profilAgentAdministratif) {
            $user->profilAgentAdministratif->load('service');
        }

        $response = [
            'id' => $user->id,
            'nom' => $user->nom,
            'prenom' => $user->prenom,
            'nom_complet' => $user->nom . ' ' . $user->prenom,
            'email' => $user->email,
            'telephone' => $user->telephone,
            'photo' => $user->photo,
            // 'photo_url' => $user->photo_url,
            'is_active' => $user->is_active,
            'email_verified_at' => $user->email_verified_at,
            'roles' => $user->roles->pluck('nom'),
        ];

        // Ajouter le profil spécifique selon le rôle
        if ($user->isEtudiant() && $user->profilEtudiant) {
            $response['profil_etudiant'] = $user->profilEtudiant;
        }

        if ($user->isAgent() && $user->profilAgentAdministratif) {
            $response['profil_agent'] = $user->profilAgentAdministratif;
        }

        if ($user->isResponsable() && $user->profilResponsablePedagogique) {
            $response['profil_responsable'] = $user->profilResponsablePedagogique;
        }

        if ($user->isAdmin() && $user->profilAdministrateur) {
            $response['profil_admin'] = $user->profilAdministrateur;
        }

        return response()->json([
            'success' => true,
            'data' => $response
        ]);
    }

    /**
     * Mettre à jour TOUT le profil (infos perso + profil spécifique)
     */
    public function update(): JsonResponse
    {
        $user = auth()->user();

        // Valider les données pour l'utilisateur
        $userData = request()->validate([
            'nom' => ['sometimes', 'string', 'max:255'],
            'prenom' => ['sometimes', 'string', 'max:255'],
            'telephone' => ['sometimes', 'nullable', 'string', 'max:20'],
        ]);

        // Mettre à jour les infos de l'utilisateur
        if (!empty($userData)) {
            $user->update($userData);
        }

        // Mettre à jour le profil spécifique selon le rôle
        $message = 'Profil mis à jour avec succès.';

        if ($user->isEtudiant() && $user->profilEtudiant) {
            $profilData = request()->validate([
                'matricule' => ['sometimes', 'nullable', 'string', 'max:50'],
                'niveau' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:5'],
                'filiere' => ['sometimes', 'nullable', 'string', 'max:255'],
            ]);

            if (!empty($profilData)) {
                $user->profilEtudiant->update($profilData);
            }
        }

        elseif ($user->isAgent() && $user->profilAgentAdministratif) {
            $profilData = request()->validate([
                'poste' => ['sometimes', 'nullable', 'string', 'max:255'],
                'service_id' => ['sometimes', 'nullable', 'exists:services,id'],
            ]);

            if (!empty($profilData)) {
                $user->profilAgentAdministratif->update($profilData);
            }
        }

        elseif ($user->isResponsable() && $user->profilResponsablePedagogique) {
            $profilData = request()->validate([
                'departement' => ['sometimes', 'nullable', 'string', 'max:255'],
            ]);

            if (!empty($profilData)) {
                $user->profilResponsablePedagogique->update($profilData);
            }
        }

        elseif ($user->isAdmin() && $user->profilAdministrateur) {
            $profilData = request()->validate([
                'niveau_acces' => ['sometimes', 'in:super_admin,admin'],
            ]);

            if (!empty($profilData)) {
                $user->profilAdministrateur->update($profilData);
            }
        }

        // Recharger les données fraîches
        $user->refresh();

        if ($user->isAgent() && $user->profilAgentAdministratif) {
            $user->profilAgentAdministratif->load('service');
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'user' => $user->only(['id', 'nom', 'prenom', 'email', 'telephone', 'photo_url']),
                'profil' => $user->getProfil(),
            ]
        ]);
    }

    /**
     * Changer la photo de profil
     */
    public function updatePhoto(UpdatePhotoRequest $request): JsonResponse
    {
        $user = auth()->user();

        // Supprimer l'ancienne photo si elle existe
        if ($user->photo) {
            Storage::delete('public/' . $user->photo);
        }

        // Sauvegarder la nouvelle photo
        $path = $request->file('photo')->store('photos', 'public');
        $user->photo = $path;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Photo de profil mise à jour avec succès.',
            'data' => [
                'photo_url' => $user->photo_url
            ]
        ]);
    }

    /**
     * Changer le mot de passe
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = auth()->user();

        // Vérifier l'ancien mot de passe
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Le mot de passe actuel est incorrect.'
            ], 422);
        }

        // Mettre à jour le mot de passe
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe changé avec succès.'
        ]);
    }
}
