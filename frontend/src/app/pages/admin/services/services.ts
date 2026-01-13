import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceModalComponent } from '../../modals/services/service-modal/service-modal';
import { ConfirmModalComponent } from '../../modals/confirm-modal/confirm-modal';
import { ServiceDetailModalComponent } from '../../modals/services/service-detail-modal/service-detail-modal';
import { Service, ServicesService } from '../../../services/services.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ServiceModalComponent,
    ConfirmModalComponent,
    ServiceDetailModalComponent
  ],
  templateUrl: './services.html',
  styleUrls: ['./services.css']
})
export class ServicesComponent implements OnInit {
  services: Service[] = [];
  loading = true;
  error = '';
  currentPage = 1;
  perPage = 10;
  pagination: any = {};

  selectedService: Service | null = null;
  isEditMode = false;

  @ViewChild(ServiceModalComponent) serviceModal!: ServiceModalComponent;
  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;
  @ViewChild(ServiceDetailModalComponent) detailModal!: ServiceDetailModalComponent;

  constructor(
    private servicesService: ServicesService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentPage = params['page'] ? +params['page'] : 1;
      this.perPage = params['limit'] ? +params['limit'] : 10;

      this.loadServices(this.currentPage);
    });
  }

  loadServices(page: number = 1): void {
    this.loading = true;
    this.servicesService.getAll(page, this.perPage).subscribe({
      next: (response) => {
        console.log(response)
        this.services = response.services.data;
        this.pagination = response.services;
        this.currentPage = response.services.current_page;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des services';
        this.loading = false;
        console.error(error);
      }
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.pagination.last_page) return;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page, limit: this.perPage },
      queryParamsHandling: 'merge'
    });
  }

  // Changer le nombre d'éléments par page
  changePerPage(newLimit: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: 1, limit: newLimit },
      queryParamsHandling: 'merge'
    });
  }

  // Navigation entre les pages
  goToNextPage() {
    this.goToPage(this.currentPage + 1);
  }

  goToPreviousPage() {
    this.goToPage(this.currentPage - 1);
  }

  openAddModal(): void {
    this.selectedService = null;
    this.isEditMode = false;
    setTimeout(() => {
      this.serviceModal.open();
    });
  }

  openEditModal(service: Service): void {
    this.selectedService = { ...service };
    this.isEditMode = true;
    setTimeout(() => {
      this.serviceModal.open();
    });
  }

  openDetailModal(service: Service): void {
    this.selectedService = service;
    setTimeout(() => {
      this.detailModal.open();
    });
  }

  openDeleteModal(service: Service): void {
    this.selectedService = service;
    setTimeout(() => {
      this.confirmModal.open({
        title: 'Supprimer le service',
        message: `Êtes-vous sûr de vouloir supprimer le service "${service.nom}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      });
    });
  }

  onServiceSaved(serviceData: Service): void {
    if (this.isEditMode && this.selectedService && this.selectedService.id) {
      // Mise à jour
      this.servicesService.update(this.selectedService.id, serviceData).subscribe({
        next: () => {
          this.loadServices();
          this.serviceModal.close();
          this.selectedService = null;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
        }
      });
    } else {
      // Création
      this.servicesService.create(serviceData).subscribe({
        next: () => {
          this.loadServices();
          this.serviceModal.close();
          this.selectedService = null;
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
        }
      });
    }
  }

  onDeleteConfirmed(): void {
    if (this.selectedService && this.selectedService.id) {
      this.servicesService.delete(this.selectedService.id).subscribe({
        next: () => {
          this.loadServices();
          this.confirmModal.close();
          this.selectedService = null;
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }
}
