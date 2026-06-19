import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8000/api';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);

  /**
   * Dashboard - Statistiques globales
   */
  getDashboard(): Observable<any> {
    return this.http.get<any>(`${API_URL}/admin/dashboard`);
  }

  /**
   * Approbations en attente
   */
  getApprobations(): Observable<any> {
    return this.http.get<any>(`${API_URL}/admin/approbations`);
  }

  /**
   * Approuver une requête
   */
  approuverRequete(id: number): Observable<any> {
    return this.http.post<any>(`${API_URL}/admin/approbations/${id}/approuver`, {});
  }

  /**
   * Rejeter une requête
   */
  rejeterRequete(id: number, motif: string): Observable<any> {
    return this.http.post<any>(`${API_URL}/admin/approbations/${id}/rejeter`, { motif });
  }

  /**
   * Requêtes escaladées
   */
  getRequetesEscaladees(): Observable<any> {
    return this.http.get<any>(`${API_URL}/admin/requetes-escaladees`);
  }

  /**
   * Historique complet
   */
  getHistorique(filters?: any): Observable<any> {
    return this.http.get<any>(`${API_URL}/admin/historique`, { params: filters });
  }
}
