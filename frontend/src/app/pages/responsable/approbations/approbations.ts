import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ResponsableService } from '../../../services/responsable.service';
import { ToastService } from '../../../services/toast.service';
import { ToastComponent } from '../../../components/toast/toast.component';

@Component({
  selector: 'app-responsable-approbations',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent],
  templateUrl: './approbations.html',
  styleUrls: ['./approbations.scss']
})
export class ResponsableApprobationsComponent implements OnInit {
  private responsableService = inject(ResponsableService);
  private toastService = inject(ToastService);

  requetes: any[] = [];
  isLoading = true;
  error: string | null = null;
  
  // Modal de rejet
  showRejectModal = false;
  selectedRequete: any = null;
  motifRejet = '';
  submitting = false;

  ngOnInit(): void {
    this.loadApprobations();
  }

  loadApprobations(): void {
    this.isLoading = true;
    this.error = null;
    
    console.log('=== CHARGEMENT APPROBATIONS RESPONSABLE ===');
    
    this.responsableService.getApprobations().subscribe({
      next: (response) => {
        console.log('Réponse API:', response);
        
        // Gérer la pagination Laravel
        if (response.data && response.data.data) {
          this.requetes = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          this.requetes = response.data;
        } else {
          this.requetes = [];
        }
        
        console.log('Approbations chargées:', this.requetes.length);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.error = 'Impossible de charger les approbations';
        this.isLoading = false;
      }
    });
  }

  approuver(requete: any): void {
    if (confirm(`Voulez-vous approuver la requête ${requete.code_requete} ?`)) {
      this.responsableService.approuverRequete(requete.id).subscribe({
        next: (response) => {
          this.toastService.success(
            `Requête ${requete.code_requete} approuvée avec succès !`
          );
          this.loadApprobations();
        },
        error: (err) => {
          console.error('Erreur:', err);
          const message = err.error?.message || 'Erreur lors de l\'approbation';
          this.toastService.error(message);
        }
      });
    }
  }

  openRejectModal(requete: any): void {
    this.selectedRequete = requete;
    this.motifRejet = '';
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedRequete = null;
    this.motifRejet = '';
  }

  rejeter(): void {
    if (!this.motifRejet.trim()) {
      this.toastService.warning('Veuillez saisir un motif de rejet');
      return;
    }

    this.submitting = true;
    
    this.responsableService.rejeterRequete(this.selectedRequete.id, this.motifRejet).subscribe({
      next: (response) => {
        this.toastService.success(
          `Requête ${this.selectedRequete.code_requete} rejetée avec succès`
        );
        this.submitting = false;
        this.closeRejectModal();
        this.loadApprobations();
      },
      error: (err) => {
        console.error('Erreur:', err);
        const message = err.error?.message || 'Erreur lors du rejet';
        this.toastService.error(message);
        this.submitting = false;
      }
    });
  }
}
