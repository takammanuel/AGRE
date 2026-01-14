import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EtudiantService, EtudiantStats } from '../../../services/etudiant.service';

@Component({
  selector: 'app-etudiant-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class EtudiantDashboardHomeComponent implements OnInit {
  private etudiantService = inject(EtudiantService);
  
  stats: EtudiantStats | null = null;
  requetesRecentes: any[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;
    
    // Charger les statistiques
    this.etudiantService.getDashboardStats().subscribe({
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
    
    // Charger les requêtes récentes
    this.etudiantService.getRequetes().subscribe({
      next: (response) => {
        this.requetesRecentes = (response.data.data || []).slice(0, 5);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des requêtes:', err);
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
}
