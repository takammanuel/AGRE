<?php

namespace App\Http\Controllers\Api\Responsable;

use App\Http\Controllers\Controller;
use App\Models\Requete;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RequeteResponsableController extends Controller
{
    /**
     * Dashboard responsable - Statistiques
     * GET /api/responsable/dashboard
     */
    public function dashboard(Request $request): JsonResponse
    {
        $stats = [
            'total' => Requete::count(),
            'en_attente' => Requete::whereHas('historiques', function($q) {
                $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'EN_ATTENTE'));
            })->count(),
            'en_cours' => Requete::whereHas('historiques', function($q) {
                $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'EN_COURS'));
            })->count(),
            'traitees' => Requete::whereHas('historiques', function($q) {
                $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'TRAITEE'));
            })->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Liste de toutes les requêtes (vue responsable)
     * GET /api/responsable/requetes
     */
    public function index(Request $request): JsonResponse
    {
        $requetes = Requete::with([
            'etudiant.profilEtudiant',
            'typeRequete.service',
            'agent',
            'historiques' => function($q) {
                $q->with('etat')->orderBy('date_etat', 'desc')->limit(1);
            }
        ])
        ->orderBy('created_at', 'desc')
        ->paginate(15);

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

    /**
     * Détails d'une requête
     * GET /api/responsable/requetes/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $requete = Requete::with([
            'etudiant.profilEtudiant',
            'typeRequete.service',
            'agent',
            'historiques.etat',
            'piecesJointes'
        ])->findOrFail($id);

        // Trier les historiques
        $requete->historiques = $requete->historiques->sortByDesc('date_etat')->values();

        // Ajouter le statut actuel
        $dernierHistorique = $requete->historiques->first();
        $requete->statut_actuel = $dernierHistorique?->etat->libelle ?? 'N/A';
        $requete->date_statut = $dernierHistorique?->date_etat ?? null;

        return response()->json([
            'success' => true,
            'data' => $requete
        ]);
    }

    /**
     * Rechercher des requêtes
     * GET /api/responsable/requetes/search?q=...
     */
    public function search(Request $request): JsonResponse
    {
        $searchTerm = $request->query('q');

        if (!$searchTerm) {
            return response()->json([
                'success' => false,
                'message' => 'Terme de recherche requis'
            ], 400);
        }

        $query = Requete::with([
            'etudiant.profilEtudiant',
            'typeRequete.service',
            'agent',
            'historiques' => function($q) {
                $q->with('etat')->orderBy('date_etat', 'desc')->limit(1);
            }
        ]);

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

    /**
     * Approbations en attente (pour responsable)
     * GET /api/responsable/approbations
     */
    public function approbations(Request $request): JsonResponse
    {
        $approbations = Requete::with([
            'etudiant.profilEtudiant',
            'typeRequete.service',
            'agent',
            'historiques.etat'
        ])
        ->whereHas('typeRequete', fn($q) => $q->where('necessite_approbation', true))
        ->whereHas('historiques', function($q) {
            $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'EN_ATTENTE'));
        })
        ->orderBy('created_at', 'desc')
        ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $approbations
        ]);
    }

    /**
     * Approuver une requête
     * POST /api/responsable/approbations/{id}/approuver
     */
    public function approuver(Request $request, int $id): JsonResponse
    {
        $requete = Requete::findOrFail($id);

        $etatEnCours = \App\Models\Etat::where('libelle', 'TRAITEE')->first();

        if ($etatEnCours) {
            DB::table('historique_requetes')->insert([
                'requete_id' => $requete->id,
                'etat_id' => $etatEnCours->id,
                'date_etat' => now(),
                'commentaire' => 'Approuvé par le responsable pédagogique',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Notification à l'étudiant
            \App\Models\Notification::create([
                'titre' => 'Requête approuvée',
                'message' => "Votre requête {$requete->code_requete} a été approuvée par le responsable pédagogique.",
                'requete_id' => $requete->id,
                'utilisateur_id' => $requete->etudiant_id,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Requête approuvée avec succès'
        ]);
    }

    /**
     * Rejeter une requête
     * POST /api/responsable/approbations/{id}/rejeter
     */
    public function rejeter(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'motif' => 'required|string|max:500'
        ]);

        $requete = Requete::findOrFail($id);

        $etatRejetee = \App\Models\Etat::where('libelle', 'REJETEE')->first();

        if ($etatRejetee) {
            DB::table('historique_requetes')->insert([
                'requete_id' => $requete->id,
                'etat_id' => $etatRejetee->id,
                'date_etat' => now(),
                'commentaire' => 'Rejeté par le responsable pédagogique: ' . $validated['motif'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Notification à l'étudiant
            \App\Models\Notification::create([
                'titre' => 'Requête rejetée',
                'message' => "Votre requête {$requete->code_requete} a été rejetée. Motif: {$validated['motif']}",
                'requete_id' => $requete->id,
                'utilisateur_id' => $requete->etudiant_id,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Requête rejetée'
        ]);
    }

    /**
     * Requêtes escaladées
     * GET /api/responsable/requetes-escaladees
     */
    public function requetesEscaladees(Request $request): JsonResponse
    {
        $requetes = Requete::with([
            'etudiant.profilEtudiant',
            'typeRequete.service',
            'agent',
            'historiques.etat'
        ])
        ->WhereHas('historiques', function($q) {
            $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'EN_ATTENTE_APPROBATION'));
        })
        ->orderBy('created_at', 'asc')
        ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $requetes
        ]);
    }

    /**
     * Historique complet
     * GET /api/responsable/historique
     */
    public function historique(Request $request): JsonResponse
    {
        $query = Requete::with([
            'etudiant.profilEtudiant',
            'typeRequete.service',
            'agent',
            'historiques.etat'
        ]);

        // Filtres
        if ($request->has('statut')) {
            $query->whereHas('historiques', function($q) use ($request) {
                $q->whereHas('etat', fn($eq) => $eq->where('libelle', $request->statut));
            });
        }

        if ($request->has('service_id')) {
            $query->whereHas('typeRequete', fn($q) => $q->where('service_id', $request->service_id));
        }

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
     * Statistiques
     * GET /api/responsable/statistiques
     */
    public function statistiques(Request $request): JsonResponse
    {
        // Statistiques par statut
        $parStatut = [
            'en_attente' => Requete::whereHas('historiques', function($q) {
                $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'EN_ATTENTE'));
            })->count(),
            'en_cours' => Requete::whereHas('historiques', function($q) {
                $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'EN_COURS'));
            })->count(),
            'traitees' => Requete::whereHas('historiques', function($q) {
                $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'TRAITEE'));
            })->count(),
            'rejetees' => Requete::whereHas('historiques', function($q) {
                $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'REJETEE'));
            })->count(),
        ];

        // Statistiques par service
        $parService = DB::table('requetes')
            ->join('type_requetes', 'requetes.type_requete_id', '=', 'type_requetes.id')
            ->join('services', 'type_requetes.service_id', '=', 'services.id')
            ->select('services.nom', DB::raw('count(*) as total'))
            ->groupBy('services.id', 'services.nom')
            ->get();

        // Statistiques par priorité
        $parPriorite = Requete::select('priorite', DB::raw('count(*) as total'))
            ->groupBy('priorite')
            ->get();

        // Évolution sur les 7 derniers jours
        $evolution = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $count = Requete::whereDate('created_at', $date)->count();

            $evolution[] = [
                'date' => $date->format('Y-m-d'),
                'label' => $date->format('d/m'),
                'count' => $count
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'par_statut' => $parStatut,
                'par_service' => $parService,
                'par_priorite' => $parPriorite,
                'evolution' => $evolution,
                'total_requetes' => Requete::count()
            ]
        ]);
    }
}
