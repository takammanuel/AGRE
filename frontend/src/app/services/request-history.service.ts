import { Injectable, inject } from '@angular/core';
import { RequestService } from './request.service';

@Injectable({
  providedIn: 'root'
})
export class RequestHistoryService {
  private requestService = inject(RequestService);

  getHistory(requestId: number) {
    return this.requestService.getRequestHistory(requestId);
  }
}

