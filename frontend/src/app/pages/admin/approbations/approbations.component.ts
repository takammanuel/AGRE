import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-approbations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './approbations.component.html',
  styleUrls: ['./approbations.component.scss']
})
export class ApprobationsComponent implements OnInit {
  private adminService = inject(AdminService);
  
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
    
    this.adminService.getApprobations().subscribe({
      next: (response) => {
        this.approbations = response.data.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.error = 'Impossible de charger les approbations';
        this.loading = false;
      }
    });
  }

  approuver(requete: any): void {
    if (confirm(`Voulez-vous approuver la requête ${requete.code_requete} ?`)) {
      this.adminService.approuverRequete(requete.id).subscribe({
        next: () => {
          this.loadApprobations();
        },
        error: (err) => {
          console.error('Erreur:', err);
          alert('Erreur lors de l\'approbation');
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
      alert('Veuillez saisir un motif de rejet');
      return;
    }

    this.submitting = true;
    
    this.adminService.rejeterRequete(this.selectedRequete.id, this.motifRejet).subscribe({
      next: () => {
        this.submitting = false;
        this.closeRejectModal();
        this.loadApprobations();
      },
      error: (err) => {
        console.error('Erreur:', err);
        alert('Erreur lors du rejet');
        this.submitting = false;
      }
    });
  }
}
