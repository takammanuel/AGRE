import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ResponsableService } from '../../../services/responsable.service';

@Component({
  selector: 'app-responsable-requetes-escaladees',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-4">
      <h2><i class="bi bi-exclamation-triangle"></i> Requêtes Escaladées</h2>
      <p class="text-muted">Requêtes urgentes ou en attente depuis plus de 7 jours</p>

      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border" role="status"></div>
      </div>

      <div *ngIf="!isLoading && requetes.length === 0" class="alert alert-success">
        Aucune requête escaladée
      </div>

      <div *ngIf="!isLoading && requetes.length > 0" class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Code</th>
              <th>Étudiant</th>
              <th>Type</th>
              <th>Priorité</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let requete of requetes">
              <td>{{ requete.code_requete }}</td>
              <td>{{ requete.etudiant?.nom }} {{ requete.etudiant?.prenom }}</td>
              <td>{{ requete.type_requete?.nom }}</td>
              <td><span class="badge bg-danger">{{ requete.priorite }}</span></td>
              <td>{{ requete.created_at | date: 'dd/MM/yyyy' }}</td>
              <td>
                <a [routerLink]="['/responsable/requetes', requete.id]" class="btn btn-sm btn-primary">
                  <i class="bi bi-eye"></i> Voir
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; }
    h2 i { color: #dc3545; margin-right: 0.5rem; }
  `]
})
export class ResponsableRequetesEscaladeesComponent implements OnInit {
  private responsableService = inject(ResponsableService);

  requetes: any[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.responsableService.getRequetesEscaladees().subscribe({
      next: (response) => {
        if (response.success) {
          this.requetes = response.data.data || [];
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
