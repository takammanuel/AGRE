import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-statistiques',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistiques.component.html',
  styleUrls: ['./statistiques.component.scss']
})
export class AdminStatistiquesComponent implements OnInit {
  private adminService = inject(AdminService);
  
  stats: any = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadStatistiques();
  }

  loadStatistiques(): void {
    this.loading = true;
    this.error = null;
    
    this.adminService.getDashboard().subscribe({
      next: (response) => {
        this.stats = response.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.error = 'Impossible de charger les statistiques';
        this.loading = false;
      }
    });
  }

  getTauxTraitement(): number {
    if (!this.stats?.requetes) return 0;
    const total = this.stats.requetes.total;
    if (total === 0) return 0;
    return Math.round((this.stats.requetes.traitees / total) * 100);
  }

  getTauxRejet(): number {
    if (!this.stats?.requetes) return 0;
    const total = this.stats.requetes.total;
    if (total === 0) return 0;
    return Math.round((this.stats.requetes.rejetees / total) * 100);
  }

  getDelaiMoyen(): string {
    // Simulation - à calculer depuis le backend
    return '3.5 jours';
  }
}
