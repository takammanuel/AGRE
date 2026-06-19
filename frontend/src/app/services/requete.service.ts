import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RequeteService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /** * ÉTUDIANT : Récupère ses requêtes via la nouvelle route dédiée
   */
  getRequetesByEtudiant(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/requetes/etudiant/${userId}`);
  }

  /** * AGENT : Récupère la liste globale
   */
  getAllRequetes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/requetes`);
  }

  /** * COMMUN : Détails d'une requête pour la messagerie
   */
  getRequeteById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/requetes/${id}`);
  }

  /** * CRÉATION : Nouvelle requête
   */
  createRequete(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/requetes`, payload);
  }

  /** * AGENT : Mise à jour du statut
   * NOTE : On ajoute /statut pour correspondre à Route::put('/{id}/statut', ...)
   */
  updateStatut(id: number, statut: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/requetes/${id}/statut`, { statut });
  }
}
