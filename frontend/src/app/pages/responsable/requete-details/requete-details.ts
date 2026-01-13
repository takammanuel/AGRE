import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ResponsableService } from '../../../services/responsable.service';

@Component({
  selector: 'app-responsable-requete-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-4">
      <a routerLink="/responsable/requetes" class="btn btn-outline-secondary mb-3">
        <i class="bi bi-arrow-left"></i> Retour
      </a>

      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border" role="status"></div>
      </div>

      <div *ngIf="!isLoading && requete" class="card">
        <div class="card-header">
          <h3>{{ requete.code_requete }}</h3>
        </div>
        <div class="card-body">
          <p><strong>Étudiant:</strong> {{ requete.etudiant?.nom }} {{ requete.etudiant?.prenom }}</p>
          <p><strong>Type:</strong> {{ requete.type_requete?.nom }}</p>
          <p><strong>Service:</strong> {{ requete.type_requete?.service?.nom }}</p>
          <p><strong>Priorité:</strong> <span class="badge bg-secondary">{{ requete.priorite }}</span></p>
          <p><strong>Description:</strong> {{ requete.description }}</p>
          <p><strong>Date:</strong> {{ requete.created_at | date: 'dd/MM/yyyy HH:mm' }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 900px; }
  `]
})
export class ResponsableRequeteDetailsComponent implements OnInit {
  private responsableService = inject(ResponsableService);
  private route = inject(ActivatedRoute);

  requete: any = null;
  isLoading = true;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.responsableService.getRequete(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.requete = response.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
