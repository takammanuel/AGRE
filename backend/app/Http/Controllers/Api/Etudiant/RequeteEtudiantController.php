<?php

namespace App\Http\Controllers\Api\Etudiant;

use App\Http\Controllers\Controller;
use App\Models\Requete;
use App\Models\TypeRequete;
use App\Models\Etat;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RequeteEtudiantController extends Controller
{
    /**
     * Dashboard étudiant - Statistiques
     * GET /api/etudiant/dashboard
     */
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        $stats = [
            'total' => Requete::where('etudiant_id', $user->id)->count(),

            'en_attente' => Requete::where('etudiant_id', $user->id)
                ->whereHas('historiques', function($q) {
                    $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'EN_ATTENTE'));
                })
                ->count(),

            'en_cours' => Requete::where('etudiant_id', $user->id)
                ->whereHas('historiques', function($q) {
                    $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'EN_COURS'));
                })
                ->count(),

            'traitees' => Requete::where('etudiant_id', $user->id)
                ->whereHas('historiques', function($q) {
                    $q->whereHas('etat', fn($eq) => $eq->where('libelle', 'TRAITEE'));
                })
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Liste des requêtes de l'étudiant
     * GET /api/etudiant/requetes
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $requetes = Requete::with([
            'typeRequete.service',
            'agent',
            'historiques' => function($q) {
                $q->with('etat')->orderBy('date_etat', 'desc')->limit(1);
            }
        ])
        ->where('etudiant_id', $user->id)
        ->orderBy('created_at', 'desc')
        ->paginate(15);

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
     * Détails d'une requête
     * GET /api/etudiant/requetes/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $requete = Requete::with([
            'typeRequete.service',
            'agent',
            'historiques.etat',
            'piecesJointes'
        ])
        ->where('etudiant_id', $user->id)
        ->findOrFail($id);

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
     * Créer une nouvelle requête
     * POST /api/etudiant/requetes
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'type_requete_id' => 'required|exists:type_requetes,id',
                'description' => 'required|string|max:2000',
                'priorite' => 'nullable|in:STANDARD,URGENTE',
                'pieces_jointes' => 'nullable|array',
                'pieces_jointes.*' => 'nullable|file|max:10240'
            ]);

            $user = $request->user();

            // Générer un code unique
            $codeRequete = 'REQ-' . date('Y') . '-' . str_pad(Requete::count() + 1, 5, '0', STR_PAD_LEFT);

            // Créer la requête
            $requete = Requete::create([
                'code_requete' => $codeRequete,
                'priorite' => $validated['priorite'] ?? 'STANDARD',
                'description' => $validated['description'],
                'etudiant_id' => $user->id,
                'type_requete_id' => $validated['type_requete_id'],
            ]);

            // Créer l'historique initial (EN_ATTENTE)
            $etatEnAttente = Etat::where('libelle', 'AFFECTEE')->first();

            if ($etatEnAttente) {
                DB::table('historique_requetes')->insert([
                    'requete_id' => $requete->id,
                    'etat_id' => $etatEnAttente->id,
                    'date_etat' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Gérer les pièces jointes
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

            // Créer une notification pour l'étudiant
            Notification::create([
                'titre' => 'Requête créée',
                'message' => "Votre requête {$requete->code_requete} a été créée avec succès et est en attente de traitement.",
                'requete_id' => $requete->id,
                'utilisateur_id' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Requête créée avec succès',
                'data' => $requete
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Erreur création requête: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la requête: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Liste des types de requêtes disponibles
     * GET /api/etudiant/types-requetes
     */
    public function typesRequetes(): JsonResponse
    {
        $types = TypeRequete::with('service')
            ->where('est_actif', true)
            ->orderBy('nom')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $types
        ]);
    }

    /**
     * Rechercher ses propres requêtes
     * GET /api/etudiant/requetes/search?q=...
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
            'typeRequete.service',
            'agent',
            'historiques' => function($q) {
                $q->with('etat')->orderBy('date_etat', 'desc')->limit(1);
            }
        ])->where('etudiant_id', $user->id);

        // Recherche par code de requête ou description
        $query->where(function($q) use ($searchTerm) {
            $q->where('code_requete', 'LIKE', "%{$searchTerm}%")
              ->orWhere('description', 'LIKE', "%{$searchTerm}%")
              ->orWhereHas('typeRequete', function($tq) use ($searchTerm) {
                  $tq->where('nom', 'LIKE', "%{$searchTerm}%");
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
