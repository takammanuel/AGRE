<?php

namespace App\Http\Controllers;

use App\Models\Requete;
use Illuminate\Http\Request;

class RequeteController extends Controller
{
    /**
     * Liste les requêtes pour l'Agent (si pas de paramètre)
     * ou pour l'Étudiant (si utilisateur_id est présent)
     */
    public function index(Request $request)
    {
        $userId = $request->query('utilisateur_id');
        $query = Requete::with(['typeRequete', 'etudiant']);

        if ($userId) {
            $query->where('etudiant_id', $userId);
        }

        $requetes = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['success' => true, 'data' => $requetes]);
    }

    /**
     * NOUVELLE METHODE : Pour la route /requetes/etudiant/{id}
     * C'est celle-ci que Manuel va appeler pour son Historique
     */
    public function getByEtudiant($id)
    {
        $requetes = Requete::with(['typeRequete'])
            ->where('etudiant_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $requetes]);
    }

    /**
     * ACTION CRUCIALE : Mise à jour du statut par l'Agent
     * Déclenchée par Alice pour envoyer la requête dans l'historique
     */
    public function updateStatut(Request $request, $id)
    {
        $requete = Requete::findOrFail($id);

        $validated = $request->validate([
            'statut' => 'required|in:En attente,En cours,Terminée,Rejetée'
        ]);

        $requete->update(['statut' => $validated['statut']]);

        return response()->json([
            'success' => true,
            'message' => 'Statut mis à jour avec succès',
            'data' => $requete
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'required|string',
            'utilisateur_id' => 'required|exists:utilisateurs,id',
            'type_requete_id' => 'nullable|exists:type_requetes,id',
        ]);

        $requete = Requete::create([
            'code_requete'    => uniqid('REQ-'),
            'titre'           => $validated['titre'],
            'description'     => $validated['description'],
            'etudiant_id'     => $validated['utilisateur_id'],
            'utilisateur_id'  => $validated['utilisateur_id'],
            'type_requete_id' => $validated['type_requete_id'] ?? 1,
            'statut'          => 'En attente',
            'priorite'        => 'Normale'
        ]);

        return response()->json(['success' => true, 'data' => $requete], 201);
    }

    public function show($id)
    {
        $requete = Requete::with(['typeRequete', 'etudiant', 'agent', 'responsable', 'messages.emetteur'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $requete]);
    }
}
