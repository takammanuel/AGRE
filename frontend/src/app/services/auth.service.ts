import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadStoredUser();
  }

  // --- Authentification ---
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, data);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => this.clearAuthData()),
      catchError(() => {
        this.clearAuthData();
        return of({ message: 'Déconnecté' });
      })
    );
  }

  // --- Utilitaires de session ---
  private loadStoredUser(): void {
    const user = localStorage.getItem('user');
    if (user) this.currentUserSubject.next(JSON.parse(user));
  }

  private clearAuthData(): void {
    localStorage.clear();
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): any { return this.currentUserSubject.value; }

  getToken(): string | null { return localStorage.getItem('access_token'); }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  // --- Gestion des rôles ---
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  getUserRole(): string {
    if (this.hasRole('AGENT_ACADEMIQUE') || this.hasRole('ADMINISTRATEUR')) {
      return 'agent';
    }
    return 'etudiant';
  }

  isAgent(): boolean { return this.getUserRole() === 'agent'; }

  updateUserInfo(userInfo: any): void {
    const currentUser = this.getCurrentUser();
    const updatedUser = { ...currentUser, ...userInfo };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    this.currentUserSubject.next(updatedUser);
  }
}
