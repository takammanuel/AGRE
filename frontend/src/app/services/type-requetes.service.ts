import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TypeRequete } from './request.service';

@Injectable({
  providedIn: 'root'
})
export class TypeRequetesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(page: number = 1, perPage: number = 10): Observable<any> {
    return this.http.get<TypeRequete[]>(`${this.apiUrl}/admin/types-requetes?page=${page}&per_page=${perPage}`);
  }

  getForStudents(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/type-requetes/students`);
  }

  getById(id: number): Observable<TypeRequete> {
    return this.http.get<TypeRequete>(`${this.apiUrl}/admin/types-requetes/${id}`);
  }

  create(typeRequete: TypeRequete): Observable<TypeRequete> {
    return this.http.post<TypeRequete>(`${this.apiUrl}/admin/types-requetes`, typeRequete);
  }

  update(id: number, typeRequete: TypeRequete): Observable<TypeRequete> {
    return this.http.put<TypeRequete>(`${this.apiUrl}/admin/types-requetes/${id}`, typeRequete);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/types-requetes/${id}`);
  }

  // Pour récupérer les services pour le select
  getServices(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/services`);
  }

  // /**
  //  * Récupère tous les types de requêtes
  //  */
  // getAllTypeRequetes(): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/admin/type-requetes`);
  // }

  // /**
  //  * Crée un nouveau type de requête
  //  */
  // createTypeRequete(payload: any): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/type-requetes`, payload);
  // }

  // /**
  //  * Met à jour un type de requête
  //  */
  // updateTypeRequete(id: number, payload: any): Observable<any> {
  //   return this.http.put(`${this.apiUrl}/type-requetes/${id}`, payload);
  // }

  // /**
  //  * Supprime un type de requête
  //  */
  // deleteTypeRequete(id: number): Observable<any> {
  //   return this.http.delete(`${this.apiUrl}/type-requetes/${id}`);
  // }
}
