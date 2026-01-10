import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RequestService } from '../../../services/request.service';

@Component({
  selector: 'app-requete-detail-responsable',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="container mt-4"><h2>Détails Requête (Responsable)</h2><p>À implémenter</p></div>'
})
export class RequeteDetailResponsableComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private requestService = inject(RequestService);

  ngOnInit(): void {
    // À implémenter
  }
}

