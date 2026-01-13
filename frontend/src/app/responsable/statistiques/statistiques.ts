import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResponsableService } from '../../services/responsable.service';

@Component({
  selector: 'app-responsable-statistiques',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-4">
      <h2><i class="bi bi-graph-up"></i> Statistiques</h2>
      
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border" role="status"></div>
      </div>

      <div *ngIf="!isLoading && stats" class="row">
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h3>{{ stats.total_requetes }}</h3>
              <p>Total Requêtes</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h3>{{ stats.par_statut?.en_attente }}</h3>
              <p>En Attente</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h3>{{ stats.par_statut?.en_cours }}</h3>
              <p>En Cours</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h3>{{ stats.par_statut?.traitees }}</h3>
              <p>Traitées</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; }
    h2 i { color: var(--responsable-color, #6f42c1); margin-right: 0.5rem; }
    .card { margin-bottom: 1rem; }
  `]
})
export class ResponsableStatistiquesComponent implements OnInit {
  private responsableService = inject(ResponsableService);
  
  stats: any = null;
  isLoading = true;

  ngOnInit(): void {
    this.responsableService.getStatistiques().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
