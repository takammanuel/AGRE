<?php

namespace App\Http\Controllers\Api\Agent;

use App\Http\Controllers\Controller;
use App\Models\Requete;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RequeteAgentController extends Controller
{
    /**
     * Requêtes affectées à l'agent
     * GET /api/agent/requetes
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $filter = $request->query('filter'); // today, week, urgent, all

        $query = Requete::with([
            'etudiant',
            'typeRequete.service',
            'historiques' => function($q) {
                $q->with('etat')->orderBy('date_etat', 'desc')->limit(1);
            }
        ])->where('agent_id', $user->id);

        // Appliquer les filtres
        switch ($filter) {
            case 'today':
                $query->whereDate('created_at', today());
                break;
            case 'week':
                $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                break;
            case 'urgent':
                $query->where('priorite', 'URGENTE');
                break;
        }

        $requetes = $query->orderBy('created_at', 'desc')->paginate(15);

        // Ajouter le dernier statut à chaque requête
        $requetes->getCollection()->transform(function($requete) {
            $dernierHistorique = $requete->historiques->first();
            $requete->statut_actuel = $dernierHistorique?->etat->libelle ?? 'N/A';
            $requete->date_statut = $dernierHistorique?->date_etat ?? null;
            return $requete;
        });

        return response()->json([
            'success' => true,
            'data' => $requetes
        ]);
    }

    /**
     * Statistiques du dashboard agent
     * GET /api/agent/dashboard
     */
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        $stats = [
            'affectees_aujourdhui' => Requete::where('agent_id', $user->id)
                ->whereDate('created_at', today())
                ->count(),

            'affectees_semaine' => Requete::where('agent_id', $user->id)
                ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                ->count(),

            'urgentes' => Requete::where('agent_id', $user->id)
                ->where('priorite', 'URGENTE')
                ->whereHas('historiques', function($q) {
                    $q->whereHas('etat', fn($eq) => $eq->whereIn('libelle', ['EN_ATTENTE', 'EN_COURS']));
                })
                ->count(),

            'total_affectees' => Requete::where('agent_id', $user->id)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Statistiques détaillées de l'agent
     * GET /api/agent/statistiques
     */
    public function statistiques(Request $request): JsonResponse
    {
        $user = $request->user();

        // Statistiques par statut
        $parStatut = DB::table('requetes')
            ->join('historique_requetes', 'requetes.id', '=', 'historique_requetes.requete_id')
            ->join('etats', 'historique_requetes.etat_id', '=', 'etats.id')
            ->where('requetes.agent_id', $user->id)
            ->select('etats.libelle', DB::raw('count(*) as total'))
            ->groupBy('etats.libelle')
            ->get();

        // Statistiques par type de requête
        $parType = DB::table('requetes')
            ->join('type_requetes', 'requetes.type_requete_id', '=', 'type_requetes.id')
            ->where('requetes.agent_id', $user->id)
            ->select('type_requetes.nom', DB::raw('count(*) as total'))
            ->groupBy('type_requetes.nom')
            ->get();

        // Statistiques par priorité
        $parPriorite = Requete::where('agent_id', $user->id)
            ->select('priorite', DB::raw('count(*) as total'))
            ->groupBy('priorite')
            ->get();

        // Évolution sur les 7 derniers jours
        $evolution = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $count = Requete::where('agent_id', $user->id)
                ->whereDate('created_at', $date)
                ->count();

            $evolution[] = [
                'date' => $date->format('Y-m-d'),
                'label' => $date->format('d/m'),
                'count' => $count
            ];
        }

        // Temps moyen de traitement (en heures)
        $tempsMoyen = DB::table('requetes')
            ->join('historique_requetes as h1', 'requetes.id', '=', 'h1.requete_id')
            ->join('historique_requetes as h2', 'requetes.id', '=', 'h2.requete_id')
            ->join('etats as e1', 'h1.etat_id', '=', 'e1.id')
            ->join('etats as e2', 'h2.etat_id', '=', 'e2.id')
            ->where('requetes.agent_id', $user->id)
            ->where('e1.libelle', 'EN_ATTENTE')
            ->where('e2.libelle', 'TRAITEE')
            ->select(DB::raw('AVG(TIMESTAMPDIFF(HOUR, h1.date_etat, h2.date_etat)) as moyenne'))
            ->value('moyenne');

        // Performance ce mois
        $performanceMois = [
            'traitees' => Requete::where('agent_id', $user->id)
                ->whereMonth('created_at', now()->month)
                ->whereHas('historiques', function($q) {
                    $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'TRAITEE'));
                })
                ->count(),

            'en_cours' => Requete::where('agent_id', $user->id)
                ->whereMonth('created_at', now()->month)
                ->whereHas('historiques', function($q) {
                    $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'EN_COURS'));
                })
                ->count(),

            'en_attente' => Requete::where('agent_id', $user->id)
                ->whereMonth('created_at', now()->month)
                ->whereHas('historiques', function($q) {
                    $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'EN_ATTENTE'));
                })
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'par_statut' => $parStatut,
                'par_type' => $parType,
                'par_priorite' => $parPriorite,
                'evolution' => $evolution,
                'temps_moyen_traitement' => round($tempsMoyen ?? 0, 1),
                'performance_mois' => $performanceMois,
                'total_requetes' => Requete::where('agent_id', $user->id)->count()
            ]
        ]);
    }

    /**
     * Détails d'une requête
     * GET /api/agent/requetes/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();

            $requete = Requete::with([
                'etudiant',
                'typeRequete.service',
                'historiques.etat',
                'piecesJointes'
            ])
            ->where('agent_id', $user->id)
            ->findOrFail($id);

            // Trier les historiques par date décroissante
            $requete->historiques = $requete->historiques->sortByDesc('date_etat')->values();

            // Ajouter le statut actuel
            $dernierHistorique = $requete->historiques->first();
            $requete->statut_actuel = $dernierHistorique?->etat->libelle ?? 'N/A';
            $requete->date_statut = $dernierHistorique?->date_etat ?? null;

            return response()->json([
                'success' => true,
                'data' => $requete
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement de la requête',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Prendre en charge une requête (passer en EN_COURS)
     * POST /api/agent/requetes/{id}/prendre-en-charge
     */
    public function prendreEnCharge(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $requete = Requete::where('agent_id', $user->id)->findOrFail($id);

        // Vérifier que la requête est en attente
        $dernierHistorique = $requete->historiques()->with('etat')->latest('date_etat')->first();
        if ($dernierHistorique && $dernierHistorique->etat->libelle !== 'AFFECTEE' && $dernierHistorique->etat->libelle !== 'EN_ATTENTE') {
            return response()->json([
                'success' => false,
                'message' => 'Cette requête n\'est pas en attente'
            ], 400);
        }

        // Récupérer l'état EN_COURS
        $etatEnCours = \App\Models\Etat::where('libelle', 'EN_COURS')->first();

        if (!$etatEnCours) {
            return response()->json([
                'success' => false,
                'message' => 'État EN_COURS non trouvé'
            ], 500);
        }

        // Créer un nouvel historique
        DB::table('historique_requetes')->insert([
            'requete_id' => $requete->id,
            'etat_id' => $etatEnCours->id,
            'date_etat' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Requête prise en charge avec succès'
        ]);
    }

    /**
     * Traiter une requête (passer en TRAITEE)
     * POST /api/agent/requetes/{id}/traiter
     */
    public function traiter(Request $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'commentaire' => 'nullable|string|max:1000',
                'pieces_jointes' => 'nullable|array',
                'pieces_jointes.*' => 'nullable|file|max:10240' // 10MB max
            ]);

            $user = $request->user();

            $requete = Requete::where('agent_id', $user->id)->findOrFail($id);

            // Récupérer l'état TRAITEE
            $etatTraitee = \App\Models\Etat::where('libelle', 'TRAITEE')->first();

            if (!$etatTraitee) {
                return response()->json([
                    'success' => false,
                    'message' => 'État TRAITEE non trouvé'
                ], 500);
            }

            // Créer un nouvel historique
            DB::table('historique_requetes')->insert([
                'requete_id' => $requete->id,
                'etat_id' => $etatTraitee->id,
                'date_etat' => now(),
                'commentaire' => $validated['commentaire'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Gérer les pièces jointes si présentes
            if ($request->hasFile('pieces_jointes')) {
                foreach ($request->file('pieces_jointes') as $file) {
                    if ($file && $file->isValid()) {
                        $path = $file->store('pieces_jointes', 'public');

                        DB::table('piece_jointes')->insert([
                            'requete_id' => $requete->id,
                            'nom' => $file->getClientOriginalName(),
                            'chemin_fichier' => $path,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Requête traitée avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du traitement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rejeter une requête (passer en REJETEE)
     * POST /api/agent/requetes/{id}/rejeter
     */
    public function rejeter(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'motif' => 'required|string|max:1000'
        ]);

        $user = $request->user();

        $requete = Requete::where('agent_id', $user->id)->findOrFail($id);

        // Récupérer l'état REJETEE
        $etatRejetee = \App\Models\Etat::where('libelle', 'REJETEE')->first();

        if (!$etatRejetee) {
            return response()->json([
                'success' => false,
                'message' => 'État REJETEE non trouvé'
            ], 500);
        }

        // Créer un nouvel historique
        DB::table('historique_requetes')->insert([
            'requete_id' => $requete->id,
            'etat_id' => $etatRejetee->id,
            'date_etat' => now(),
            'commentaire' => $validated['motif'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Requête rejetée'
        ]);
    }

    /**
     * Ajouter un commentaire à une requête
     * POST /api/agent/requetes/{id}/commentaire
     */
    public function ajouterCommentaire(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'commentaire' => 'required|string|max:1000'
        ]);

        $user = $request->user();

        $requete = Requete::where('agent_id', $user->id)->findOrFail($id);

        // Récupérer le dernier état
        $dernierHistorique = $requete->historiques()->latest('date_etat')->first();

        if (!$dernierHistorique) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun historique trouvé'
            ], 400);
        }

        // Ajouter un commentaire dans l'historique
        DB::table('historique_requetes')->insert([
            'requete_id' => $requete->id,
            'etat_id' => $dernierHistorique->etat_id,
            'date_etat' => now(),
            'commentaire' => $validated['commentaire'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Commentaire ajouté avec succès'
        ]);
    }

    /**
     * Rechercher des requêtes affectées à l'agent
     * GET /api/agent/requetes/search?q=...
     */
    public function search(Request $request): JsonResponse
    {
        $searchTerm = $request->query('q');
        $user = $request->user();

        if (!$searchTerm) {
            return response()->json([
                'success' => false,
                'message' => 'Terme de recherche requis'
            ], 400);
        }

        $query = Requete::with([
            'etudiant.profilEtudiant',
            'typeRequete.service',
            'historiques' => function($q) {
                $q->with('etat')->orderBy('date_etat', 'desc')->limit(1);
            }
        ])->where('agent_id', $user->id);

        // Recherche par code de requête, matricule ou nom d'étudiant
        $query->where(function($q) use ($searchTerm) {
            $q->where('code_requete', 'LIKE', "%{$searchTerm}%")
              ->orWhereHas('etudiant', function($eq) use ($searchTerm) {
                  $eq->where('nom', 'LIKE', "%{$searchTerm}%")
                     ->orWhere('prenom', 'LIKE', "%{$searchTerm}%")
                     ->orWhereHas('profilEtudiant', function($ep) use ($searchTerm) {
                         $ep->where('matricule', 'LIKE', "%{$searchTerm}%");
                     });
              });
        });

        $requetes = $query->orderBy('created_at', 'desc')->paginate(15);

        // Ajouter le statut actuel
        $requetes->getCollection()->transform(function($requete) {
            $dernierHistorique = $requete->historiques->first();
            $requete->statut_actuel = $dernierHistorique?->etat->libelle ?? 'N/A';
            $requete->date_statut = $dernierHistorique?->date_etat ?? null;
            return $requete;
        });

        return response()->json([
            'success' => true,
            'data' => $requetes
        ]);
    }
}
