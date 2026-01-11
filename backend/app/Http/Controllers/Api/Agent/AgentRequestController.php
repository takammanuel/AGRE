<?php

namespace App\Http\Controllers\Api\Agent;

use App\Http\Controllers\Controller;
use App\Http\Requests\Agent\ProcessRequestRequest;
use App\Http\Requests\Agent\ReassignRequestRequest;
use App\Models\Etat;
use App\Models\Requete;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AgentRequestController extends Controller
{
    /**
     * Liste des requêtes affectées au service de l'agent
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $profilAgent = $user->profilAgentAdministratif;

        if (!$profilAgent || !$profilAgent->service_id) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun service associé à votre profil.'
            ], 403);
        }

        $serviceId = $profilAgent->service_id;

        // Requêtes affectées au service (via le type de requête)
        $query = Requete::where('agent_id', $user->id)
            ->with([
                'etudiant.profilEtudiant',
                'typeRequete.service',
                'agent',
                'piecesJointes',
                'historiques' => function($q) {
                    $q->with('etat')->orderBy('date_etat', 'desc');
                }
            ]);

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

        if ($request->has('priorite')) {
            $query->where('priorite', $request->priorite);
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

        // Recherche
        if ($request->has('recherche')) {
            $recherche = $request->recherche;
            $query->where(function($q) use ($recherche) {
                $q->where('code_requete', 'like', '%' . $recherche . '%')
                  ->orWhereHas('etudiant.profilEtudiant', function($q) use ($recherche) {
                      $q->where('matricule', 'like', '%' . $recherche . '%');
                  });
            });
        }

        // Tri
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        // Tri spécial pour priorité
        if ($sortBy === 'priorite') {
            $query->orderByRaw("CASE WHEN priorite = 'URGENTE' THEN 1 ELSE 2 END")
                  ->orderBy('created_at', $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $requetes = $query->paginate($request->get('per_page', 15));

        // Ajouter l'état actuel
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
     * Détails d'une requête
     */
    public function show(Request $request, Requete $requete): JsonResponse
    {
        $user = $request->user();
        $profilAgent = $user->profilAgentAdministratif;

        if (!$profilAgent || !$profilAgent->service_id) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun service associé à votre profil.'
            ], 403);
        }

        // Vérifier que la requête est affectée au service de l'agent
        if ($requete->typeRequete->service_id !== $profilAgent->service_id) {
            return response()->json([
                'success' => false,
                'message' => 'Cette requête n\'est pas affectée à votre service.'
            ], 403);
        }

        $requete->load([
            'etudiant.profilEtudiant',
            'typeRequete.service',
            'agent.profilAgentAdministratif',
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
     * Prendre en charge une requête
     */
    public function takeCharge(Request $request, Requete $requete): JsonResponse
    {
        $user = $request->user();
        $profilAgent = $user->profilAgentAdministratif;

        if (!$profilAgent || !$profilAgent->service_id) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun service associé à votre profil.'
            ], 403);
        }

        // Vérifier que la requête est affectée au service
        if ($requete->typeRequete->service_id !== $profilAgent->service_id) {
            return response()->json([
                'success' => false,
                'message' => 'Cette requête n\'est pas affectée à votre service.'
            ], 403);
        }

        $etatActuel = $requete->etatActuel;
        if (!$etatActuel || !in_array($etatActuel->libelle, ['AFFECTEE', 'EN_ATTENTE'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cette requête ne peut pas être prise en charge dans son état actuel.'
            ], 422);
        }

        $requete->agent_id = $user->id;
        $requete->save();

        $requete->changerEtat('EN_COURS', $user->id);

        // TODO: Notifier l'étudiant

        return response()->json([
            'success' => true,
            'message' => 'Requête prise en charge avec succès.',
            'data' => $requete->load(['typeRequete', 'historiques.etat'])
        ]);
    }

    /**
     * Traiter une requête (validation, rejet, demande d'infos, escalade)
     */
    public function process(ProcessRequestRequest $request, Requete $requete): JsonResponse
    {
        $user = $request->user();

        // Vérifier que l'agent a pris en charge la requête
        if ($requete->agent_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous devez prendre en charge cette requête avant de la traiter.'
            ], 403);
        }

        $action = $request->action;

        try {
            DB::beginTransaction();

            switch ($action) {
                case 'validate':
                    // Validation directe
                    $requete->changerEtat('TRAITEE', $user->id);

                    // Upload du document généré si fourni
                    if ($request->hasFile('document')) {
                        $file = $request->file('document');
                        $path = $file->store('requetes/' . $requete->id . '/documents', 'public');

                        $requete->piecesJointes()->create([
                            'nom' => 'Document généré - ' . $file->getClientOriginalName(),
                            'chemin_fichier' => $path,
                        ]);
                    }

                    $message = 'Requête validée avec succès.';
                    break;

                case 'reject':
                    // Rejet avec motif
                    $requete->description .= "\n\n--- Rejeté le " . now()->format('d/m/Y à H:i') . " ---\nMotif : " . $request->commentaire;
                    $requete->save();
                    $requete->changerEtat('REJETEE', $user->id);
                    $message = 'Requête rejetée.';
                    break;

                case 'request_info':
                    // Demande d'informations complémentaires
                    $requete->description .= "\n\n--- Informations demandées le " . now()->format('d/m/Y à H:i') . " ---\n" . ($request->commentaire ?? '');
                    $requete->save();
                    $requete->changerEtat('INFORMATIONS_REQUISES', $user->id);
                    $message = 'Demande d\'informations complémentaires envoyée à l\'étudiant.';
                    break;

                case 'escalate':
                    // Escalade au responsable pédagogique
                    $requete->description .= "\n\n--- Escaladé le " . now()->format('d/m/Y à H:i') . " ---\n" . ($request->commentaire ?? '');
                    $requete->save();
                    $requete->changerEtat('EN_ATTENTE_APPROBATION', $user->id);
                    $message = 'Requête escaladée au responsable pédagogique.';
                    break;
            }

            DB::commit();

            // TODO: Notifier l'étudiant ou le responsable selon l'action

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $requete->load(['typeRequete', 'historiques.etat', 'piecesJointes'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du traitement de la requête.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Réassigner une requête à un autre service
     */
    public function reassign(ReassignRequestRequest $request, Requete $requete): JsonResponse
    {
        $user = $request->user();

        // Vérifier que l'agent a pris en charge la requête
        if ($requete->agent_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous devez prendre en charge cette requête avant de la réassigner.'
            ], 403);
        }

        $nouveauService = Service::findOrFail($request->service_id);

        // Mettre à jour le type de requête pour pointer vers le nouveau service
        // Ou créer une nouvelle logique de réassignation
        // Pour l'instant, on change juste le service du type de requête
        $requete->typeRequete->service_id = $nouveauService->id;
        $requete->typeRequete->save();

        // Réinitialiser l'agent assigné
        $requete->agent_id = null;
        $requete->save();

        // Remettre en AFFECTEE
        $requete->changerEtat('AFFECTEE', $user->id);

        if ($request->commentaire) {
            $requete->description .= "\n\n--- Réassignée le " . now()->format('d/m/Y à H:i') . " au service " . $nouveauService->nom . " ---\n" . $request->commentaire;
            $requete->save();
        }

        // TODO: Notifier les agents du nouveau service

        return response()->json([
            'success' => true,
            'message' => 'Requête réassignée au service ' . $nouveauService->nom . ' avec succès.',
            'data' => $requete->load(['typeRequete.service', 'historiques.etat'])
        ]);
    }
}

