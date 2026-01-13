import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DashboardAgentService } from '../../../services/dashboard-agent.service';
import { FileService } from '../../../services/file.service';

@Component({
  selector: 'app-requete-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './requete-details.component.html',
  styleUrls: ['./requete-details.component.scss']
})
export class RequeteDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dashboardService = inject(DashboardAgentService);
   private fileService = inject(FileService);

  requete: any = null;
  loading = true;
  error: string | null = null;
  success: string | null = null;

  // Modals
  showTraiterModal = false;
  showRejeterModal = false;
  showCommentaireModal = false;

  // Formulaires
  traiterForm = {
    commentaire: '',
    pieces_jointes: [] as File[]
  };

  rejeterForm = {
    motif: ''
  };

  commentaireForm = {
    commentaire: ''
  };

  processing = false;

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadRequeteDetails(id);
  }

  loadRequeteDetails(id: number): void {
    this.loading = true;
    this.error = null;

    this.dashboardService.getRequeteDetails(id).subscribe({
      next: (response) => {
        this.requete = response.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement:', err);
        this.error = 'Impossible de charger les détails de la requête';
        this.loading = false;
      }
    });
  }

  prendreEnCharge(): void {
    if (!confirm('Voulez-vous prendre en charge cette requête ?')) return;

    this.processing = true;
    this.error = null;

    this.dashboardService.prendreEnCharge(this.requete.id).subscribe({
      next: (response) => {
        this.success = response.message;
        this.processing = false;
        this.loadRequeteDetails(this.requete.id);

        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.error = err.error?.message || 'Erreur lors de la prise en charge';
        this.processing = false;
      }
    });
  }

  openTraiterModal(): void {
    this.showTraiterModal = true;
    this.traiterForm = { commentaire: '', pieces_jointes: [] };
  }

  closeTraiterModal(): void {
    this.showTraiterModal = false;
  }

  onFileSelect(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.traiterForm.pieces_jointes = files;
  }

  traiter(): void {
    this.processing = true;
    this.error = null;

    console.log('Traitement de la requête avec:', this.traiterForm);

    this.dashboardService.traiterRequete(this.requete.id, this.traiterForm).subscribe({
      next: (response) => {
        console.log('Réponse du serveur:', response);
        this.success = response.message;
        this.processing = false;
        this.closeTraiterModal();
        this.loadRequeteDetails(this.requete.id);

        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        console.error('Erreur complète:', err);
        this.error = err.error?.message || err.error?.error || 'Erreur lors du traitement';
        this.processing = false;
      }
    });
  }

  openRejeterModal(): void {
    this.showRejeterModal = true;
    this.rejeterForm = { motif: '' };
  }

  closeRejeterModal(): void {
    this.showRejeterModal = false;
  }

  rejeter(): void {
    if (!this.rejeterForm.motif.trim()) {
      this.error = 'Le motif est obligatoire';
      return;
    }

    this.processing = true;
    this.error = null;

    this.dashboardService.rejeterRequete(this.requete.id, this.rejeterForm.motif).subscribe({
      next: (response) => {
        this.success = response.message;
        this.processing = false;
        this.closeRejeterModal();
        this.loadRequeteDetails(this.requete.id);

        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.error = err.error?.message || 'Erreur lors du rejet';
        this.processing = false;
      }
    });
  }

  openCommentaireModal(): void {
    this.showCommentaireModal = true;
    this.commentaireForm = { commentaire: '' };
  }

  closeCommentaireModal(): void {
    this.showCommentaireModal = false;
  }

  ajouterCommentaire(): void {
    if (!this.commentaireForm.commentaire.trim()) {
      this.error = 'Le commentaire est obligatoire';
      return;
    }

    this.processing = true;
    this.error = null;

    this.dashboardService.ajouterCommentaire(this.requete.id, this.commentaireForm.commentaire).subscribe({
      next: (response) => {
        this.success = response.message;
        this.processing = false;
        this.closeCommentaireModal();
        this.loadRequeteDetails(this.requete.id);

        setTimeout(() => this.success = null, 3000);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.error = err.error?.message || 'Erreur lors de l\'ajout du commentaire';
        this.processing = false;
      }
    });
  }

  getStatusClass(statut: string): string {
    const statusMap: { [key: string]: string } = {
      'EN_ATTENTE': 'status-pending',
      'EN_COURS': 'status-progress',
      'TRAITEE': 'status-completed',
      'REJETEE': 'status-rejected'
    };
    return statusMap[statut] || 'status-default';
  }

  getStatusLabel(statut: string): string {
    const labelMap: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'TRAITEE': 'Traitée',
      'REJETEE': 'Rejetée'
    };
    return labelMap[statut] || statut;
  }

  canPrendreEnCharge(): boolean {
    return this.requete?.statut_actuel === 'EN_ATTENTE' || this.requete?.statut_actuel === 'AFFECTEE';;
  }

  canTraiter(): boolean {
    return this.requete?.statut_actuel === 'EN_COURS' || this.requete?.statut_actuel === 'EN_ATTENTE' || this.requete?.statut_actuel === 'AFFECTEE';
  }

  canRejeter(): boolean {
    return this.requete?.statut_actuel !== 'TRAITEE' && this.requete?.statut_actuel !== 'REJETEE';
  }

  downloadFile(attachment: any): void {
    this.fileService.downloadAttachment(attachment.id).subscribe({
      next: (blob) => {
        this.fileService.downloadFile(blob, attachment.chemin_fichier);
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement', error);
      }
    });
  }
}
