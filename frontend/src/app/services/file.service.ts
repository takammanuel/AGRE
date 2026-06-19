import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8000/api';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private http = inject(HttpClient);

  uploadAttachment(requestId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('fichier', file);

    return this.http.post<any>(`${API_URL}/requests/${requestId}/attachments`, formData);
  }

  downloadAttachment(attachmentId: number): Observable<Blob> {
    return this.http.get(`${API_URL}/attachments/${attachmentId}/download`, {
      responseType: 'blob'
    });
  }

  deleteAttachment(attachmentId: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/attachments/${attachmentId}`);
  }

  /**
   * Télécharge un fichier blob et déclenche le téléchargement dans le navigateur
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

