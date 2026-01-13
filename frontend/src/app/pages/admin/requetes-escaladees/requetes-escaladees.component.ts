import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-requetes-escaladees',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './requetes-escaladees.component.html',
  styleUrls: ['./requetes-escaladees.component.scss']
})
export class RequetesEscaladeesComponent implements OnInit {
  private adminService = inject(AdminService);
  
  requetes: any[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadRequetesEscaladees();
  }

  loadRequetesEscaladees(): void {
    this.loading = true;
    this.error = null;
    
    this.adminService.getRequetesEscaladees().subscribe({
      next: (response) => {
        this.requetes = response.data.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.error = 'Impossible de charger les requêtes escaladées';
        this.loading = false;
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

  getDelaiEnJours(dateCreation: string): number {
    const created = new Date(dateCreation);
    const now = new Date();
    const diff = now.getTime() - created.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  getDelaiClass(jours: number): string {
    if (jours >= 14) return 'delai-critique';
    if (jours >= 7) return 'delai-warning';
    return 'delai-normal';
  }

  assignerAgent(requete: any): void {
    // À implémenter: modal pour assigner un agent
    alert('Fonctionnalité d\'assignation à venir');
  }

  escaladerVersResponsable(requete: any): void {
    if (confirm(`Voulez-vous escalader la requête ${requete.code_requete} vers un responsable ?`)) {
      // À implémenter
      alert('Requête escaladée avec succès');
    }
  }
}
