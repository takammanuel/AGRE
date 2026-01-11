import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

const API_URL = 'http://localhost:8000/api';

export interface BadgeCounts {
  utilisateurs: number;
  approbations: number;
  requetes_escaladees: number;
  requetes_urgentes: number;
  services: number;
  types_requetes: number;
  messages_non_lus: number;
  notifications_non_lues: number;
}

@Injectable({
  providedIn: 'root'
})
export class BadgeCounterService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  private countsSubject = new BehaviorSubject<BadgeCounts>({
    utilisateurs: 0,
    approbations: 0,
    requetes_escaladees: 0,
    requetes_urgentes: 0,
    services: 0,
    types_requetes: 0,
    messages_non_lus: 0,
    notifications_non_lues: 0
  });
  
  public counts$ = this.countsSubject.asObservable();

  /**
   * Récupérer les compteurs selon le rôle
   */
  getBadgeCounts(): Observable<any> {
    const user = this.authService.getCurrentUser();
    const role = user?.roles[0];

    let endpoint = '';
    
    if (role === 'ADMINISTRATEUR') {
      endpoint = `${API_URL}/admin/badge-counts`;
    } else if (role === 'AGENT_ACADEMIQUE') {
      endpoint = `${API_URL}/agent/badge-counts`;
    } else if (role === 'ETUDIANT') {
      endpoint = `${API_URL}/etudiant/badge-counts`;
    }

    if (!endpoint) {
      return new Observable();
    }

    return this.http.get<any>(endpoint).pipe(
      tap(response => {
        if (response.success) {
          this.countsSubject.next(response.data);
        }
      })
    );
  }

  /**
   * Rafraîchir les compteurs
   */
  refreshCounts(): void {
    this.getBadgeCounts().subscribe();
  }

  /**
   * Démarrer le polling automatique (toutes les 30 secondes)
   */
  startPolling(): void {
    interval(30000).pipe(
      switchMap(() => this.getBadgeCounts())
    ).subscribe();
  }

  /**
   * Obtenir un compteur spécifique
   */
  getCount(key: keyof BadgeCounts): number {
    return this.countsSubject.value[key];
  }
}
