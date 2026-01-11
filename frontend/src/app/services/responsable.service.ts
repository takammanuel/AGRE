import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8000/api';

@Injectable({
  providedIn: 'root'
})
export class ResponsableService {
  private http = inject(HttpClient);

  /**
   * Dashboard - Statistiques globales
   */
  getDashboard(): Observable<any> {
    return this.http.get<any>(`${API_URL}/responsable/dashboard`);
  }

  /**
   * Liste des requêtes
   */
  getRequetes(): Observable<any> {
    return this.http.get<any>(`${API_URL}/responsable/requetes`);
  }

  /**
   * Détails d'une requête
   */
  getRequete(id: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/responsable/requetes/${id}`);
  }

  /**
   * Approbations en attente
   */
  getApprobations(): Observable<any> {
    return this.http.get<any>(`${API_URL}/responsable/approbations`);
  }

  /**
   * Approuver une requête
   */
  approuverRequete(id: number): Observable<any> {
    return this.http.post<any>(`${API_URL}/responsable/approbations/${id}/approuver`, {});
  }

  /**
   * Rejeter une requête
   */
  rejeterRequete(id: number, motif: string): Observable<any> {
    return this.http.post<any>(`${API_URL}/responsable/approbations/${id}/rejeter`, { motif });
  }

  /**
   * Requêtes escaladées
   */
  getRequetesEscaladees(): Observable<any> {
    return this.http.get<any>(`${API_URL}/responsable/requetes-escaladees`);
  }

  /**
   * Historique complet
   */
  getHistorique(filters?: any): Observable<any> {
    return this.http.get<any>(`${API_URL}/responsable/historique`, { params: filters });
  }

  /**
   * Statistiques
   */
  getStatistiques(): Observable<any> {
    return this.http.get<any>(`${API_URL}/responsable/statistiques`);
  }
}
