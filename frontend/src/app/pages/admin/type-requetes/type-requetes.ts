import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeRequeteModalComponent } from '../../modals/type-requetes/type-requete-modal/type-requete-modal';
import { ConfirmModalComponent } from '../../modals/confirm-modal/confirm-modal';
import { TypeRequeteDetailModalComponent } from '../../modals/type-requetes/type-requete-detail-modal/type-requete-detail-modal';
import { TypeRequete, TypeRequetesService } from '../../../services/type-requetes.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-type-requetes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TypeRequeteModalComponent,
    ConfirmModalComponent,
    TypeRequeteDetailModalComponent
  ],
  templateUrl: './type-requetes.html',
  styleUrls: ['./type-requetes.css']
})
export class TypeRequetesComponent implements OnInit {
  typeRequetes: TypeRequete[] = [];
  loading = true;
  error = '';
  currentPage = 1;
  perPage = 10;
  pagination: any = {};

  selectedTypeRequete: TypeRequete | null = null;
  isEditMode = false;

  @ViewChild(TypeRequeteModalComponent) typeRequeteModal!: TypeRequeteModalComponent;
  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;
  @ViewChild(TypeRequeteDetailModalComponent) detailModal!: TypeRequeteDetailModalComponent;

  constructor(
    private typeRequetesService: TypeRequetesService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentPage = params['page'] ? +params['page'] : 1;
      this.perPage = params['limit'] ? +params['limit'] : 10;

      this.loadTypeRequetes(this.currentPage);
    });
  }

  loadTypeRequetes(page: number = 1): void {
    this.loading = true;
    this.typeRequetesService.getAll().subscribe({
      next: (response) => {
        this.typeRequetes = response.types_requetes.data;
        this.pagination = response.types_requetes;
        this.currentPage = response.types_requetes.current_page;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des types de requêtes';
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
    this.selectedTypeRequete = null;
    this.isEditMode = false;
    setTimeout(() => {
      this.typeRequeteModal.open();
    });
  }

  openEditModal(typeRequete: TypeRequete): void {
    this.selectedTypeRequete = { ...typeRequete };
    this.isEditMode = true;
    setTimeout(() => {
      this.typeRequeteModal.open();
    });
  }

  openDetailModal(typeRequete: TypeRequete): void {
    this.selectedTypeRequete = typeRequete;
    setTimeout(() => {
      this.detailModal.open();
    });
  }

  openDeleteModal(typeRequete: TypeRequete): void {
    this.selectedTypeRequete = typeRequete;
    setTimeout(() => {
      this.confirmModal.open({
        title: 'Supprimer le type de requête',
        message: `Êtes-vous sûr de vouloir supprimer "${typeRequete.nom}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      });
    });
  }

  onTypeRequeteSaved(typeRequeteData: TypeRequete): void {
    if (this.isEditMode && this.selectedTypeRequete && this.selectedTypeRequete.id) {
      // Mode édition
      this.typeRequetesService.update(this.selectedTypeRequete.id, typeRequeteData).subscribe({
        next: () => {
          this.loadTypeRequetes();
          this.typeRequeteModal.close();
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          this.error = 'Erreur lors de la modification';
        }
      });
    } else {
      // Mode création
      this.typeRequetesService.create(typeRequeteData).subscribe({
        next: () => {
          this.loadTypeRequetes();
          this.typeRequeteModal.close();
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.error = 'Erreur lors de la création';
        }
      });
    }
  }

  onDeleteConfirmed(): void {
    if (this.selectedTypeRequete && this.selectedTypeRequete.id) {
      this.typeRequetesService.delete(this.selectedTypeRequete.id).subscribe({
        next: () => {
          this.loadTypeRequetes();
          this.confirmModal.close();
          this.selectedTypeRequete = null;
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }
}
