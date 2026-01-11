import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DashboardAgentService } from '../../../services/dashboard-agent.service';

@Component({
  selector: 'app-agent-requetes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './requetes.component.html',
  styleUrls: ['./requetes.component.scss']
})
export class AgentRequetesComponent implements OnInit {
  private dashboardService = inject(DashboardAgentService);
  private route = inject(ActivatedRoute);
  
  requetes: any[] = [];
  loading = true;
  error: string | null = null;
  currentFilter: string = 'all';
  
  filters = [
    { value: 'all', label: 'Toutes', icon: 'bi-inbox' },
    { value: 'today', label: 'Aujourd\'hui', icon: 'bi-calendar-check' },
    { value: 'week', label: 'Cette semaine', icon: 'bi-calendar-week' },
    { value: 'urgent', label: 'Urgentes', icon: 'bi-exclamation-triangle' }
  ];

  ngOnInit(): void {
    // Récupérer le filtre depuis les query params
    this.route.queryParams.subscribe(params => {
      this.currentFilter = params['filter'] || 'all';
      this.loadRequetes();
    });
  }

  loadRequetes(): void {
    this.loading = true;
    this.error = null;
    
    const filter = this.currentFilter === 'all' ? undefined : this.currentFilter;
    
    this.dashboardService.getRequetes(filter).subscribe({
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

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.loadRequetes();
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
