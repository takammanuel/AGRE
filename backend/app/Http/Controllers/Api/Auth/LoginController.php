<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Utilisateur;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    public function __invoke(LoginRequest $request): JsonResponse
    {
        // 1. Chercher l'utilisateur par email
        $user = Utilisateur::where('email', $request->email)->first();

        // 2. Vérifier si l'utilisateur existe et le mot de passe
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Identifiants incorrects.'
            ], 401);
        }

        // 3. Vérifier si l'email est vérifié
        if (!$user->email_verified_at) {
            return response()->json([
                'message' => 'Veuillez vérifier votre email avant de vous connecter.',
                'requires_verification' => true,
                'user_id' => $user->id,
            ], 403);
        }

        // 4. Vérifier si le compte est actif
        if (!$user->is_active) {
            return response()->json([
                'message' => 'Votre compte a été désactivé.'
            ], 403);
        }

        // 5. Créer le token Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        // 6. Retourner la réponse
        return response()->json([
            'message' => 'Connexion réussie.',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'telephone' => $user->telephone,
                'roles' => $user->roles->pluck('libelle'),
                'profil_type' => $user->isEtudiant() ? 'etudiant' :
                               ($user->isAgent() ? 'agent' :
                               ($user->isResponsable() ? 'responsable' :
                               ($user->isAdmin() ? 'admin' : null))),
                'has_profil_complet' => $user->profilEtudiant ? $user->profilEtudiant->isComplete() : false,
            ]
        ]);
    }
}
