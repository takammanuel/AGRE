<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Mail\EmailVerificationMail;
use App\Models\Utilisateur;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class VerificationController extends Controller
{
    /**
     * Vérifier l'email via le lien reçu
     */
    public function verify(Request $request)
    {
        // Récupérer l'utilisateur
        $user = Utilisateur::findOrFail($request->route('id'));

        // Log pour debug
        Log::info('Tentative de vérification email', [
            'user_id' => $user->id,
            'email' => $user->email,
            'hash_recu' => $request->route('hash'),
            'hash_attendu' => sha1($user->getEmailForVerification()),
            'email_verified_at_before' => $user->email_verified_at,
        ]);

        // Vérifier si l'email est déjà vérifié
        if ($user->hasVerifiedEmail()) {
            Log::info('Email déjà vérifié', ['user_id' => $user->id]);

            return view('email-verified', [
                'user' => $user,
                'already_verified' => true
            ]);
        }

        // Vérifier la signature du hash
        if (!hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
            Log::warning('Hash de vérification invalide', [
                'user_id' => $user->id,
                'hash_recu' => $request->route('hash'),
                'hash_attendu' => sha1($user->getEmailForVerification()),
            ]);

            return response()->view('errors.verification-failed', [], 400);
        }

        // Marquer l'email comme vérifié
        if ($user->markEmailAsVerified()) {
            Log::info('Email vérifié avec succès', [
                'user_id' => $user->id,
                'email' => $user->email,
                'email_verified_at_after' => $user->fresh()->email_verified_at,
            ]);

            event(new Verified($user));
        }

        // Retourner la vue de succès
        return view('email-verified', [
            'user' => $user,
            'already_verified' => false
        ]);
    }

    /**
     * Renvoyer l'email de vérification
     */
    public function resend($userId): JsonResponse
    {
        $user = Utilisateur::find($userId);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé.'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email déjà vérifié.'], 400);
        }

        try {
            // Renvoyer l'email
            Mail::to($user->email)->send(new EmailVerificationMail($user));

            Log::info('Email de vérification renvoyé', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);

            return response()->json([
                'message' => 'Nouveau lien de vérification envoyé à votre email.',
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors du renvoi de l\'email', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Erreur lors de l\'envoi de l\'email.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
