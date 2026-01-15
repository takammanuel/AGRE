import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeRequeteModalComponent } from '../../modals/type-requetes/type-requete-modal/type-requete-modal';
import { ConfirmModalComponent } from '../../modals/confirm-modal/confirm-modal';
import { TypeRequeteDetailModalComponent } from '../../modals/type-requetes/type-requete-detail-modal/type-requete-detail-modal';
import { TypeRequetesService } from '../../../services/type-requetes.service';
import { ToastService } from '../../../services/toast.service';
import { ToastComponent } from '../../../components/toast/toast.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TypeRequete } from '../../../services/request.service';

@Component({
  selector: 'app-type-requetes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TypeRequeteModalComponent,
    ConfirmModalComponent,
    TypeRequeteDetailModalComponent,
    ToastComponent
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
    private toastService: ToastService,
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
    this.typeRequetesService.getAll(page, this.perPage).subscribe({
      next: (response) => {
        console.log('=== TYPES REQUÊTES REÇUS ===');
        console.log('Réponse complète:', response);
        this.typeRequetes = response.types_requetes.data;
        if (this.typeRequetes.length > 0) {
          console.log('Premier type:', this.typeRequetes[0]);
        }
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
      console.log('=== MODIFICATION TYPE REQUÊTE ===');
      console.log('ID:', this.selectedTypeRequete.id);
      console.log('Données envoyées:', typeRequeteData);
      console.log('URL:', `${this.typeRequetesService['apiUrl']}/admin/types-requetes/${this.selectedTypeRequete.id}`);
      
      this.typeRequetesService.update(this.selectedTypeRequete.id, typeRequeteData).subscribe({
        next: (response) => {
          console.log('✓ Réponse modification:', response);
          this.toastService.success('Type de requête modifié avec succès !');
          this.loadTypeRequetes(this.currentPage);
          this.typeRequeteModal.close();
        },
        error: (error) => {
          console.error('❌ Erreur modification complète:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('Error body:', error.error);
          const message = error.error?.message || 'Erreur lors de la modification';
          this.toastService.error(message);
        }
      });
    } else {
      // Mode création
      console.log('=== CRÉATION TYPE REQUÊTE ===');
      console.log('Données envoyées:', typeRequeteData);
      console.log('URL:', `${this.typeRequetesService['apiUrl']}/admin/types-requetes`);
      
      this.typeRequetesService.create(typeRequeteData).subscribe({
        next: (response) => {
          console.log('✓ Réponse création:', response);
          this.toastService.success('Type de requête créé avec succès !');
          this.loadTypeRequetes(this.currentPage);
          this.typeRequeteModal.close();
        },
        error: (error) => {
          console.error('❌ Erreur création complète:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('Error body:', error.error);
          const message = error.error?.message || 'Erreur lors de la création';
          this.toastService.error(message);
        }
      });
    }
  }

  onDeleteConfirmed(): void {
    if (this.selectedTypeRequete && this.selectedTypeRequete.id) {
      console.log('=== SUPPRESSION TYPE REQUÊTE ===');
      console.log('ID:', this.selectedTypeRequete.id);
      console.log('URL:', `${this.typeRequetesService['apiUrl']}/admin/types-requetes/${this.selectedTypeRequete.id}`);
      
      this.typeRequetesService.delete(this.selectedTypeRequete.id).subscribe({
        next: (response) => {
          console.log('✓ Réponse suppression:', response);
          this.toastService.success('Type de requête supprimé avec succès !');
          this.loadTypeRequetes(this.currentPage);
          this.confirmModal.close();
          this.selectedTypeRequete = null;
        },
        error: (error) => {
          console.error('❌ Erreur suppression complète:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('Error body:', error.error);
          const message = error.error?.message || 'Erreur lors de la suppression';
          this.toastService.error(message);
          this.confirmModal.close();
        }
      });
    }
  }
}
