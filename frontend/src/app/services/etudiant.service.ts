import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8000/api';

export interface EtudiantStats {
  total: number;
  en_attente: number;
  en_cours: number;
  traitees: number;
}

@Injectable({
  providedIn: 'root'
})
export class EtudiantService {
  private http = inject(HttpClient);

  /**
   * Récupérer les statistiques du dashboard
   */
  getDashboardStats(): Observable<{ success: boolean; data: EtudiantStats }> {
    return this.http.get<{ success: boolean; data: EtudiantStats }>(
      `${API_URL}/etudiant/dashboard`
    );
  }

  /**
   * Récupérer toutes les requêtes de l'étudiant
   */
  getRequetes(): Observable<any> {
    return this.http.get<any>(`${API_URL}/etudiant/requetes`);
  }

  /**
   * Récupérer les détails d'une requête
   */
  getRequeteDetails(id: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/etudiant/requetes/${id}`);
  }

  /**
   * Créer une nouvelle requête
   */
  createRequete(data: {
    type_requete_id: number;
    description: string;
    priorite?: string;
    pieces_jointes?: File[];
  }): Observable<any> {
    const formData = new FormData();
    
    formData.append('type_requete_id', data.type_requete_id.toString());
    formData.append('description', data.description);
    
    if (data.priorite) {
      formData.append('priorite', data.priorite);
    }
    
    if (data.pieces_jointes && data.pieces_jointes.length > 0) {
      data.pieces_jointes.forEach((file, index) => {
        formData.append(`pieces_jointes[${index}]`, file);
      });
    }
    
    console.log('FormData envoyé:', {
      type_requete_id: data.type_requete_id,
      description: data.description,
      priorite: data.priorite,
      files_count: data.pieces_jointes?.length || 0
    });
    
    return this.http.post<any>(`${API_URL}/etudiant/requetes`, formData);
  }

  /**
   * Récupérer les types de requêtes disponibles
   */
  getTypesRequetes(): Observable<any> {
    return this.http.get<any>(`${API_URL}/etudiant/types-requetes`);
  }
}
