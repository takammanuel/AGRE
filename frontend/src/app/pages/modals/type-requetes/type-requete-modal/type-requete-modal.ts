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
    if (this.typeRequete) {
      this.formData = { ...this.typeRequete };
    }
  }

  loadServices(): void {
    this.loadingServices = true;
    this.typeRequetesService.getServices().subscribe({
      next: (response: any) => {
        this.services = response?.services?.data || response?.services || [];
        this.loadingServices = false;
      },
      error: (error: any) => {
        console.error('Erreur:', error);
        this.loadingServices = false;
      }
    });
  }

  open(): void { this.showModal = true; this.submitted = false; }
  close(): void { this.showModal = false; }

  onSubmit(): void {
    this.submitted = true;
    if (this.formData.nom && this.formData.description) {
      this.save.emit(this.formData);
    }
  }

  get modalTitle(): string {
    return this.isEdit ? 'Modifier le type de requête' : 'Ajouter un type de requête';
  }
}
