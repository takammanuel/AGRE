<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class LogoutController extends Controller
{
    public function __invoke(): JsonResponse
    {
        // Récupérer l'utilisateur connecté
        $user = auth()->user();

        if ($user) {
            // Supprimer le token courant
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Déconnexion réussie.'
        ]);
    }
}
