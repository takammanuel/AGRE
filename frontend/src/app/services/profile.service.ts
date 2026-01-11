import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8000/api';

export interface UserProfile {
  id?: number;
  nom: string;
  prenom: string;
  nom_complet?: string;
  email: string;
  email_verified_at?: string;
  telephone?: string;
  adresse?: string;
  role: string;
  roles?: string[];
  avatar?: string;
  photo?: string;
  profil_etudiant?: {
    matricule: string;
    niveau: string;
    filiere: string;
  };
  profil_agent?: {
    poste: string;
    service_id: number;
    service?: { nom: string };
  };
  profil_responsable?: {
    departement: string;
  };
  profil_admin?: {
    niveau_acces: string;
  };
  created_at?: string;
  updated_at?: string;
  data?: any;
  message?: string;
}

export interface UpdatePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface UpdateProfileData {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  matricule?: string;
  niveau?: string;
  filiere?: string;
  poste?: string;
  service_id?: number;
  departement?: string;
  niveau_acces?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${API_URL}/auth/profile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.apiUrl);
  }

  updateProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(this.apiUrl, profile);
  }

  updatePassword(passwordData: UpdatePasswordRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/password`, passwordData);
  }

  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post(`${this.apiUrl}/avatar`, formData);
  }

  deleteAvatar(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/avatar`);
  }

  updatePhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post(`${this.apiUrl}/photo`, formData);
  }
}