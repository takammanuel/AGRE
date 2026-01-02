<?php

namespace App\Http\Controllers;

use App\Models\Requete;
use Illuminate\Http\Request;
use App\Events\RequestStatusChanged;

class RequeteController extends Controller
{
    /**
     * Créer une nouvelle requête
     */
public function store(Request $request)
{
    $validated = $request->validate([
        'titre' => 'required|string|max:255',
        'description' => 'required|string',
        'utilisateur_id' => 'required|exists:utilisateurs,id',
    ]);

    // Génération automatique du code
    $validated['code_requete'] = uniqid('REQ-');

    // Associer automatiquement l'étudiant
    $validated['etudiant_id'] = $validated['utilisateur_id'];
    $validated['type_requete_id'] = $request->type_requete_id ?? 1;

    $requete = Requete::create($validated);

    return response()->json([
        'success' => true,
        'data' => $requete

    ]);
}

    /**
     * Afficher une requête avec ses notifications et historiques
     */
    public function show($id)
    {
        $requete = Requete::with(['notifications', 'historiques.etat', 'historiques.utilisateur'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $requete
        ]);
    }

    /**
     * Mettre à jour le statut d'une requête et déclencher l'événement
     */
    public function updateStatut(Request $request, $id)
    {
        $request->validate([
            'statut' => 'required|string'
        ]);

        $requete = Requete::findOrFail($id);
        $requete->update(['statut' => $request->statut]);

        // Déclenchement de l’événement
        event(new RequestStatusChanged($requete));

        return response()->json([
            'success' => true,
            'message' => "Statut mis à jour en {$requete->statut}"
        ]);
    }

    /**
     * Récupérer les notifications liées à une requête
     */
    public function notifications($id)
    {
        $notifications = Requete::findOrFail($id)->notifications;

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    /**
     * Récupérer les historiques liés à une requête
     */
    public function historiques($id)
    {
        $historiques = Requete::findOrFail($id)
            ->historiques()
            ->with(['etat', 'utilisateur'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $historiques
        ]);
    }
}
