import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

const API_URL = 'http://localhost:8000/api';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.scss']
})
export class UtilisateursComponent implements OnInit {
  private http = inject(HttpClient);
  
  utilisateurs: any[] = [];
  loading = true;
  error: string | null = null;
  
  // Filtres
  filtreRole: string = 'TOUS';
  filtreStatut: string = 'TOUS';
  searchTerm: string = '';

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.loading = true;
    this.error = null;
    
    this.http.get<any>(`${API_URL}/admin/utilisateurs`).subscribe({
      next: (response) => {
        this.utilisateurs = response.data.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.error = 'Impossible de charger les utilisateurs';
        this.loading = false;
      }
    });
  }

  get utilisateursFiltres(): any[] {
    return this.utilisateurs.filter(user => {
      const matchRole = this.filtreRole === 'TOUS' || user.roles?.some((r: any) => r.nom === this.filtreRole);
      const matchStatut = this.filtreStatut === 'TOUS' || 
        (this.filtreStatut === 'ACTIF' && user.is_active) ||
        (this.filtreStatut === 'INACTIF' && !user.is_active);
      const matchSearch = !this.searchTerm || 
        user.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.prenom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchRole && matchStatut && matchSearch;
    });
  }

  toggleActivation(user: any): void {
    const action = user.is_active ? 'désactiver' : 'activer';
    if (confirm(`Voulez-vous ${action} l'utilisateur ${user.nom} ${user.prenom} ?`)) {
      this.http.put(`${API_URL}/admin/utilisateurs/${user.id}/activate`, {}).subscribe({
        next: () => {
          user.is_active = !user.is_active;
        },
        error: (err) => {
          console.error('Erreur:', err);
          alert('Erreur lors de la modification');
        }
      });
    }
  }

  resetPassword(user: any): void {
    if (confirm(`Voulez-vous réinitialiser le mot de passe de ${user.nom} ${user.prenom} ?`)) {
      this.http.put(`${API_URL}/admin/utilisateurs/${user.id}/reset-password`, {}).subscribe({
        next: (response: any) => {
          alert(`Mot de passe réinitialisé. Nouveau mot de passe: ${response.new_password}`);
        },
        error: (err) => {
          console.error('Erreur:', err);
          alert('Erreur lors de la réinitialisation');
        }
      });
    }
  }

  getRoleBadgeClass(role: string): string {
    const roleMap: { [key: string]: string } = {
      'ADMINISTRATEUR': 'badge-admin',
      'AGENT_ACADEMIQUE': 'badge-agent',
      'RESPONSABLE_PEDAGOGIQUE': 'badge-responsable',
      'ETUDIANT': 'badge-etudiant'
    };
    return roleMap[role] || 'badge-default';
  }

  getRoleLabel(role: string): string {
    const labelMap: { [key: string]: string } = {
      'ADMINISTRATEUR': 'Admin',
      'AGENT_ACADEMIQUE': 'Agent',
      'RESPONSABLE_PEDAGOGIQUE': 'Responsable',
      'ETUDIANT': 'Étudiant'
    };
    return labelMap[role] || role;
  }
}
