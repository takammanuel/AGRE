import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';

const API_URL = 'http://localhost:8000/api';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  roles: string[];
  photo?: string;
  photo_url?: string;
  profil?: any; // Pour stocker le profil (étudiant, agent, etc.)
}

export interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string | null;
    roles: string[];
    is_verified: boolean;
    has_profil_etudiant: boolean;
  };
}

export interface LogoutResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadStoredUser();
  }

  // ========== AUTHENTIFICATION ==========

  /**
   * Connexion utilisateur
   */
  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.storeAuthData(response);
        })
      );
  }

  /**
   * Inscription étudiant
   */
  register(data: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string | null;
    password: string;
    password_confirmation: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${API_URL}/auth/register`, data);
  }

  /**
   * Déconnexion utilisateur (avec appel API)
   */
  logout(): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(`${API_URL}/auth/logout`, {})
      .pipe(
        tap(() => {
          // Nettoyer le storage et l'état local après succès
          this.clearAuthData();
        }),
        catchError((error) => {
          // En cas d'erreur, nettoyer quand même (token peut être expiré)
          console.error('Erreur lors de la déconnexion', error);
          this.clearAuthData();

          // Retourner un observable avec un message par défaut
          return of({ message: 'Déconnexion locale effectuée' });
        })
      );
  }

  // ========== GESTION DU STOCKAGE ==========

  /**
   * Stocker les données d'authentification
   */
  private storeAuthData(response: LoginResponse): void {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('token_type', response.token_type);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  /**
   * Charger l'utilisateur depuis le localStorage au démarrage
   */
  private loadStoredUser(): void {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Erreur lors du parsing de l\'utilisateur stocké', e);
        this.clearAuthData();
      }
    }
  }

  /**
   * Nettoyer toutes les données d'authentification
   */
  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  // ========== UTILITAIRES ==========

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Optionnel : Vérifier si le token n'est pas expiré
    // Tu peux décoder le JWT et vérifier l'expiration
    return true;
  }

  /**
   * Récupérer le token d'accès
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Récupérer l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Mettre à jour l'utilisateur actuel (après modification profil par exemple)
   */
  updateCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // ========== VÉRIFICATION DES RÔLES ==========

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  /**
   * Vérifier si l'utilisateur a au moins un des rôles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user?.roles) return false;
    return roles.some(role => user.roles.includes(role));
  }

  /**
   * Vérifier si administrateur
   */
  isAdmin(): boolean {
    return this.hasRole('ADMINISTRATEUR');
  }

  /**
   * Vérifier si étudiant
   */
  isEtudiant(): boolean {
    return this.hasRole('ETUDIANT');
  }

  /**
   * Vérifier si agent académique
   */
  isAgent(): boolean {
    return this.hasRole('AGENT_ACADEMIQUE');
  }

  /**
   * Vérifier si responsable pédagogique
   */
  isResponsable(): boolean {
    return this.hasRole('RESPONSABLE_PEDAGOGIQUE');
  }

  /**
   * Récupérer le rôle principal (le premier de la liste)
   */
  getPrimaryRole(): string | null {
    const user = this.getCurrentUser();
    return user?.roles?.[0] || null;
  }
}
