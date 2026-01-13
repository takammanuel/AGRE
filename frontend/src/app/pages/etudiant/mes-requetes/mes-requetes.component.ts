import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EtudiantService } from '../../../services/etudiant.service';

@Component({
  selector: 'app-mes-requetes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './mes-requetes.component.html',
  styleUrls: ['./mes-requetes.component.scss']
})
export class MesRequetesComponent implements OnInit {
  private etudiantService = inject(EtudiantService);
  
  requetes: any[] = [];
  loading = true;
  error: string | null = null;
  
  // Filtres
  filtreStatut: string = 'TOUS';
  filtrePriorite: string = 'TOUS';

  ngOnInit(): void {
    this.loadRequetes();
  }

  loadRequetes(): void {
    this.loading = true;
    this.error = null;
    
    this.etudiantService.getRequetes().subscribe({
      next: (response) => {
        this.requetes = response.data.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des requêtes:', err);
        this.error = 'Impossible de charger les requêtes';
        this.loading = false;
      }
    });
  }

  get requetesFiltrees(): any[] {
    return this.requetes.filter(req => {
      const matchStatut = this.filtreStatut === 'TOUS' || req.statut_actuel === this.filtreStatut;
      const matchPriorite = this.filtrePriorite === 'TOUS' || req.priorite === this.filtrePriorite;
      return matchStatut && matchPriorite;
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

  getPriorityClass(priorite: string): string {
    return priorite === 'URGENTE' ? 'priority-urgent' : 'priority-standard';
  }

  getPriorityLabel(priorite: string): string {
    return priorite === 'URGENTE' ? 'Urgente' : 'Standard';
  }
}
