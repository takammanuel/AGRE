import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8000/api';

export interface Service {
  id?: number;
  nom: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  private apiUrl = `${API_URL}/admin/services`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 1, perPage: number = 10): Observable<any> {
    return this.http.get<Service[]>(`${this.apiUrl}?page=${page}&per_page=${perPage}`);
  }

  getById(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}`);
  }

  create(service: Service): Observable<Service> {
    return this.http.post<Service>(this.apiUrl, service);
  }

  update(id: number, service: Service): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/${id}`, service);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}