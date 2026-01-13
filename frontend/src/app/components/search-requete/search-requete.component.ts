import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardAgentService } from '../../services/dashboard-agent.service';

@Component({
  selector: 'app-search-requete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-requete.component.html',
  styleUrls: ['./search-requete.component.scss']
})
export class SearchRequeteComponent {
  private dashboardService = inject(DashboardAgentService);
  
  searchTerm = '';
  searchResults: any[] = [];
  searching = false;
  showResults = false;

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.searchResults = [];
      this.showResults = false;
      return;
    }

    this.searching = true;
    this.showResults = true;

    this.dashboardService.getRequetes().subscribe({
      next: (response) => {
        const allRequetes = response.data.data || [];
        const term = this.searchTerm.toLowerCase();
        
        this.searchResults = allRequetes.filter((r: any) =>
          r.code_requete?.toLowerCase().includes(term) ||
          r.description?.toLowerCase().includes(term) ||
          r.etudiant?.nom?.toLowerCase().includes(term) ||
          r.etudiant?.prenom?.toLowerCase().includes(term) ||
          r.etudiant?.email?.toLowerCase().includes(term) ||
          r.type_requete?.nom?.toLowerCase().includes(term)
        );
        
        this.searching = false;
      },
      error: (err) => {
        console.error('Erreur lors de la recherche:', err);
        this.searching = false;
      }
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchResults = [];
    this.showResults = false;
  }

  closeResults(): void {
    setTimeout(() => {
      this.showResults = false;
    }, 200);
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
}
