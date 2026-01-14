import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';
import { ToastComponent } from '../../../components/toast/toast.component';

@Component({
  selector: 'app-approbations',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent],
  templateUrl: './approbations.component.html',
  styleUrls: ['./approbations.component.scss']
})
export class ApprobationsComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);
  
  approbations: any[] = [];
  loading = true;
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
    this.loading = true;
    this.error = null;
    
    console.log('=== CHARGEMENT APPROBATIONS ===');
    
    this.adminService.getApprobations().subscribe({
      next: (response) => {
        console.log('Réponse API approbations:', response);
        console.log('response.data:', response.data);
        
        // Gérer la pagination Laravel
        if (response.data && response.data.data) {
          this.approbations = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          this.approbations = response.data;
        } else {
          this.approbations = [];
        }
        
        console.log('Approbations chargées:', this.approbations.length);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur complète:', err);
        this.error = 'Impossible de charger les approbations';
        this.loading = false;
      }
    });
  }

  approuver(requete: any): void {
    if (confirm(`Voulez-vous approuver la requête ${requete.code_requete} ?`)) {
      this.adminService.approuverRequete(requete.id).subscribe({
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
    
    this.adminService.rejeterRequete(this.selectedRequete.id, this.motifRejet).subscribe({
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
