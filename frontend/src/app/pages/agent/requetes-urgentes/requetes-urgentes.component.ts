import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardAgentService } from '../../../services/dashboard-agent.service';

@Component({
  selector: 'app-agent-requetes-urgentes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './requetes-urgentes.component.html',
  styleUrls: ['./requetes-urgentes.component.scss']
})
export class AgentRequetesUrgentesComponent implements OnInit {
  private dashboardService = inject(DashboardAgentService);
  
  requetes: any[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadRequetesUrgentes();
  }

  loadRequetesUrgentes(): void {
    this.loading = true;
    this.error = null;
    
    this.dashboardService.getRequetes('urgent').subscribe({
      next: (response) => {
        this.requetes = response.data.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des requêtes urgentes:', err);
        this.error = 'Impossible de charger les requêtes urgentes';
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

  getUrgencyLevel(createdAt: string): 'critical' | 'high' | 'medium' {
    const created = new Date(createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 48) return 'critical';
    if (hoursDiff > 24) return 'high';
    return 'medium';
  }

  getUrgencyLabel(level: string): string {
    const labels: { [key: string]: string } = {
      'critical': 'Critique - Plus de 48h',
      'high': 'Élevée - Plus de 24h',
      'medium': 'Moyenne - Moins de 24h'
    };
    return labels[level] || 'Urgente';
  }

  getTimeElapsed(createdAt: string): string {
    const created = new Date(createdAt);
    const now = new Date();
    const hoursDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (hoursDiff < 1) {
      const minutesDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
      return `Il y a ${minutesDiff} minute${minutesDiff > 1 ? 's' : ''}`;
    } else if (hoursDiff < 24) {
      return `Il y a ${hoursDiff} heure${hoursDiff > 1 ? 's' : ''}`;
    } else {
      const daysDiff = Math.floor(hoursDiff / 24);
      return `Il y a ${daysDiff} jour${daysDiff > 1 ? 's' : ''}`;
    }
  }

  traiterRequete(requeteId: number): void {
    // TODO: Implémenter la logique de traitement
    console.log('Traiter la requête:', requeteId);
  }

  escaladerRequete(requeteId: number): void {
    // TODO: Implémenter la logique d'escalade
    console.log('Escalader la requête:', requeteId);
  }
}
