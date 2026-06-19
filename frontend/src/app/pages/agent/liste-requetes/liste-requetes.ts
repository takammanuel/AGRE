import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardAgentService } from '../../../services/dashboard-agent.service';

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
                <td><strong>{{ req.titre || req.description?.substring(0, 50) }}</strong></td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-warning text-dark': req.statut === 'En attente' || req.statut_actuel === 'EN_ATTENTE' || req.statut_actuel === 'AFFECTEE',
                    'bg-info': req.statut === 'En cours' || req.statut_actuel === 'EN_COURS',
                    'bg-success': req.statut === 'Terminée' || req.statut_actuel === 'TRAITEE',
                    'bg-danger': req.statut === 'Rejetée' || req.statut_actuel === 'REJETEE',
                    'bg-purple': req.statut_actuel === 'EN_ATTENTE_APPROBATION'
                  }">{{ getStatutLabel(req) }}</span>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <a [routerLink]="['/agent/messagerie', req.id]" class="btn btn-outline-primary">
                      <i class="bi bi-chat-dots"></i> Répondre
                    </a>
                    
                    <!-- Prendre en charge (si en attente) -->
                    <button *ngIf="canPrendreEnCharge(req)"
                            (click)="prendreEnCharge(req.id)"
                            class="btn btn-info text-white">
                      <i class="bi bi-hand-index"></i> Prendre en charge
                    </button>
                    
                    <!-- Traiter (si en cours) -->
                    <button *ngIf="canTraiter(req)"
                            (click)="traiter(req.id)"
                            class="btn btn-success">
                      <i class="bi bi-check-lg"></i> Traiter
                    </button>
                    
                    <!-- Escalader (si pas terminée/rejetée/escaladée) -->
                    <button *ngIf="canEscalader(req)"
                            (click)="escalader(req.id)"
                            class="btn btn-warning text-dark">
                      <i class="bi bi-arrow-up-circle"></i> Escalader
                    </button>
                    
                    <!-- Rejeter -->
                    <button *ngIf="canRejeter(req)"
                            (click)="rejeter(req.id)"
                            class="btn btn-danger">
                      <i class="bi bi-x-lg"></i> Rejeter
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-purple { background-color: #6f42c1; color: white; }
    .btn-group-sm .btn { font-size: 0.8rem; padding: 0.25rem 0.5rem; }
  `]
})
export class ListeRequetesAgentComponent implements OnInit {
  private agentService = inject(DashboardAgentService);
  public toutesLesRequetes: any[] = [];

  ngOnInit(): void {
    this.chargerToutesLesRequetes();
  }

  chargerToutesLesRequetes(): void {
    this.agentService.getRequetes().subscribe({
      next: (res: any) => {
        this.toutesLesRequetes = res.data?.data || res.data || [];
      },
      error: (err: any) => console.error(err)
    });
  }

  getStatutLabel(req: any): string {
    const statut = req.statut_actuel || req.statut;
    const labels: {[key: string]: string} = {
      'EN_ATTENTE': 'En attente',
      'AFFECTEE': 'Affectée',
      'EN_COURS': 'En cours',
      'TRAITEE': 'Traitée',
      'REJETEE': 'Rejetée',
      'EN_ATTENTE_APPROBATION': 'En attente approbation'
    };
    return labels[statut] || statut || 'En attente';
  }

  canPrendreEnCharge(req: any): boolean {
    const statut = req.statut_actuel || req.statut;
    return statut === 'EN_ATTENTE' || statut === 'AFFECTEE' || statut === 'En attente';
  }

  canTraiter(req: any): boolean {
    const statut = req.statut_actuel || req.statut;
    return statut === 'EN_COURS' || statut === 'En cours';
  }

  canEscalader(req: any): boolean {
    const statut = req.statut_actuel || req.statut;
    return !['TRAITEE', 'REJETEE', 'EN_ATTENTE_APPROBATION', 'Terminée', 'Rejetée'].includes(statut);
  }

  canRejeter(req: any): boolean {
    const statut = req.statut_actuel || req.statut;
    return !['TRAITEE', 'REJETEE', 'Terminée', 'Rejetée'].includes(statut);
  }

  prendreEnCharge(id: number): void {
    if (confirm('Voulez-vous prendre en charge cette requête ?')) {
      this.agentService.prendreEnCharge(id).subscribe({
        next: () => {
          alert('Requête prise en charge avec succès');
          this.chargerToutesLesRequetes();
        },
        error: (err) => alert('Erreur: ' + (err.error?.message || 'Erreur inconnue'))
      });
    }
  }

  traiter(id: number): void {
    const commentaire = prompt('Commentaire (optionnel):');
    if (confirm('Voulez-vous marquer cette requête comme traitée ?')) {
      this.agentService.traiterRequete(id, { commentaire: commentaire || '' }).subscribe({
        next: () => {
          alert('Requête traitée avec succès');
          this.chargerToutesLesRequetes();
        },
        error: (err) => alert('Erreur: ' + (err.error?.message || 'Erreur inconnue'))
      });
    }
  }

  escalader(id: number): void {
    const commentaire = prompt('Motif de l\'escalade (optionnel):');
    if (confirm('Voulez-vous escalader cette requête au responsable pédagogique ?')) {
      this.agentService.escaladerRequete(id, commentaire || '').subscribe({
        next: () => {
          alert('Requête escaladée au responsable pédagogique');
          this.chargerToutesLesRequetes();
        },
        error: (err) => alert('Erreur: ' + (err.error?.message || 'Erreur inconnue'))
      });
    }
  }

  rejeter(id: number): void {
    const motif = prompt('Motif du rejet (obligatoire):');
    if (motif && motif.trim()) {
      if (confirm('Voulez-vous rejeter cette requête ?')) {
        this.agentService.rejeterRequete(id, motif).subscribe({
          next: () => {
            alert('Requête rejetée');
            this.chargerToutesLesRequetes();
          },
          error: (err) => alert('Erreur: ' + (err.error?.message || 'Erreur inconnue'))
        });
      }
    } else {
      alert('Le motif est obligatoire pour rejeter une requête');
    }
  }
}
