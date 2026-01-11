import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TypeRequetesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Récupère la liste des services disponibles
   */
  getServices(): Observable<any> {
    return this.http.get(`${this.apiUrl}/services`);
  }

  /**
   * Récupère tous les types de requêtes
   */
  getAllTypeRequetes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/type-requetes`);
  }

  /**
   * Crée un nouveau type de requête
   */
  createTypeRequete(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/type-requetes`, payload);
  }

  /**
   * Met à jour un type de requête
   */
  updateTypeRequete(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/type-requetes/${id}`, payload);
  }

  /**
   * Supprime un type de requête
   */
  deleteTypeRequete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/type-requetes/${id}`);
  }
}