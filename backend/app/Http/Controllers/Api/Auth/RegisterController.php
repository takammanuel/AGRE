<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Mail\EmailVerificationMail;
use App\Models\ProfilEtudiant;
use App\Models\Utilisateur;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class RegisterController extends Controller
{
    public function __invoke(RegisterRequest $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            // 1. Créer l'utilisateur
            $user = Utilisateur::create([
                'nom' => strtoupper($request->nom),
                'prenom' => ucfirst(strtolower($request->prenom)),
                'email' => strtolower($request->email),
                'password' => Hash::make($request->password),
                'telephone' => $request->telephone,
            ]);

            // 2. Attribuer le rôle ÉTUDIANT
            $user->assignRole('etudiant'); // ✅ Utilise 'etudiant' en minuscule (le 'nom' pas le 'libelle')

            // 3. Créer le profil étudiant vide
            ProfilEtudiant::create([
                'utilisateur_id' => $user->id,
            ]);

            // 4. Envoyer l'email de vérification
            Mail::to($user->email)->send(new EmailVerificationMail($user));

            // 5. Logger l'inscription
            Log::channel('daily')->info('📝 Nouvelle inscription', [
                'user_id' => $user->id,
                'email' => $user->email,
                'nom_complet' => $user->nom_complet,
                'timestamp' => now()->toDateTimeString()
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Inscription réussie ! Un email de vérification vous a été envoyé.',
                'user' => [
                    'id' => $user->id,
                    'nom' => $user->nom,
                    'prenom' => $user->prenom,
                    'email' => $user->email,
                    'telephone' => $user->telephone,
                    'roles' => $user->roles->pluck('libelle'),
                    'email_verified' => false,
                    'has_profil_etudiant' => true,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            // Logger l'erreur
            Log::channel('daily')->error('❌ Erreur lors de l\'inscription', [
                'email' => $request->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erreur lors de l\'inscription.',
                'error' => config('app.debug') ? $e->getMessage() : 'Une erreur est survenue.'
            ], 500);
        }
    }
}
