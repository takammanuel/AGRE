import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ResponsableService } from '../../../services/responsable.service';

@Component({
  selector: 'app-responsable-historique',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-4">
      <h2><i class="bi bi-clock-history"></i> Historique</h2>

      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border" role="status"></div>
      </div>

      <div *ngIf="!isLoading" class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Code</th>
              <th>Étudiant</th>
              <th>Type</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let requete of requetes">
              <td>{{ requete.code_requete }}</td>
              <td>{{ requete.etudiant?.nom }}</td>
              <td>{{ requete.type_requete?.nom }}</td>
              <td><span class="badge bg-secondary">{{ requete.statut_actuel }}</span></td>
              <td>{{ requete.created_at | date: 'dd/MM/yyyy' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; }
    h2 i { color: var(--responsable-color, #6f42c1); margin-right: 0.5rem; }
  `]
})
export class ResponsableHistoriqueComponent implements OnInit {
  private responsableService = inject(ResponsableService);

  requetes: any[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.responsableService.getHistorique().subscribe({
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
