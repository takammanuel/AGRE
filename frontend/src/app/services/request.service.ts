import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8000/api';

export interface TypeRequete {
  id: number;
  nom: string;
  description: string;
  service_id?: number;
  service?: {
    id: number;
    nom: string;
  };
}

export interface Etat {
  id: number;
  libelle: string;
}

export interface PieceJointe {
  id: number;
  nom: string;
  chemin_fichier: string;
  requete_id: number;
}

export interface HistoriqueRequete {
  id: number;
  date_etat: string;
  etat_id: number;
  requete_id: number;
  utilisateur_id?: number;
  etat?: Etat;
  utilisateur?: any;
  duree?: string;
}

export interface Requete {
  id: number;
  code_requete: string;
  priorite: 'URGENTE' | 'STANDARD';
  description: string;
  etudiant_id: number;
  agent_id?: number;
  responsable_id?: number;
  type_requete_id: number;
  created_at: string;
  updated_at: string;
  etudiant?: any;
  agent?: any;
  responsable?: any;
  typeRequete?: TypeRequete;
  piecesJointes?: PieceJointe[];
  historiques?: HistoriqueRequete[];
  etat_actuel?: Etat;
}

export interface StoreRequestData {
  type_requete_id: number;
  description: string;
  priorite: 'URGENTE' | 'STANDARD';
  pieces_jointes?: File[];
}

export interface ProcessRequestData {
  action: 'validate' | 'reject' | 'request_info' | 'escalate';
  commentaire?: string;
  document?: File;
}

export interface ReassignRequestData {
  service_id: number;
  commentaire?: string;
}

export interface ApproveRequestData {
  action: 'approve' | 'reject' | 'request_info' | 'escalate';
  commentaire?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private http = inject(HttpClient);

  // Routes Étudiant
  getMyRequests(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<any>(`${API_URL}/my-requests`, { params });
  }

  getRequestById(id: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/my-requests/${id}`);
  }

  createRequest(data: StoreRequestData): Observable<any> {
    const formData = new FormData();
    formData.append('type_requete_id', data.type_requete_id.toString());
    formData.append('description', data.description);
    formData.append('priorite', data.priorite);
    
    if (data.pieces_jointes && data.pieces_jointes.length > 0) {
      data.pieces_jointes.forEach((file, index) => {
        formData.append(`pieces_jointes[${index}]`, file);
      });
    }

    return this.http.post<any>(`${API_URL}/my-requests`, formData);
  }

  updateRequest(id: number, informationsComplementaires: string): Observable<any> {
    return this.http.put<any>(`${API_URL}/my-requests/${id}`, {
      informations_complementaires: informationsComplementaires
    });
  }

  cancelRequest(id: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/my-requests/${id}`);
  }

  // Routes Agent
  getAssignedRequests(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<any>(`${API_URL}/assigned-requests`, { params });
  }

  getAssignedRequestById(id: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/assigned-requests/${id}`);
  }

  takeCharge(id: number): Observable<any> {
    return this.http.post<any>(`${API_URL}/assigned-requests/${id}/take-charge`, {});
  }

  processRequest(id: number, data: ProcessRequestData): Observable<any> {
    const formData = new FormData();
    formData.append('action', data.action);
    if (data.commentaire) {
      formData.append('commentaire', data.commentaire);
    }
    if (data.document) {
      formData.append('document', data.document);
    }

    return this.http.post<any>(`${API_URL}/assigned-requests/${id}/process`, formData);
  }

  reassignRequest(id: number, data: ReassignRequestData): Observable<any> {
    return this.http.post<any>(`${API_URL}/assigned-requests/${id}/reassign`, data);
  }

  // Routes Responsable
  getPendingApprovals(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<any>(`${API_URL}/pending-approvals`, { params });
  }

  getPendingApprovalById(id: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/pending-approvals/${id}`);
  }

  approveRequest(id: number, data: ApproveRequestData): Observable<any> {
    return this.http.post<any>(`${API_URL}/pending-approvals/${id}/approve`, data);
  }

  // Historique
  getRequestHistory(id: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/requests/${id}/history`);
  }
}

