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
   * Récupérer toutes les conversations de l'utilisateur connecté
   */
  getConversations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/conversations`).pipe(
      catchError(err => {
        console.error('Erreur chargement conversations:', err);
        return of({ success: false, data: [] });
      })
    );
  }

  /**
   * Récupérer l'historique d'une requête spécifique
   */
  getMessagesByRequete(requeteId: number): Observable<any> {
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
    return this.http.post(`${this.apiUrl}/messages`, messageData).pipe(
      catchError(err => {
        console.error('Envoi message échoué:', err);
        throw err;
      })
    );
  }

  /**
   * Marquer les messages d'une conversation comme lus
   */
  markAsRead(requeteId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/messages/${requeteId}/mark-read`, {}).pipe(
      catchError(err => {
        console.error('Erreur marquage messages lus:', err);
        return of({ success: false });
      })
    );
  }
}
