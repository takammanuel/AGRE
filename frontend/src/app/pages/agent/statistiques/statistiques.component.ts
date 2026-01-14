import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardAgentService } from '../../../services/dashboard-agent.service';

@Component({
  selector: 'app-agent-statistiques',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistiques.component.html',
  styleUrls: ['./statistiques.component.scss']
})
export class AgentStatistiquesComponent implements OnInit {
  private dashboardService = inject(DashboardAgentService);
  
  stats: any = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadStatistiques();
  }

  loadStatistiques(): void {
    this.loading = true;
    this.error = null;
    
    this.dashboardService.getStatistiques().subscribe({
      next: (response) => {
        this.stats = response.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques:', err);
        this.error = 'Impossible de charger les statistiques';
        this.loading = false;
      }
    });
  }

  getStatusColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'EN_ATTENTE': '#f57c00',
      'EN_COURS': '#1976d2',
      'TRAITEE': '#388e3c',
      'REJETEE': '#d32f2f'
    };
    return colors[statut] || '#757575';
  }

  getStatusLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'TRAITEE': 'Traitées',
      'REJETEE': 'Rejetées'
    };
    return labels[statut] || statut;
  }

  getPriorityLabel(priorite: string): string {
    return priorite === 'URGENTE' ? 'Urgentes' : 'Standard';
  }

  getPercentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }
}
