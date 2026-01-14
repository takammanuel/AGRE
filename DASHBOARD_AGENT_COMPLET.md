# Dashboard Agent - Guide Complet

## Vue d'ensemble

Le dashboard agent permet à un agent académique de :
1. ✅ Voir ses statistiques (requêtes assignées, en cours, traitées)
2. ✅ Recevoir les requêtes escaladées par l'admin
3. ✅ Traiter les requêtes qui lui sont assignées
4. ✅ Voir l'historique de ses actions
5. ✅ Gérer les requêtes urgentes

## Architecture

### Backend
- **Contrôleur** : `AgentController.php`
- **Routes** : `/api/agent/*`
- **Middleware** : `role:AGENT_ACADEMIQUE`

### Frontend
- **Dashboard Home** : Vue d'ensemble avec statistiques
- **Requêtes Affectées** : Liste des requêtes assignées à l'agent
- **Requêtes Urgentes** : Requêtes prioritaires
- **Historique** : Historique des actions de l'agent

## Étape 1 : Backend - Contrôleur Agent

Créer le fichier `AGRE/backend/app/Http/Controllers/Api/Agent/AgentController.php` :

```php
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
                'date_etat' => now(),
                'commentaire' => 'Prise en charge par ' . $agent->nom_complet,
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
                'date_etat' => now(),
                'commentaire' => $validated['commentaire'] ?? 'Requête traitée par ' . $agent->nom_complet,
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
```

## Étape 2 : Routes Backend

Ajouter dans `AGRE/backend/routes/api.php` :

```php
// Routes Agent Académique
Route::prefix('agent')->middleware(['auth:sanctum', 'role:AGENT_ACADEMIQUE'])->group(function () {
    Route::get('/dashboard', [AgentController::class, 'dashboard']);
    Route::get('/requetes-affectees', [AgentController::class, 'requetesAffectees']);
    Route::get('/requetes-urgentes', [AgentController::class, 'requetesUrgentes']);
    Route::get('/historique', [AgentController::class, 'historique']);
    Route::get('/badge-counts', [AgentController::class, 'badgeCounts']);
    
    // Actions sur les requêtes
    Route::post('/requetes/{id}/prendre-en-charge', [AgentController::class, 'prendreEnCharge']);
    Route::post('/requetes/{id}/traiter', [AgentController::class, 'traiter']);
});
```

N'oubliez pas d'ajouter l'import en haut du fichier :
```php
use App\Http\Controllers\Api\Agent\AgentController;
```

## Étape 3 : Service Frontend

Créer `AGRE/frontend/src/app/services/agent.service.ts` :

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8000/api';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private http = inject(HttpClient);

  // Dashboard
  getDashboard(): Observable<any> {
    return this.http.get<any>(`${API_URL}/agent/dashboard`);
  }

  // Requêtes affectées
  getRequetesAffectees(filters?: any): Observable<any> {
    return this.http.get<any>(`${API_URL}/agent/requetes-affectees`, { params: filters });
  }

  // Requêtes urgentes
  getRequetesUrgentes(): Observable<any> {
    return this.http.get<any>(`${API_URL}/agent/requetes-urgentes`);
  }

  // Historique
  getHistorique(filters?: any): Observable<any> {
    return this.http.get<any>(`${API_URL}/agent/historique`, { params: filters });
  }

  // Badge counts
  getBadgeCounts(): Observable<any> {
    return this.http.get<any>(`${API_URL}/agent/badge-counts`);
  }

  // Prendre en charge une requête
  prendreEnCharge(id: number): Observable<any> {
    return this.http.post<any>(`${API_URL}/agent/requetes/${id}/prendre-en-charge`, {});
  }

  // Traiter une requête
  traiter(id: number, commentaire?: string): Observable<any> {
    return this.http.post<any>(`${API_URL}/agent/requetes/${id}/traiter`, { commentaire });
  }
}
```

## Étape 4 : Composant Dashboard Agent

Le fichier existe déjà, je vais te donner le code complet à mettre dans :
`AGRE/frontend/src/app/pages/agent/dashboard-home/dashboard-home.component.ts`

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AgentService } from '../../../services/agent.service';

@Component({
  selector: 'app-agent-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class AgentDashboardHomeComponent implements OnInit {
  private agentService = inject(AgentService);
  
  stats: any = null;
  requetesRecentes: any[] = [];
  requetesUrgentes: any[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;
    
    this.agentService.getDashboard().subscribe({
      next: (response) => {
        console.log('Dashboard agent:', response);
        this.stats = response.data;
        this.requetesRecentes = response.data.requetes_recentes || [];
        this.requetesUrgentes = response.data.requetes_urgentes || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.error = 'Impossible de charger le dashboard';
        this.loading = false;
      }
    });
  }

  getStatusClass(statut: string): string {
    const statusMap: { [key: string]: string } = {
      'EN_ATTENTE': 'status-pending',
      'EN_COURS': 'status-progress',
      'TRAITEE': 'status-completed',
      'REJETEE': 'status-rejected'
    };
    return statusMap[statut] || 'status-default';
  }

  getStatusLabel(statut: string): string {
    const labelMap: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'TRAITEE': 'Traitée',
      'REJETEE': 'Rejetée'
    };
    return labelMap[statut] || statut;
  }

  getPriorityClass(priorite: string): string {
    return priorite === 'URGENTE' ? 'priority-urgent' : 'priority-normal';
  }

  getPriorityLabel(priorite: string): string {
    return priorite === 'URGENTE' ? 'Urgente' : 'Standard';
  }
}
```

## Étape 5 : Template HTML Dashboard Agent

Fichier : `AGRE/frontend/src/app/pages/agent/dashboard-home/dashboard-home.component.html`

Voir le fichier séparé `DASHBOARD_AGENT_TEMPLATE.html` pour le code complet.

## Étape 6 : Styles SCSS

Fichier : `AGRE/frontend/src/app/pages/agent/dashboard-home/dashboard-home.component.scss`

Voir le fichier séparé `DASHBOARD_AGENT_STYLES.scss` pour les styles complets.

## Tests

### 1. Créer un Agent de Test
```bash
cd AGRE/backend
php artisan tinker
>>> $agent = \App\Models\Utilisateur::create([
...   'nom' => 'AGENT',
...   'prenom' => 'Test',
...   'email' => 'agent@test.com',
...   'password' => bcrypt('password'),
...   'is_active' => true
... ]);
>>> $agent->assignRole('Agent Académique');
>>> exit
```

### 2. Assigner des Requêtes à l'Agent
```bash
php artisan tinker
>>> $agent = \App\Models\Utilisateur::where('email', 'agent@test.com')->first();
>>> \App\Models\Requete::limit(5)->update(['agent_id' => $agent->id]);
>>> exit
```

### 3. Se Connecter et Tester
1. Connecte-toi avec `agent@test.com` / `password`
2. Tu devrais voir le dashboard avec les statistiques
3. Teste la prise en charge et le traitement des requêtes

## Fonctionnalités Complètes

✅ **Dashboard** : Vue d'ensemble avec statistiques
✅ **Requêtes Affectées** : Liste paginée avec filtres
✅ **Requêtes Urgentes** : Priorité haute
✅ **Prise en Charge** : Bouton pour prendre en charge
✅ **Traitement** : Bouton pour marquer comme traitée
✅ **Historique** : Toutes les actions de l'agent
✅ **Notifications** : Alertes pour l'étudiant
✅ **Badge Counts** : Compteurs dans le menu

Dis-moi si tu veux que je crée les fichiers manquants ou si tu as besoin d'aide pour l'implémentation !
