import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8000/api';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private http = inject(HttpClient);

  /**
   * Dashboard - Statistiques globales
   */
  getDashboard(): Observable<any> {
    return this.http.get<any>(`${API_URL}/agent/dashboard`);
  }

  /**
   * Requêtes affectées à l'agent
   */
  getRequetesAffectees(filters?: any): Observable<any> {
    return this.http.get<any>(`${API_URL}/agent/requetes-affectees`, { params: filters });
  }

  /**
   * Requêtes urgentes
   */
  getRequetesUrgentes(): Observable<any> {
    return this.http.get<any>(`${API_URL}/agent/requetes-urgentes`);
  }

  /**
   * Historique des actions de l'agent
   */
  getHistorique(filters?: any): Observable<any> {
    return this.http.get<any>(`${API_URL}/agent/historique`, { params: filters });
  }

  /**
   * Compteurs pour les badges
   */
  getBadgeCounts(): Observable<any> {
    return this.http.get<any>(`${API_URL}/agent/badge-counts`);
  }

  /**
   * Prendre en charge une requête
   */
  prendreEnCharge(id: number): Observable<any> {
    return this.http.post<any>(`${API_URL}/agent/requetes/${id}/prendre-en-charge`, {});
  }

  /**
   * Traiter une requête
   */
  traiter(id: number, commentaire?: string): Observable<any> {
    return this.http.post<any>(`${API_URL}/agent/requetes/${id}/traiter`, { commentaire });
  }
}
