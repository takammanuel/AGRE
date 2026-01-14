import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestService, Requete } from '../../../services/request.service';
import { FileService } from '../../../services/file.service';
import { RequestStatusPipe } from '../../../pipes/request-status.pipe';
import { PriorityPipe } from '../../../pipes/priority.pipe';
import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';

@Component({
  selector: 'app-requete-detail',
  standalone: true,
  imports: [CommonModule, RequestStatusPipe, PriorityPipe, TimeAgoPipe],
  templateUrl: './requete-detail.html',
  styleUrls: ['./requete-detail.css']
})
export class RequeteDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private requestService = inject(RequestService);
  private fileService = inject(FileService);

  requete: Requete | null = null;
  loading = true;
  error = '';
  historique: any[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRequete(+id);
      // this.loadHistory(+id);
    }
  }

  loadRequete(id: number): void {
    this.requestService.getRequestById(id).subscribe({
      next: (response) => {
        console.log("sddddd: " + JSON.stringify(response.data, null, 2));
        this.requete = response.data;
        this.historique = response.data.historiques || [];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement de la requête';
        this.loading = false;
        console.error(error);
      }
    });
  }

  loadHistory(id: number): void {
    this.requestService.getRequestHistory(id).subscribe({
      next: (response) => {
        console.log('Historique reçu:', response);
        this.historique = response.data || [];
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'historique', error);
      }
    });
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

  cancelRequest(): void {
    if (!this.requete || !confirm('Êtes-vous sûr de vouloir annuler cette requête ?')) {
      return;
    }

    this.requestService.cancelRequest(this.requete.id).subscribe({
      next: () => {
        alert('Requête annulée avec succès');
        this.router.navigate(['/etudiant/mes-requetes']);
      },
      error: (error) => {
        alert(error.error?.message || 'Erreur lors de l\'annulation');
      }
    });
  }

  canCancel(): boolean {
    if (!this.requete || !this.requete.etat_actuel) return false;
    return ['EN_ATTENTE', 'AFFECTEE'].includes(this.requete.etat_actuel.libelle);
  }

  needsInfo(): boolean {
    if (!this.requete || !this.requete.etat_actuel) return false;
    return this.requete.etat_actuel.libelle === 'INFORMATIONS_REQUISES';
  }

  getStatusClass(statut: string ): string {
    const classes: { [key: string]: string } = {
      'EN_ATTENTE': 'badge bg-warning',
      'AFFECTEE': 'badge bg-info',
      'EN_COURS': 'badge bg-primary',
      'TRAITEE': 'badge bg-success',
      'REJETEE': 'badge bg-danger',
      'INFORMATIONS_REQUISES': 'badge bg-warning',
      'EN_ATTENTE_APPROBATION': 'badge bg-secondary'
    };
    return classes[statut] || 'badge bg-secondary';
  }

  navigateToRequests(): void {
    this.router.navigate(['/etudiant/mes-requetes']);
  }

  navigateToAddInfos(): void {
    if (this.requete) {
      this.router.navigate(['/etudiant/requete', this.requete.id, 'ajouter-informations']);
    }
  }

  getStatusLabel(statut: string): string {
    const labelMap: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'TRAITEE': 'Traitée',
      'REJETEE': 'Rejetée',
      'AFFECTEE': 'Affectée',
      'EN_ATTENTE_APPROBATION': 'En attentte d\'approbation',
    };
    return labelMap[statut] || statut;
  }
}
