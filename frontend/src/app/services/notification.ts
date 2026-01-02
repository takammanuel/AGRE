import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap, interval, startWith, switchMap } from 'rxjs';
import { Notification, ApiResponse } from '../models/communication';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8000/api/notifications';

  // Permet à n'importe quel composant de connaître le nombre de non-lus
  private unreadCount = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCount.asObservable();

  /**
   * Récupère les notifications depuis l'API
   */
  getNotifications(): Observable<Notification[]> {
    return this.http.get<ApiResponse<Notification[]>>(this.API_URL).pipe(
      map(res => res.data),
      tap(notifications => {
        // Calcule le total des messages non lus
        const count = notifications.filter(n => !n.is_read).length;
        this.unreadCount.next(count);
      })
    );
  }

  /**
   * Lance une vérification automatique toutes les 10 secondes
   */
  startPolling(): Observable<Notification[]> {
    return interval(10000).pipe(
      startWith(0),
      switchMap(() => this.getNotifications())
    );
  }

  /**
   * Marque une notification comme lue
   */
  markAsRead(id: number): Observable<any> {
    return this.http.patch(`${this.API_URL}/${id}/read`, {}).pipe(
      tap(() => {
        const current = this.unreadCount.value;
        if (current > 0) this.unreadCount.next(current - 1);
      })
    );
  }
}
