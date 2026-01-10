<?php

namespace App\Http\Controllers\Api\Responsable;

use App\Http\Controllers\Controller;
use App\Http\Requests\Responsable\ApproveRequestRequest;
use App\Models\Etat;
use App\Models\Requete;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ResponsableRequestController extends Controller
{
    /**
     * Liste des requêtes nécessitant approbation
     */
    public function index(Request $request): JsonResponse
    {
        $query = Requete::whereHas('historiques', function($q) {
                $etatId = Etat::where('libelle', 'EN_ATTENTE_APPROBATION')->value('id');
                $q->where('etat_id', $etatId)
                  ->whereRaw('date_etat = (SELECT MAX(date_etat) FROM historique_requetes WHERE requete_id = requetes.id)');
            })
            ->with([
                'etudiant.profilEtudiant',
                'typeRequete.service',
                'agent.profilAgentAdministratif',
                'piecesJointes',
                'historiques' => function($q) {
                    $q->with(['etat', 'utilisateur'])->orderBy('date_etat', 'desc');
                }
            ]);

        // Filtres
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

        $requetes = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

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
     * Détails d'une requête en attente d'approbation
     */
    public function show(Request $request, Requete $requete): JsonResponse
    {
        $etatActuel = $requete->etatActuel;
        
        if (!$etatActuel || $etatActuel->libelle !== 'EN_ATTENTE_APPROBATION') {
            return response()->json([
                'success' => false,
                'message' => 'Cette requête n\'est pas en attente d\'approbation.'
            ], 422);
        }

        $requete->load([
            'etudiant.profilEtudiant',
            'typeRequete.service',
            'agent.profilAgentAdministratif.service',
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
     * Approuver, rejeter, demander infos ou escalader une requête
     */
    public function approve(ApproveRequestRequest $request, Requete $requete): JsonResponse
    {
        $user = $request->user();
        $etatActuel = $requete->etatActuel;

        if (!$etatActuel || $etatActuel->libelle !== 'EN_ATTENTE_APPROBATION') {
            return response()->json([
                'success' => false,
                'message' => 'Cette requête n\'est pas en attente d\'approbation.'
            ], 422);
        }

        $action = $request->action;

        try {
            DB::beginTransaction();

            switch ($action) {
                case 'approve':
                    // Approuver : retour à l'agent pour finalisation
                    $requete->responsable_id = $user->id;
                    $requete->save();
                    
                    if ($request->commentaire) {
                        $requete->description .= "\n\n--- Approuvée le " . now()->format('d/m/Y à H:i') . " par le responsable pédagogique ---\n" . $request->commentaire;
                        $requete->save();
                    }
                    
                    $requete->changerEtat('EN_COURS', $user->id);
                    $message = 'Requête approuvée. Retour à l\'agent pour finalisation.';
                    break;

                case 'reject':
                    // Rejeter avec motif
                    $requete->responsable_id = $user->id;
                    $requete->save();
                    
                    $requete->description .= "\n\n--- Rejetée le " . now()->format('d/m/Y à H:i') . " par le responsable pédagogique ---\nMotif : " . $request->commentaire;
                    $requete->save();
                    
                    $requete->changerEtat('REJETEE', $user->id);
                    $message = 'Requête rejetée.';
                    break;

                case 'request_info':
                    // Demander des informations à l'étudiant ou à l'agent
                    $requete->responsable_id = $user->id;
                    $requete->save();
                    
                    $requete->description .= "\n\n--- Informations demandées le " . now()->format('d/m/Y à H:i') . " par le responsable pédagogique ---\n" . ($request->commentaire ?? '');
                    $requete->save();
                    
                    $requete->changerEtat('INFORMATIONS_REQUISES', $user->id);
                    $message = 'Demande d\'informations complémentaires envoyée.';
                    break;

                case 'escalate':
                    // Escalader à un niveau supérieur (pour l'instant, on garde EN_ATTENTE_APPROBATION)
                    $requete->description .= "\n\n--- Escaladée le " . now()->format('d/m/Y à H:i') . " ---\n" . ($request->commentaire ?? 'Escalade à un niveau supérieur');
                    $requete->save();
                    // On garde le même état, mais on note l'escalade
                    $message = 'Requête escaladée.';
                    break;
            }

            DB::commit();

            // TODO: Notifier l'étudiant et/ou l'agent selon l'action

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $requete->load(['typeRequete', 'historiques.etat'])
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
}

