import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeRequete, TypeRequetesService } from '../../../../services/type-requetes.service';

@Component({
  selector: 'app-type-requete-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './type-requete-modal.html'
})
export class TypeRequeteModalComponent implements OnInit {
  @Input() typeRequete: TypeRequete | null = null;
  @Input() isEdit = false;
  @Output() save = new EventEmitter<TypeRequete>();

  showModal = false;
  formData: TypeRequete = {
    nom: '',
    description: '',
    service_id: null
  };
  submitted = false;
  services: any[] = [];
  loadingServices = false;

  constructor(private typeRequetesService: TypeRequetesService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  ngOnChanges(): void {
    if (this.typeRequete) {
      this.formData = {
        nom: this.typeRequete.nom || '',
        description: this.typeRequete.description || '',
        service_id: this.typeRequete.service_id || null
      };
    } else {
      this.resetForm();
    }
  }

  loadServices(): void {
    this.loadingServices = true;
    this.typeRequetesService.getServices().subscribe({
      next: (response) => {
        this.services = response.services.data;
        this.loadingServices = false;
      },
      error: (error) => {
        console.error('Erreur chargement services:', error);
        this.services = [];
        this.loadingServices = false;
      }
    });
  }

  open(): void {
    this.showModal = true;
  }

  close(): void {
    this.showModal = false;
    this.resetForm();
    this.submitted = false;
  }

  resetForm(): void {
    this.formData = {
      nom: '',
      description: '',
      service_id: null
    };
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.formData.nom.trim() && this.formData.description.trim()) {
      this.save.emit(this.formData);
    }
  }

  get modalTitle(): string {
    return this.isEdit ? 'Modifier le type de requête' : 'Ajouter un type de requête';
  }
}
