import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestService } from '../../../services/request.service';
import { RequestStatusPipe } from '../../../pipes/request-status.pipe';

@Component({
  selector: 'app-requete-detail-agent',
  standalone: true,
  imports: [CommonModule, RequestStatusPipe],
  template: '<div class="container mt-4"><h2>Détails Requête (Agent)</h2><p>À implémenter</p></div>'
})
export class RequeteDetailAgentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private requestService = inject(RequestService);

  ngOnInit(): void {
    // À implémenter
  }
}

