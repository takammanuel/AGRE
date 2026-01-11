import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8000/api';

export interface DashboardAgentStats {
  affectees_aujourdhui: number;
  affectees_semaine: number;
  urgentes: number;
  total_affectees: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardAgentService {
  private http = inject(HttpClient);

  /**
   * Récupérer les statistiques du dashboard agent
   */
  getDashboardStats(): Observable<{ success: boolean; data: DashboardAgentStats }> {
    return this.http.get<{ success: boolean; data: DashboardAgentStats }>(
      `${API_URL}/agent/dashboard`
    );
  }

  /**
   * Récupérer les requêtes affectées
   */
  getRequetes(filter?: string): Observable<any> {
    const url = filter 
      ? `${API_URL}/agent/requetes?filter=${filter}`
      : `${API_URL}/agent/requetes`;
    
    return this.http.get<any>(url);
  }

  /**
   * Récupérer les statistiques détaillées
   */
  getStatistiques(): Observable<any> {
    return this.http.get<any>(`${API_URL}/agent/statistiques`);
  }

  /**
   * Récupérer les détails d'une requête
   */
  getRequeteDetails(id: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/agent/requetes/${id}`);
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
  traiterRequete(id: number, data: { commentaire?: string; pieces_jointes?: File[] }): Observable<any> {
    const formData = new FormData();
    
    if (data.commentaire) {
      formData.append('commentaire', data.commentaire);
    }
    
    if (data.pieces_jointes) {
      data.pieces_jointes.forEach((file, index) => {
        formData.append(`pieces_jointes[${index}]`, file);
      });
    }
    
    return this.http.post<any>(`${API_URL}/agent/requetes/${id}/traiter`, formData);
  }

  /**
   * Rejeter une requête
   */
  rejeterRequete(id: number, motif: string): Observable<any> {
    return this.http.post<any>(`${API_URL}/agent/requetes/${id}/rejeter`, { motif });
  }

  /**
   * Ajouter un commentaire
   */
  ajouterCommentaire(id: number, commentaire: string): Observable<any> {
    return this.http.post<any>(`${API_URL}/agent/requetes/${id}/commentaire`, { commentaire });
  }
}
