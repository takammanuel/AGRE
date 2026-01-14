<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Requete;
use App\Models\Utilisateur;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Dashboard admin - Statistiques globales
     * GET /api/admin/dashboard
     */
    public function index(Request $request): JsonResponse
    {
        // Statistiques des requêtes
        $requetesStats = [
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
            'rejetees' => Requete::whereHas('historiques', function($q) {
                $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'REJETEE'));
            })->count(),
        ];

        // Statistiques des utilisateurs
        $utilisateursStats = [
            'total' => Utilisateur::count(),
            'etudiants' => Utilisateur::whereHas('roles', function($q) {
                $q->where('nom', 'Étudiant')
                  ->orWhere('libelle', 'ETUDIANT');
            })->count(),
            'agents' => Utilisateur::whereHas('roles', function($q) {
                $q->where('nom', 'Agent Académique')
                  ->orWhere('libelle', 'AGENT_ACADEMIQUE');
            })->count(),
            'responsables' => Utilisateur::whereHas('roles', function($q) {
                $q->where('nom', 'Responsable Pédagogique')
                  ->orWhere('libelle', 'RESPONSABLE_PEDAGOGIQUE');
            })->count(),
            'actifs' => Utilisateur::where('is_active', true)->count(),
        ];

        // Requêtes récentes
        $requetesRecentes = Requete::with([
            'etudiant',
            'typeRequete.service',
            'agent',
            'historiques' => function($q) {
                $q->with('etat')->orderBy('date_etat', 'desc')->limit(1);
            }
        ])
        ->orderBy('created_at', 'desc')
        ->limit(10)
        ->get()
        ->map(function($requete) {
            $dernierHistorique = $requete->historiques->first();
            $requete->statut_actuel = $dernierHistorique?->etat->libelle ?? 'N/A';
            return $requete;
        });

        // Requêtes par service
        $requetesParService = DB::table('requetes')
            ->join('type_requetes', 'requetes.type_requete_id', '=', 'type_requetes.id')
            ->join('services', 'type_requetes.service_id', '=', 'services.id')
            ->select('services.nom', DB::raw('count(*) as total'))
            ->groupBy('services.id', 'services.nom')
            ->get();

        // Requêtes par mois (6 derniers mois)
        $requetesParMois = DB::table('requetes')
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as mois'),
                DB::raw('count(*) as total')
            )
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('mois')
            ->orderBy('mois')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'requetes' => $requetesStats,
                'utilisateurs' => $utilisateursStats,
                'requetes_recentes' => $requetesRecentes,
                'requetes_par_service' => $requetesParService,
                'requetes_par_mois' => $requetesParMois,
            ]
        ]);
    }

    /**
     * Approbations en attente
     * GET /api/admin/approbations
     */
    public function approbations(Request $request): JsonResponse
    {
        $approbations = Requete::with([
            'etudiant',
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
     * POST /api/admin/approbations/{id}/approuver
     */
    public function approuver(Request $request, int $id): JsonResponse
    {
        $requete = Requete::findOrFail($id);
        
        $etatEnCours = \App\Models\Etat::where('libelle', 'EN_COURS')->first();
        
        if ($etatEnCours) {
            DB::table('historique_requetes')->insert([
                'requete_id' => $requete->id,
                'etat_id' => $etatEnCours->id,
                'date_etat' => now(),
                'commentaire' => 'Approuvé par l\'administrateur',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Notification à l'étudiant
            \App\Models\Notification::create([
                'titre' => 'Requête approuvée',
                'message' => "Votre requête {$requete->code_requete} a été approuvée par l'administration.",
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
     * POST /api/admin/approbations/{id}/rejeter
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
                'commentaire' => 'Rejeté par l\'administrateur: ' . $validated['motif'],
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
     * Requêtes escaladées (nécessitant attention admin)
     * GET /api/admin/requetes-escaladees
     */
    public function requetesEscaladees(Request $request): JsonResponse
    {
        $requetes = Requete::with([
            'etudiant',
            'typeRequete.service',
            'agent',
            'historiques.etat'
        ])
        ->where('priorite', 'URGENTE')
        ->orWhereHas('historiques', function($q) {
            $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'EN_ATTENTE'))
              ->where('date_etat', '<', now()->subDays(7));
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
     * GET /api/admin/historique
     */
    public function historique(Request $request): JsonResponse
    {
        $query = Requete::with([
            'etudiant',
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

        // Ajouter le statut actuel à chaque requête
        $requetes->getCollection()->transform(function($requete) {
            $dernierHistorique = $requete->historiques->sortByDesc('date_etat')->first();
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
     * Compteurs pour les badges
     * GET /api/admin/badge-counts
     */
    public function badgeCounts(Request $request): JsonResponse
    {
        $counts = [
            'utilisateurs' => Utilisateur::count(),
            'approbations' => Requete::whereHas('typeRequete', fn($q) => $q->where('necessite_approbation', true))
                ->whereHas('historiques', function($q) {
                    $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'EN_ATTENTE'));
                })
                ->count(),
            'requetes_escaladees' => Requete::where('priorite', 'URGENTE')
                ->orWhereHas('historiques', function($q) {
                    $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'EN_ATTENTE'))
                      ->where('date_etat', '<', now()->subDays(7));
                })
                ->count(),
            'requetes_urgentes' => Requete::where('priorite', 'URGENTE')
                ->whereHas('historiques', function($q) {
                    $q->whereHas('etat', fn($eq) => $eq->whereIn('libelle', ['EN_ATTENTE', 'EN_COURS']));
                })
                ->count(),
            'services' => \App\Models\Service::count(),
            'types_requetes' => \App\Models\TypeRequete::count(),
            'messages_non_lus' => 0, // À implémenter si messagerie admin
            'notifications_non_lues' => \App\Models\Notification::where('utilisateur_id', $request->user()->id)
                ->where('lu', false)
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $counts
        ]);
    }

    /**
     * Rechercher des requêtes
     * GET /api/admin/requetes/search?q=...
     */
    public function searchRequetes(Request $request): JsonResponse
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
}
