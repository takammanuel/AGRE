import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SearchBar } from '../../pages/shared/search-bar/search-bar';

@Component({
  selector: 'app-responsable-recherche',
  standalone: true,
  imports: [CommonModule, RouterLink, SearchBar],
  templateUrl: './recherche.html',
  styleUrl: './recherche.css',
})
export class ResponsableRechercheComponent {
  requetes: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  hasSearched: boolean = false;

  onSearchResults(results: any): void {
    this.hasSearched = true;
    this.errorMessage = '';
    
    if (results === null) {
      this.requetes = [];
      this.hasSearched = false;
      return;
    }

    if (results.data && Array.isArray(results.data)) {
      this.requetes = results.data;
    } else {
      this.requetes = [];
      this.errorMessage = 'Aucun résultat trouvé';
    }
  }

  onSearchError(error: string): void {
    this.errorMessage = error;
    this.requetes = [];
    this.hasSearched = true;
  }

  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'EN_ATTENTE': 'badge bg-warning text-dark',
      'EN_COURS': 'badge bg-info text-white',
      'TRAITEE': 'badge bg-success',
      'REJETEE': 'badge bg-danger'
    };
    return classes[statut] || 'badge bg-secondary';
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'TRAITEE': 'Traitée',
      'REJETEE': 'Rejetée'
    };
    return labels[statut] || statut;
  }

  getPrioriteClass(priorite: string): string {
    return priorite === 'URGENTE' ? 'badge bg-danger' : 'badge bg-secondary';
  }
}
