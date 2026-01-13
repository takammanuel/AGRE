import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ResponsableService } from '../../services/responsable.service';

@Component({
  selector: 'app-responsable-requetes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-4">
      <h2><i class="bi bi-list-ul"></i> Toutes les Requêtes</h2>
      
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let requete of requetes">
              <td>{{ requete.code_requete }}</td>
              <td>{{ requete.etudiant?.nom }} {{ requete.etudiant?.prenom }}</td>
              <td>{{ requete.type_requete?.nom }}</td>
              <td><span [class]="getStatutClass(requete.statut_actuel)">{{ requete.statut_actuel }}</span></td>
              <td>{{ requete.created_at | date: 'dd/MM/yyyy' }}</td>
              <td>
                <a [routerLink]="['/responsable/requetes', requete.id]" class="btn btn-sm btn-primary">
                  <i class="bi bi-eye"></i>
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
    h2 i { color: var(--responsable-color, #6f42c1); margin-right: 0.5rem; }
  `]
})
export class ResponsableRequetesComponent implements OnInit {
  private responsableService = inject(ResponsableService);
  
  requetes: any[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.responsableService.getRequetes().subscribe({
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

  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'EN_ATTENTE': 'badge bg-warning',
      'EN_COURS': 'badge bg-info',
      'TRAITEE': 'badge bg-success',
      'REJETEE': 'badge bg-danger'
    };
    return classes[statut] || 'badge bg-secondary';
  }
}
