import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8000/api';

export interface Conversation {
  user_id: number;
  user_nom: string;
  user_prenom: string;
  user_email: string;
  last_message: string;
  last_message_date: string;
  unread_count: number;
  is_read: boolean;
}

export interface Message {
  id: number;
  emetteur_id: number;
  recepteur_id: number;
  requete_id?: number;
  contenu: string;
  lu: boolean;
  created_at: string;
  emetteur: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
  recepteur: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
}

export interface ConversationDetail {
  user: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
  messages: Message[];
}

export interface Etudiant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessagerieService {
  private http = inject(HttpClient);

  /**
   * Récupérer toutes les conversations
   */
  getConversations(): Observable<{ success: boolean; data: Conversation[] }> {
    return this.http.get<{ success: boolean; data: Conversation[] }>(
      `${API_URL}/agent/messagerie/conversations`
    );
  }

  /**
   * Récupérer les messages d'une conversation
   */
  getConversation(userId: number): Observable<{ success: boolean; data: ConversationDetail }> {
    return this.http.get<{ success: boolean; data: ConversationDetail }>(
      `${API_URL}/agent/messagerie/conversation/${userId}`
    );
  }

  /**
   * Envoyer un message
   */
  sendMessage(data: {
    destinataire_id: number;
    contenu: string;
    requete_id?: number;
  }): Observable<{ success: boolean; message: string; data: Message }> {
    return this.http.post<{ success: boolean; message: string; data: Message }>(
      `${API_URL}/agent/messagerie/send`,
      data
    );
  }

  /**
   * Marquer un message comme lu
   */
  markAsRead(messageId: number): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${API_URL}/agent/messagerie/${messageId}/read`,
      {}
    );
  }

  /**
   * Récupérer le nombre de messages non lus
   */
  getUnreadCount(): Observable<{ success: boolean; data: { count: number } }> {
    return this.http.get<{ success: boolean; data: { count: number } }>(
      `${API_URL}/agent/messagerie/unread-count`
    );
  }

  /**
   * Récupérer la liste des étudiants
   */
  getEtudiants(): Observable<{ success: boolean; data: Etudiant[] }> {
    return this.http.get<{ success: boolean; data: Etudiant[] }>(
      `${API_URL}/agent/messagerie/etudiants`
    );
  }
}
