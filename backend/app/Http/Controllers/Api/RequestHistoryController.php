<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Requete;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RequestHistoryController extends Controller
{
    /**
     * Obtenir l'historique complet d'une requête
     */
    public function index(Request $request, Requete $requete): JsonResponse
    {
        $user = $request->user();

        // Vérifier les permissions
        $canView = false;

        if ($user->isEtudiant() && $requete->etudiant_id === $user->id) {
            $canView = true;
        } elseif ($user->isAgent() && $requete->typeRequete->service_id === $user->profilAgentAdministratif->service_id) {
            $canView = true;
        } elseif ($user->isResponsable() || $user->isAdmin()) {
            $canView = true;
        }

        if (!$canView) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé.'
            ], 403);
        }

        $historiques = $requete->historiques()
            ->with(['etat', 'utilisateur'])
            ->orderBy('date_etat', 'asc')
            ->get();

        // Calculer la durée entre chaque étape
        $historiques = $historiques->map(function($historique, $index) use ($historiques) {
            $historique->duree = null;
            
            if ($index > 0) {
                $precedent = $historiques[$index - 1];
                $duree = $historique->date_etat->diffInHours($precedent->date_etat);
                $historique->duree = $duree . ' heures';
            }
            
            return $historique;
        });

        return response()->json([
            'success' => true,
            'data' => $historiques
        ]);
    }
}

