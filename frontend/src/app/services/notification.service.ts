import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, startWith, switchMap, Observable, of, Subscription } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:8000/api';

  public unreadCount$ = new BehaviorSubject<number>(0);
  private pollingSubscription?: Subscription;

  constructor() {
    this.initPolling();
  }

  initPolling() {
    this.pollingSubscription = interval(30000).pipe(
      startWith(0),
      switchMap(() => {
        const user = this.authService.getCurrentUser();
        if (user && user.id) {
          return this.getUnreadCount(user.id);
        }
        return of({ unread_count: 0 });
      })
    ).subscribe({
      next: (res: any) => this.unreadCount$.next(res.unread_count || 0),
      error: (err) => console.error('Erreur polling notifications', err)
    });
  }

  getNotifications(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/notifications?utilisateur_id=${userId}`);
  }

  getUnreadCount(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/notifications/unread-count?utilisateur_id=${userId}`);
  }

  markAsRead(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/${id}/read`, {});
  }

  refreshCount(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.id) {
      this.getUnreadCount(user.id).subscribe((res: any) => {
        this.unreadCount$.next(res.unread_count || 0);
      });
    }
  }

  stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}
