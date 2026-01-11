import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DashboardAgentService } from '../../../services/dashboard-agent.service';

@Component({
  selector: 'app-agent-historique',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.scss']
})
export class AgentHistoriqueComponent implements OnInit {
  private dashboardService = inject(DashboardAgentService);
  
  requetes: any[] = [];
  filteredRequetes: any[] = [];
  loading = true;
  error: string | null = null;
  
  // Filtres
  searchTerm = '';
  selectedStatus = 'all';
  selectedPeriod = 'all';
  
  statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'TRAITEE', label: 'Traitées' },
    { value: 'REJETEE', label: 'Rejetées' },
    { value: 'EN_COURS', label: 'En cours' }
  ];
  
  periodOptions = [
    { value: 'all', label: 'Toute la période' },
    { value: 'today', label: 'Aujourd\'hui' },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' }
  ];

  ngOnInit(): void {
    this.loadHistorique();
  }

  loadHistorique(): void {
    this.loading = true;
    this.error = null;
    
    this.dashboardService.getRequetes().subscribe({
      next: (response) => {
        this.requetes = response.data.data || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'historique:', err);
        this.error = 'Impossible de charger l\'historique';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.requetes];
    
    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.code_requete?.toLowerCase().includes(term) ||
        r.etudiant?.nom?.toLowerCase().includes(term) ||
        r.etudiant?.prenom?.toLowerCase().includes(term) ||
        r.description?.toLowerCase().includes(term)
      );
    }
    
    // Filtre par statut
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(r => r.statut_actuel === this.selectedStatus);
    }
    
    // Filtre par période
    if (this.selectedPeriod !== 'all') {
      const now = new Date();
      filtered = filtered.filter(r => {
        const createdDate = new Date(r.created_at);
        
        switch (this.selectedPeriod) {
          case 'today':
            return createdDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return createdDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return createdDate >= monthAgo;
          default:
            return true;
        }
      });
    }
    
    this.filteredRequetes = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onPeriodChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
    this.selectedPeriod = 'all';
    this.applyFilters();
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

  getStatusIcon(statut: string): string {
    const iconMap: { [key: string]: string } = {
      'EN_ATTENTE': 'bi-clock',
      'EN_COURS': 'bi-arrow-repeat',
      'TRAITEE': 'bi-check-circle',
      'REJETEE': 'bi-x-circle'
    };
    return iconMap[statut] || 'bi-circle';
  }
}
