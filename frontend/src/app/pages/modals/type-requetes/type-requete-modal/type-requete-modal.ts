import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TypeRequetesService } from '../../../../services/type-requetes.service';

@Component({
  selector: 'app-type-requete-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './type-requete-modal.html'
})
export class TypeRequeteModalComponent implements OnInit, OnChanges {
  @Input() typeRequete: any = null;
  @Input() isEdit: boolean = false;
  @Output() save = new EventEmitter<any>();

  showModal: boolean = false;
  submitted: boolean = false;
  services: any[] = [];
  loadingServices: boolean = false;

  formData: any = { nom: '', description: '', service_id: null };

  // L'erreur d'injection NG2003 disparaîtra ici dès que l'import en haut sera valide
  constructor(private typeRequetesService: TypeRequetesService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.typeRequete && this.isEdit) {
      // En mode édition, copier toutes les données du type de requête
      this.formData = {
        nom: this.typeRequete.nom || '',
        description: this.typeRequete.description || '',
        service_id: this.typeRequete.service_id || null
      };
      console.log('Mode édition - formData initialisé:', this.formData);
    } else {
      // En mode création, réinitialiser le formulaire
      this.formData = {
        nom: '',
        description: '',
        service_id: null
      };
      console.log('Mode création - formData réinitialisé');
    }
  }

  loadServices(): void {
    this.loadingServices = true;
    this.typeRequetesService.getServices().subscribe({
      next: (response: any) => {
        console.log('Services reçus:', response);
        // Le backend retourne { success: true, services: { data: [...], ...pagination } }
        this.services = response?.services?.data || response?.data || response?.services || [];
        console.log('Services chargés:', this.services);
        this.loadingServices = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement services:', error);
        this.loadingServices = false;
      }
    });
  }

  open(): void {
    this.showModal = true;
    this.submitted = false;
    
    // Réinitialiser ou charger les données selon le mode
    if (this.isEdit && this.typeRequete) {
      this.formData = {
        nom: this.typeRequete.nom || '',
        description: this.typeRequete.description || '',
        service_id: this.typeRequete.service_id || null
      };
      console.log('Modal ouvert en mode édition:', this.formData);
    } else {
      this.formData = {
        nom: '',
        description: '',
        service_id: null
      };
      console.log('Modal ouvert en mode création');
    }
  }
  close(): void { this.showModal = false; }

  onSubmit(): void {
    this.submitted = true;
    console.log('=== SOUMISSION FORMULAIRE ===');
    console.log('Mode:', this.isEdit ? 'Édition' : 'Création');
    console.log('formData:', this.formData);
    console.log('Validation - nom:', this.formData.nom);
    console.log('Validation - description:', this.formData.description);
    console.log('Validation - service_id:', this.formData.service_id);
    
    if (this.formData.nom && this.formData.description) {
      console.log('✓ Formulaire valide, émission de l\'événement save');
      this.save.emit(this.formData);
    } else {
      console.log('❌ Formulaire invalide');
      if (!this.formData.nom) console.log('  - Nom manquant');
      if (!this.formData.description) console.log('  - Description manquante');
    }
  }

  get modalTitle(): string {
    return this.isEdit ? 'Modifier le type de requête' : 'Ajouter un type de requête';
  }
}
