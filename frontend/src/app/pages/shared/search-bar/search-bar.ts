import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../../services/search.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
  private searchService = inject(SearchService);
  
  @Output() searchResults = new EventEmitter<any>();
  @Output() searchError = new EventEmitter<string>();
  
  searchTerm: string = '';
  isSearching: boolean = false;
  placeholder: string = 'Rechercher par code, matricule ou nom...';

  /**
   * Effectuer la recherche
   */
  onSearch(): void {
    if (!this.searchTerm || this.searchTerm.trim().length < 2) {
      this.searchError.emit('Veuillez entrer au moins 2 caractères');
      return;
    }

    this.isSearching = true;

    this.searchService.searchRequetes(this.searchTerm.trim()).subscribe({
      next: (response) => {
        this.isSearching = false;
        if (response.success) {
          this.searchResults.emit(response.data);
        } else {
          this.searchError.emit('Aucun résultat trouvé');
        }
      },
      error: (error) => {
        this.isSearching = false;
        this.searchError.emit('Erreur lors de la recherche');
        console.error('Erreur de recherche:', error);
      }
    });
  }

  /**
   * Réinitialiser la recherche
   */
  onClear(): void {
    this.searchTerm = '';
    this.searchResults.emit(null);
  }

  /**
   * Recherche lors de la saisie (avec debounce)
   */
  onKeyup(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }
}
