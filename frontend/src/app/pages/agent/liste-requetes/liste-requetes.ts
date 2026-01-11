import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RequeteService } from '../../../services/requete.service';

@Component({
  selector: 'app-liste-requetes-agent',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-primary fw-bold">Gestion des Requêtes (Espace Agent)</h2>
        <span class="badge bg-secondary">{{ toutesLesRequetes.length }} requête(s) au total</span>
      </div>

      <div class="card shadow-sm border-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Date</th>
                <th>Étudiant</th>
                <th>Objet</th>
                <th>Statut</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let req of toutesLesRequetes">
                <td>{{ req.created_at | date:'dd/MM/yyyy' }}</td>
                <td>
                   <i class="bi bi-person-circle me-1"></i>
                   {{ req.etudiant?.nom || 'Utilisateur ' + req.etudiant_id }}
                </td>
                <td><strong>{{ req.titre }}</strong></td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-warning text-dark': req.statut === 'En attente',
                    'bg-info': req.statut === 'En cours',
                    'bg-success': req.statut === 'Terminée',
                    'bg-danger': req.statut === 'Rejetée'
                  }">{{ req.statut }}</span>
                </td>
                <td class="text-center">
                  <div class="btn-group">
                    <a [routerLink]="['/agent/messagerie', req.id]" class="btn btn-sm btn-outline-primary">
                      <i class="bi bi-chat-dots"></i> Répondre
                    </a>
                    <button *ngIf="req.statut !== 'Terminée'"
                            (click)="changerStatut(req.id, 'Terminée')"
                            class="btn btn-sm btn-success">
                      Valider
                    </button>
                    <button *ngIf="req.statut !== 'Rejetée' && req.statut !== 'Terminée'"
                            (click)="changerStatut(req.id, 'Rejetée')"
                            class="btn btn-sm btn-danger">
                      Rejeter
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ListeRequetesAgentComponent implements OnInit {
  private requeteService = inject(RequeteService);
  public toutesLesRequetes: any[] = [];

  ngOnInit(): void {
    this.chargerToutesLesRequetes();
  }

  chargerToutesLesRequetes(): void {
    this.requeteService.getAllRequetes().subscribe({
      next: (res: any) => this.toutesLesRequetes = res.data || [],
      error: (err: any) => console.error(err)
    });
  }

  // MÉTHODE CRUCIALE POUR DÉBLOQUER L'HISTORIQUE
  changerStatut(id: number, nouveauStatut: string): void {
    if(confirm(`Voulez-vous passer cette requête en statut : ${nouveauStatut} ?`)) {
      this.requeteService.updateStatut(id, nouveauStatut).subscribe({
        next: () => {
          this.chargerToutesLesRequetes(); // Rafraîchit la liste
        },
        error: (err: any) => alert("Erreur lors de la mise à jour")
      });
    }
  }
}
