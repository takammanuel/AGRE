import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Message, ApiResponse } from '../models/communication';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/messages`;

  getMessages(): Observable<Message[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => res.data ? res.data : res)
    );
  }

  // Envoi de l'objet complet requis par le backend
  sendMessage(contenu: string, emetteurId: number, recepteurId: number = 1): Observable<Message> {
    const payload = {
      contenu: contenu,
      emetteur_id: emetteurId, // Requis par ton serveur
      recepteur_id: recepteurId
    };

    return this.http.post<any>(this.apiUrl, payload).pipe(
      map(res => res.data ? res.data : res)
    );
  }
}
