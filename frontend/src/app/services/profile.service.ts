import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8000/api';

export interface UserProfile {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  email: string;
  telephone: string;
  photo: string;
  // photo_url: string;
  is_active: boolean;
  email_verified_at: string | null;
  roles: string[];

  // Profils spécifiques
  profil_etudiant?: {
    matricule?: string;
    niveau?: number;
    filiere?: string;
  };

  profil_agent?: {
    poste?: string;
    service_id?: number;
    service?: {
      id: number;
      nom: string;
    };
  };

  profil_responsable?: {
    departement?: string;
  };

  profil_admin?: {
    niveau_acces?: 'super_admin' | 'admin';
  };
}

export interface UpdateProfileData {
  nom?: string;
  prenom?: string;
  telephone?: string;
  matricule?: string;
  niveau?: number;
  filiere?: string;
  poste?: string;
  service_id?: number | null;
  departement?: string;
  niveau_acces?: 'super_admin' | 'admin';
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${API_URL}/auth/profile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<{ success: boolean; data: UserProfile }> {
    return this.http.get<{ success: boolean; data: UserProfile }>(this.apiUrl);
  }

  updateProfile(data: UpdateProfileData): Observable<{
    success: boolean;
    message: string;
    data: {
      user: any;
      profil: any;
    }
  }> {
    return this.http.put<{
      success: boolean;
      message: string;
      data: {
        user: any;
        profil: any;
      }
    }>(this.apiUrl, data);
  }

  updatePhoto(photo: File): Observable<{
    success: boolean;
    message: string;
    data: {
      photo_url: string;
    }
  }> {
    const formData = new FormData();
    formData.append('photo', photo);

    return this.http.post<{
      success: boolean;
      message: string;
      data: {
        photo_url: string;
      }
    }>(`${this.apiUrl}/photo`, formData);
  }

  // Récupérer tous les services pour le select (pour les agents)
  // getServices(): Observable<any[]> {
  //   return this.http.get<any[]>(`${API_URL}/services`);
  // }
}
