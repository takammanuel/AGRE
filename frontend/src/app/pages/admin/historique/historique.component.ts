import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { HttpClient } from '@angular/common/http';

const API_URL = 'http://localhost:8000/api';

@Component({
  selector: 'app-admin-historique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.scss']
})
export class AdminHistoriqueComponent implements OnInit {
  private adminService = inject(AdminService);
  private http = inject(HttpClient);
  
  requetes: any[] = [];
  services: any[] = [];
  loading = true;
  error: string | null = null;
  
  // Filtres
  filters = {
    statut: '',
    service_id: '',
    date_debut: '',
    date_fin: ''
  };
  
  searching = false;

  ngOnInit(): void {
    this.loadServices();
    this.loadHistorique();
  }

  loadServices(): void {
    this.http.get<any>(`${API_URL}/admin/services`).subscribe({
      next: (response) => {
        this.services = response.data || [];
      },
      error: (err) => console.error('Erreur services:', err)
    });
  }

  loadHistorique(): void {
    this.loading = true;
    this.error = null;
    
    // Nettoyer les filtres vides
    const cleanFilters: any = {};
    Object.keys(this.filters).forEach(key => {
      const value = (this.filters as any)[key];
      if (value) {
        cleanFilters[key] = value;
      }
    });
    
    console.log('=== CHARGEMENT HISTORIQUE ===');
    console.log('Filtres:', cleanFilters);
    
    this.adminService.getHistorique(cleanFilters).subscribe({
      next: (response) => {
        console.log('Réponse API historique:', response);
        console.log('response.data:', response.data);
        
        // Le backend retourne une pagination Laravel
        if (response.data && response.data.data) {
          this.requetes = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          this.requetes = response.data;
        } else {
          this.requetes = [];
        }
        
        console.log('Requêtes chargées:', this.requetes.length);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur complète:', err);
        this.error = 'Impossible de charger l\'historique';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.searching = true;
    this.loadHistorique();
    // Désactiver le spinner après un court délai
    setTimeout(() => {
      this.searching = false;
    }, 500);
  }

  resetFilters(): void {
    this.filters = {
      statut: '',
      service_id: '',
      date_debut: '',
      date_fin: ''
    };
    this.searching = true;
    this.loadHistorique();
    setTimeout(() => {
      this.searching = false;
    }, 500);
  }

  exportToCSV(): void {
    // Préparer les données pour l'export
    const csvData = this.requetes.map(req => ({
      'Code': req.code_requete,
      'Étudiant': `${req.etudiant?.nom} ${req.etudiant?.prenom}`,
      'Type': req.type_requete?.nom,
      'Service': req.type_requete?.service?.nom,
      'Agent': req.agent ? `${req.agent.nom} ${req.agent.prenom}` : '-',
      'Statut': this.getStatusLabel(req.statut_actuel),
      'Priorité': req.priorite,
      'Date création': new Date(req.created_at).toLocaleDateString('fr-FR')
    }));

    // Convertir en CSV
    const headers = Object.keys(csvData[0]);
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${(row as any)[h]}"`).join(','))
    ].join('\n');

    // Télécharger
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historique_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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
