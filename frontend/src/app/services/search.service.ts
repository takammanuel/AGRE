import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

const API_URL = 'http://localhost:8000/api';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  /**
   * Rechercher des requêtes selon le rôle de l'utilisateur
   * @param searchTerm - Terme de recherche (code requête, matricule, nom étudiant)
   */
  searchRequetes(searchTerm: string): Observable<any> {
    const user = this.authService.getCurrentUser();
    const role = user?.roles[0];

    let endpoint = '';

    switch (role) {
      case 'ADMINISTRATEUR':
        endpoint = `${API_URL}/admin/requetes/search`;
        break;
      case 'AGENT_ACADEMIQUE':
        endpoint = `${API_URL}/agent/requetes/search`;
        break;
      case 'RESPONSABLE_PEDAGOGIQUE':
        endpoint = `${API_URL}/responsable/requetes/search`;
        break;
      case 'ETUDIANT':
        endpoint = `${API_URL}/etudiant/requetes/search`;
        break;
      default:
        throw new Error('Rôle non reconnu');
    }

    return this.http.get<any>(endpoint, {
      params: { q: searchTerm }
    });
  }

  /**
   * Rechercher des requêtes pour l'admin
   */
  searchRequetesAdmin(searchTerm: string): Observable<any> {
    return this.http.get<any>(`${API_URL}/admin/requetes/search`, {
      params: { q: searchTerm }
    });
  }

  /**
   * Rechercher des requêtes pour l'agent
   */
  searchRequetesAgent(searchTerm: string): Observable<any> {
    return this.http.get<any>(`${API_URL}/agent/requetes/search`, {
      params: { q: searchTerm }
    });
  }

  /**
   * Rechercher des requêtes pour le responsable
   */
  searchRequetesResponsable(searchTerm: string): Observable<any> {
    return this.http.get<any>(`${API_URL}/responsable/requetes/search`, {
      params: { q: searchTerm }
    });
  }

  /**
   * Rechercher ses propres requêtes (étudiant)
   */
  searchRequetesEtudiant(searchTerm: string): Observable<any> {
    return this.http.get<any>(`${API_URL}/etudiant/requetes/search`, {
      params: { q: searchTerm }
    });
  }
}
