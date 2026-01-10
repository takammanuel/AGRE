import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RequestService } from '../../../services/request.service';
import { RequestStatusPipe } from '../../../pipes/request-status.pipe';

@Component({
  selector: 'app-pending-approvals',
  standalone: true,
  imports: [CommonModule, RequestStatusPipe],
  template: '<div class="container mt-4"><h2>Approbations en Attente</h2><p>À implémenter</p></div>'
})
export class PendingApprovalsComponent implements OnInit {
  private router = inject(Router);
  private requestService = inject(RequestService);

  ngOnInit(): void {
    // À implémenter
  }
}

