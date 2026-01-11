import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl || 'http://localhost:8000/api';

  /**
   * Récupérer l'historique d'une requête spécifique
   * ATTENTION : L'URL doit correspondre au prefix 'requetes' de ton api.php
   */
  getMessagesByRequete(requeteId: number): Observable<any> {
    // Correction de l'URL pour correspondre à : Route::get('/{requete_id}/messages') dans le prefix 'requetes'
    return this.http.get(`${this.apiUrl}/requetes/${requeteId}/messages`).pipe(
      catchError(err => {
        console.error('Erreur chargement historique messages:', err);
        return of({ success: false, data: [] });
      })
    );
  }

  /**
   * Envoyer un message
   */
  sendMessage(messageData: any): Observable<any> {
    // Cette route est dans le prefix 'messages' : Route::post('/', [MessageController::class, 'store'])
    return this.http.post(`${this.apiUrl}/messages`, messageData).pipe(
      catchError(err => {
        console.error('Envoi message échoué:', err);
        throw err;
      })
    );
  }
}
