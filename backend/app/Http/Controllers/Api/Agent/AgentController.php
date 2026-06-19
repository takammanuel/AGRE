<?php

namespace App\Http\Controllers\Api\Agent;

use App\Http\Controllers\Controller;
use App\Models\Requete;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AgentController extends Controller
{
    /**
     * Dashboard agent - Statistiques
     * GET /api/agent/dashboard
     */
    public function dashboard(Request $request): JsonResponse
    {
        $agent = auth()->user();

        // Statistiques des requêtes de l'agent
        $requetesStats = [
            'total' => Requete::where('agent_id', $agent->id)->count(),
            'en_attente' => Requete::where('agent_id', $agent->id)
                ->whereHas('historiques', function($q) {
                    $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'EN_ATTENTE'));
                })->count(),
            'en_cours' => Requete::where('agent_id', $agent->id)
                ->whereHas('historiques', function($q) {
                    $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'EN_COURS'));
                })->count(),
            'traitees' => Requete::where('agent_id', $agent->id)
                ->whereHas('historiques', function($q) {
                    $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'TRAITEE'));
                })->count(),
            'urgentes' => Requete::where('agent_id', $agent->id)
                ->where('priorite', 'URGENTE')
                ->whereHas('historiques', function($q) {
                    $q->whereHas('etat', fn($eq) => $eq->whereIn('libelle', ['EN_ATTENTE', 'EN_COURS']));
                })->count(),
        ];

        // Requêtes récentes assignées à l'agent
        $requetesRecentes = Requete::with([
            'etudiant',
            'typeRequete.service',
            'historiques' => function($q) {
                $q->with('etat')->orderBy('date_etat', 'desc')->limit(1);
            }
        ])
        ->where('agent_id', $agent->id)
        ->orderBy('created_at', 'desc')
        ->limit(10)
        ->get()
        ->map(function($requete) {
            $dernierHistorique = $requete->historiques->first();
            $requete->statut_actuel = $dernierHistorique?->etat->libelle ?? 'N/A';
            return $requete;
        });

        // Requêtes urgentes
        $requetesUrgentes = Requete::with([
            'etudiant',
            'typeRequete.service',
            'historiques.etat'
        ])
        ->where('agent_id', $agent->id)
        ->where('priorite', 'URGENTE')
        ->whereHas('historiques', function($q) {
            $q->whereHas('etat', fn($eq) => $eq->whereIn('libelle', ['EN_ATTENTE', 'EN_COURS']));
        })
        ->orderBy('created_at', 'asc')
        ->limit(5)
        ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'requetes' => $requetesStats,
                'requetes_recentes' => $requetesRecentes,
                'requetes_urgentes' => $requetesUrgentes,
            ]
        ]);
    }

    /**
     * Requêtes affectées à l'agent
     * GET /api/agent/requetes-affectees
     */
    public function requetesAffectees(Request $request): JsonResponse
    {
        $agent = auth()->user();

        $query = Requete::with([
            'etudiant',
            'typeRequete.service',
            'historiques' => function($q) {
                $q->with('etat')->orderBy('date_etat', 'desc')->limit(1);
            }
        ])
        ->where('agent_id', $agent->id);

        // Filtres
        if ($request->has('statut')) {
            $query->whereHas('historiques', function($q) use ($request) {
                $q->whereHas('etat', fn($eq) => $eq->where('libelle', $request->statut));
            });
        }

        if ($request->has('priorite')) {
            $query->where('priorite', $request->priorite);
        }

        $requetes = $query->orderBy('created_at', 'desc')->paginate(15);

        // Ajouter le statut actuel
        $requetes->getCollection()->transform(function($requete) {
            $dernierHistorique = $requete->historiques->first();
            $requete->statut_actuel = $dernierHistorique?->etat->libelle ?? 'N/A';
            return $requete;
        });

        return response()->json([
            'success' => true,
            'data' => $requetes
        ]);
    }

    /**
     * Requêtes urgentes
     * GET /api/agent/requetes-urgentes
     */
    public function requetesUrgentes(Request $request): JsonResponse
    {
        $agent = auth()->user();

        $requetes = Requete::with([
            'etudiant',
            'typeRequete.service',
            'historiques.etat'
        ])
        ->where('agent_id', $agent->id)
        ->where('priorite', 'URGENTE')
        ->whereHas('historiques', function($q) {
            $q->whereHas('etat', fn($eq) => $eq->whereIn('libelle', ['EN_ATTENTE', 'EN_COURS']));
        })
        ->orderBy('created_at', 'asc')
        ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $requetes
        ]);
    }

    /**
     * Prendre en charge une requête
     * POST /api/agent/requetes/{id}/prendre-en-charge
     */
    public function prendreEnCharge(Request $request, int $id): JsonResponse
    {
        $agent = auth()->user();
        $requete = Requete::findOrFail($id);

        // Vérifier que la requête est assignée à cet agent
        if ($requete->agent_id !== $agent->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cette requête ne vous est pas assignée.'
            ], 403);
        }

        $etatEnCours = \App\Models\Etat::where('libelle', 'EN_COURS')->first();

        if ($etatEnCours) {
            DB::table('historique_requetes')->insert([
                'requete_id' => $requete->id,
                'etat_id' => $etatEnCours->id,
                'utilisateur_id' => $agent->id,
                'date_etat' => now(),
                'commentaire' => 'Prise en charge par ' . $agent->nom . ' ' . $agent->prenom,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Notification à l'étudiant
            Notification::create([
                'titre' => 'Requête prise en charge',
                'message' => "Votre requête {$requete->code_requete} est maintenant en cours de traitement par {$agent->nom_complet}.",
                'requete_id' => $requete->id,
                'utilisateur_id' => $requete->etudiant_id,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Requête prise en charge avec succès'
        ]);
    }

    /**
     * Traiter une requête (marquer comme traitée)
     * POST /api/agent/requetes/{id}/traiter
     */
    public function traiter(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'commentaire' => 'nullable|string|max:500'
        ]);

        $agent = auth()->user();
        $requete = Requete::findOrFail($id);

        // Vérifier que la requête est assignée à cet agent
        if ($requete->agent_id !== $agent->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cette requête ne vous est pas assignée.'
            ], 403);
        }

        $etatTraitee = \App\Models\Etat::where('libelle', 'TRAITEE')->first();

        if ($etatTraitee) {
            DB::table('historique_requetes')->insert([
                'requete_id' => $requete->id,
                'etat_id' => $etatTraitee->id,
                'utilisateur_id' => $agent->id,
                'date_etat' => now(),
                'commentaire' => $validated['commentaire'] ?? 'Requête traitée par ' . $agent->nom . ' ' . $agent->prenom,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Notification à l'étudiant
            Notification::create([
                'titre' => 'Requête traitée',
                'message' => "Votre requête {$requete->code_requete} a été traitée avec succès.",
                'requete_id' => $requete->id,
                'utilisateur_id' => $requete->etudiant_id,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Requête traitée avec succès'
        ]);
    }

    /**
     * Historique des actions de l'agent
     * GET /api/agent/historique
     */
    public function historique(Request $request): JsonResponse
    {
        $agent = auth()->user();

        $query = Requete::with([
            'etudiant',
            'typeRequete.service',
            'historiques.etat'
        ])
        ->where('agent_id', $agent->id);

        // Filtres
        if ($request->has('date_debut')) {
            $query->where('created_at', '>=', $request->date_debut);
        }

        if ($request->has('date_fin')) {
            $query->where('created_at', '<=', $request->date_fin);
        }

        $requetes = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $requetes
        ]);
    }

    /**
     * Compteurs pour les badges
     * GET /api/agent/badge-counts
     */
    public function badgeCounts(Request $request): JsonResponse
    {
        $agent = auth()->user();

        $counts = [
            'requetes_affectees' => Requete::where('agent_id', $agent->id)
                ->whereHas('historiques', function($q) {
                    $q->whereHas('etat', fn($eq) => $eq->whereIn('libelle', ['EN_ATTENTE', 'EN_COURS']));
                })
                ->count(),
            'requetes_urgentes' => Requete::where('agent_id', $agent->id)
                ->where('priorite', 'URGENTE')
                ->whereHas('historiques', function($q) {
                    $q->whereHas('etat', fn($eq) => $eq->whereIn('libelle', ['EN_ATTENTE', 'EN_COURS']));
                })
                ->count(),
            'requetes_en_attente' => Requete::where('agent_id', $agent->id)
                ->whereHas('historiques', function($q) {
                    $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'EN_ATTENTE'));
                })
                ->count(),
            'notifications_non_lues' => Notification::where('utilisateur_id', $agent->id)
                ->where('lu', false)
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $counts
        ]);
    }
}
