import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { RequestService, Requete } from '../../../services/request.service';
import { RequestStatusPipe } from '../../../pipes/request-status.pipe';
import { PriorityPipe } from '../../../pipes/priority.pipe';
import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';
import { RouterModule } from '@angular/router'; // 1. IMPORTATION NÉCESSAIRE
import { RequeteService } from '../../../services/requete.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-mes-requetes',
  standalone: true,
  imports: [CommonModule, FormsModule, RequestStatusPipe, PriorityPipe, TimeAgoPipe, RouterLink],
  templateUrl: './mes-requetes.html',
  styleUrls: ['./mes-requetes.css']
})
export class MesRequetesComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private requestService = inject(RequestService);

  requetes: Requete[] = [];
  loading = true;
  error = '';
  currentPage = 1;
  perPage = 15;
  pagination: any = {};

  // Filtres
  filters = {
    statut: '',
    type_requete_id: '',
    date_debut: '',
    date_fin: '',
    recherche: ''
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentPage = params['page'] ? +params['page'] : 1;
      this.loadRequetes();
    });
  }

  loadRequetes(): void {
    this.loading = true;
    const params = {
      ...this.filters,
      page: this.currentPage,
      per_page: this.perPage
    };

    this.requestService.getMyRequests(params).subscribe({
      next: (response) => {
        console.log('Réponses reçues:', response);
        this.requetes = response.data?.data || [];
        this.pagination = response.data || {};
        this.currentPage = response.data?.current_page || 1;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des requêtes';
        this.loading = false;
        console.error(error);
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadRequetes();
  }

  clearFilters(): void {
    this.filters = {
      statut: '',
      type_requete_id: '',
      date_debut: '',
      date_fin: '',
      recherche: ''
    };
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.pagination.last_page) return;
    this.currentPage = page;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge'
    });
  }

  viewDetails(id: number): void {
    this.router.navigate(['/etudiant/requete', id]);
  }

  getStatusClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'EN_ATTENTE': 'badge bg-warning',
      'AFFECTEE': 'badge bg-info',
      'EN_COURS': 'badge bg-primary',
      'TRAITEE': 'badge bg-success',
      'REJETEE': 'badge bg-danger',
      'INFORMATIONS_REQUISES': 'badge bg-warning',
      'EN_ATTENTE_APPROBATION': 'badge bg-secondary'
    };
    return classes[statut] || 'badge bg-secondary';
  }

  navigateToCreateRequest(): void {
    this.router.navigate(['/etudiant/nouvelle-requete']);
  }
}

