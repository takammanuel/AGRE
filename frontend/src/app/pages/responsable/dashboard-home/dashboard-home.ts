import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ResponsableService } from '../../../services/responsable.service';

const API_URL = 'http://localhost:8000/api';

@Component({
  selector: 'app-responsable-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css',
})
export class ResponsableDashboardHomeComponent implements OnInit {
  private http = inject(HttpClient);
  private responsableService = inject(ResponsableService);

  stats: any = {
    total: 0,
    en_attente: 0,
    en_cours: 0,
    traitees: 0
  };

  isLoading = true;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.responsableService.getDashboard().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement dashboard:', error);
        this.isLoading = false;
      }
    });
  }
}
