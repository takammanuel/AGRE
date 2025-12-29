import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8000/api';

export interface TypeRequete {
  id?: number;
  nom: string;
  description: string;
  service_id: number | null;
  service?: any; // Service associé
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TypeRequetesService {
  private apiUrl = `${API_URL}/admin/type-requetes`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 1, perPage: number = 10): Observable<any> {
    return this.http.get<TypeRequete[]>(`${this.apiUrl}?page=${page}&per_page=${perPage}`);
  }

  getById(id: number): Observable<TypeRequete> {
    return this.http.get<TypeRequete>(`${this.apiUrl}/${id}`);
  }

  create(typeRequete: TypeRequete): Observable<TypeRequete> {
    return this.http.post<TypeRequete>(this.apiUrl, typeRequete);
  }

  update(id: number, typeRequete: TypeRequete): Observable<TypeRequete> {
    return this.http.put<TypeRequete>(`${this.apiUrl}/${id}`, typeRequete);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Pour récupérer les services pour le select
  getServices(): Observable<any> {
    return this.http.get<any[]>(`${API_URL}/admin/services`);
  }
}
