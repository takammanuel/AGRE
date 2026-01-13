import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SearchBar } from '../../shared/search-bar/search-bar';

@Component({
  selector: 'app-recherche',
  standalone: true,
  imports: [CommonModule, RouterLink, SearchBar],
  templateUrl: './recherche.html',
  styleUrl: './recherche.css',
})
export class Recherche {
  requetes: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  hasSearched: boolean = false;

  /**
   * Gérer les résultats de recherche
   */
  onSearchResults(results: any): void {
    this.hasSearched = true;
    this.errorMessage = '';
    
    if (results === null) {
      // Réinitialisation
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

  /**
   * Gérer les erreurs de recherche
   */
  onSearchError(error: string): void {
    this.errorMessage = error;
    this.requetes = [];
    this.hasSearched = true;
  }

  /**
   * Obtenir la classe CSS pour le statut
   */
  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'EN_ATTENTE': 'badge bg-warning text-dark',
      'EN_COURS': 'badge bg-info text-white',
      'TRAITEE': 'badge bg-success',
      'REJETEE': 'badge bg-danger'
    };
    return classes[statut] || 'badge bg-secondary';
  }

  /**
   * Obtenir le libellé du statut
   */
  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'TRAITEE': 'Traitée',
      'REJETEE': 'Rejetée'
    };
    return labels[statut] || statut;
  }

  /**
   * Obtenir la classe CSS pour la priorité
   */
  getPrioriteClass(priorite: string): string {
    return priorite === 'URGENTE' ? 'badge bg-danger' : 'badge bg-secondary';
  }
}
