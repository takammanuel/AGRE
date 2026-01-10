<?php

namespace App\Http\Controllers\Api\Etudiant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Etudiant\StoreRequestRequest;
use App\Http\Requests\Etudiant\UpdateRequestRequest;
use App\Models\Etat;
use App\Models\Requete;
use App\Models\TypeRequete;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EtudiantRequestController extends Controller
{
    /**
     * Liste toutes les requêtes de l'étudiant connecté
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $query = Requete::where('etudiant_id', $user->id)
            ->with(['typeRequete.service', 'agent', 'piecesJointes'])
            ->with(['historiques' => function($q) {
                $q->with('etat')->orderBy('date_etat', 'desc');
            }]);

        // Filtres
        if ($request->has('statut')) {
            $etatId = Etat::where('libelle', $request->statut)->value('id');
            if ($etatId) {
                $query->whereHas('historiques', function($q) use ($etatId) {
                    $q->where('etat_id', $etatId)
                      ->whereRaw('date_etat = (SELECT MAX(date_etat) FROM historique_requetes WHERE requete_id = requetes.id)');
                });
            }
        }

        if ($request->has('type_requete_id')) {
            $query->where('type_requete_id', $request->type_requete_id);
        }

        if ($request->has('date_debut')) {
            $query->whereDate('created_at', '>=', $request->date_debut);
        }

        if ($request->has('date_fin')) {
            $query->whereDate('created_at', '<=', $request->date_fin);
        }

        // Recherche par numéro
        if ($request->has('recherche')) {
            $query->where('code_requete', 'like', '%' . $request->recherche . '%');
        }

        // Tri
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $requetes = $query->paginate($request->get('per_page', 15));

        // Ajouter l'état actuel à chaque requête
        $requetes->getCollection()->transform(function($requete) {
            $requete->etat_actuel = $requete->etatActuel;
            return $requete;
        });

        return response()->json([
            'success' => true,
            'data' => $requetes
        ]);
    }

    /**
     * Soumettre une nouvelle requête
     */
    public function store(StoreRequestRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $user = $request->user();
            $typeRequete = TypeRequete::findOrFail($request->type_requete_id);

            // Générer le code de requête
            $codeRequete = Requete::genererCodeRequete();

            // Créer la requête
            $requete = Requete::create([
                'code_requete' => $codeRequete,
                'type_requete_id' => $request->type_requete_id,
                'etudiant_id' => $user->id,
                'description' => $request->description,
                'priorite' => $request->priorite,
            ]);

            // Enregistrer l'état initial : EN_ATTENTE
            $etatEnAttente = Etat::where('libelle', 'EN_ATTENTE')->first();
            $requete->changerEtat('EN_ATTENTE', $user->id);

            // Upload des pièces jointes
            if ($request->hasFile('pieces_jointes')) {
                foreach ($request->file('pieces_jointes') as $file) {
                    $path = $file->store('requetes/' . $requete->id, 'public');
                    
                    $requete->piecesJointes()->create([
                        'nom' => $file->getClientOriginalName(),
                        'chemin_fichier' => $path,
                    ]);
                }
            }

            // Affectation automatique au service
            if ($typeRequete->service_id) {
                $requete->changerEtat('AFFECTEE', null);
                
                // TODO: Déclencher notification aux agents du service
                // Event::dispatch(new RequestAssigned($requete));
            }

            DB::commit();

            $requete->load(['typeRequete.service', 'piecesJointes', 'historiques.etat']);

            return response()->json([
                'success' => true,
                'message' => 'Requête soumise avec succès. Numéro de suivi : ' . $codeRequete,
                'data' => $requete
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la soumission de la requête.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher les détails d'une requête
     */
    public function show(Request $request, Requete $requete): JsonResponse
    {
        $user = $request->user();

        // Vérifier que la requête appartient à l'étudiant
        if ($requete->etudiant_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé.'
            ], 403);
        }

        $requete->load([
            'typeRequete.service',
            'etudiant.profilEtudiant',
            'agent.profilAgentAdministratif.service',
            'responsable.profilResponsablePedagogique',
            'piecesJointes',
            'historiques' => function($q) {
                $q->with(['etat', 'utilisateur'])->orderBy('date_etat', 'asc');
            }
        ]);

        $requete->etat_actuel = $requete->etatActuel;

        return response()->json([
            'success' => true,
            'data' => $requete
        ]);
    }

    /**
     * Ajouter des informations complémentaires à une requête
     */
    public function update(UpdateRequestRequest $request, Requete $requete): JsonResponse
    {
        $user = $request->user();

        // Vérifier que la requête appartient à l'étudiant
        if ($requete->etudiant_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé.'
            ], 403);
        }

        // Vérifier que la requête est en attente d'informations
        $etatActuel = $requete->etatActuel;
        if (!$etatActuel || $etatActuel->libelle !== 'INFORMATIONS_REQUISES') {
            return response()->json([
                'success' => false,
                'message' => 'Cette requête n\'est pas en attente d\'informations complémentaires.'
            ], 422);
        }

        // Ajouter les informations complémentaires à la description
        $requete->description .= "\n\n--- Informations complémentaires ajoutées le " . now()->format('d/m/Y à H:i') . " ---\n" . $request->informations_complementaires;
        $requete->save();

        // Remettre la requête en cours
        $requete->changerEtat('EN_COURS', $user->id);

        // TODO: Notifier l'agent

        return response()->json([
            'success' => true,
            'message' => 'Informations complémentaires ajoutées avec succès.',
            'data' => $requete->load(['typeRequete', 'historiques.etat'])
        ]);
    }

    /**
     * Annuler une requête
     */
    public function destroy(Request $request, Requete $requete): JsonResponse
    {
        $user = $request->user();

        // Vérifier que la requête appartient à l'étudiant
        if ($requete->etudiant_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé.'
            ], 403);
        }

        // Vérifier que la requête peut être annulée (EN_ATTENTE ou AFFECTEE uniquement)
        $etatActuel = $requete->etatActuel;
        if (!$etatActuel || !in_array($etatActuel->libelle, ['EN_ATTENTE', 'AFFECTEE'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cette requête ne peut plus être annulée.'
            ], 422);
        }

        // Supprimer les pièces jointes
        foreach ($requete->piecesJointes as $pieceJointe) {
            Storage::disk('public')->delete($pieceJointe->chemin_fichier);
        }

        $requete->delete();

        return response()->json([
            'success' => true,
            'message' => 'Requête annulée avec succès.'
        ]);
    }
}

