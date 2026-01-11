import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

const API_URL = 'http://localhost:8000/api';

export interface Notification {
  id: number;
  titre: string;
  message: string;
  requete_id: number | null;
  utilisateur_id: number;
  lu: boolean;
  created_at: string;
  updated_at: string;
  requete?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  public unreadCount$ = this.unreadCountSubject.asObservable();

  /**
   * Récupérer toutes les notifications
   */
  getNotifications(): Observable<any> {
    return this.http.get<any>(`${API_URL}/notifications`);
  }

  /**
   * Récupérer le nombre de notifications non lues
   */
  getUnreadCount(): Observable<any> {
    return this.http.get<any>(`${API_URL}/notifications/unread-count`).pipe(
      tap(response => {
        if (response.success) {
          this.unreadCountSubject.next(response.data.count);
        }
      })
    );
  }

  /**
   * Marquer une notification comme lue
   */
  markAsRead(id: number): Observable<any> {
    return this.http.put<any>(`${API_URL}/notifications/${id}/read`, {}).pipe(
      tap(() => this.refreshUnreadCount())
    );
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllAsRead(): Observable<any> {
    return this.http.put<any>(`${API_URL}/notifications/read-all`, {}).pipe(
      tap(() => this.refreshUnreadCount())
    );
  }

  /**
   * Supprimer une notification
   */
  deleteNotification(id: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/notifications/${id}`).pipe(
      tap(() => this.refreshUnreadCount())
    );
  }

  /**
   * Rafraîchir le compteur de notifications non lues
   */
  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }

  /**
   * Démarrer le polling pour les notifications (toutes les 30 secondes)
   */
  startPolling(): void {
    interval(30000).pipe(
      switchMap(() => this.getUnreadCount())
    ).subscribe();
  }
}
