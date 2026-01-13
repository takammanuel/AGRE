import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ResponsableService } from '../../services/responsable.service';

@Component({
  selector: 'app-responsable-approbations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-4">
      <h2><i class="bi bi-check-circle"></i> Approbations</h2>
      <p class="text-muted">Gérez les approbations de requêtes</p>
      
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border" role="status"></div>
      </div>

      <div *ngIf="!isLoading && requetes.length === 0" class="alert alert-info">
        Aucune requête en attente d'approbation
      </div>

      <div *ngIf="!isLoading && requetes.length > 0" class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Code</th>
              <th>Étudiant</th>
              <th>Type</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let requete of requetes">
              <td>{{ requete.code_requete }}</td>
              <td>{{ requete.etudiant?.nom }} {{ requete.etudiant?.prenom }}</td>
              <td>{{ requete.type_requete?.nom }}</td>
              <td>{{ requete.created_at | date: 'dd/MM/yyyy' }}</td>
              <td>
                <button (click)="approuver(requete.id)" class="btn btn-sm btn-success me-2">
                  <i class="bi bi-check"></i> Approuver
                </button>
                <button (click)="rejeter(requete.id)" class="btn btn-sm btn-danger">
                  <i class="bi bi-x"></i> Rejeter
                </button>
              </td>
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
export class ResponsableApprobationsComponent implements OnInit {
  private responsableService = inject(ResponsableService);
  
  requetes: any[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadApprobations();
  }

  loadApprobations(): void {
    this.responsableService.getApprobations().subscribe({
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

  approuver(id: number): void {
    if (confirm('Approuver cette requête?')) {
      this.responsableService.approuverRequete(id).subscribe({
        next: () => {
          alert('Requête approuvée');
          this.loadApprobations();
        }
      });
    }
  }

  rejeter(id: number): void {
    const motif = prompt('Motif du rejet:');
    if (motif) {
      this.responsableService.rejeterRequete(id, motif).subscribe({
        next: () => {
          alert('Requête rejetée');
          this.loadApprobations();
        }
      });
    }
  }
}
