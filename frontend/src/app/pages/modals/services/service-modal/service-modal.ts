import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Service } from '../../../../services/services.service';

@Component({
  selector: 'app-service-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-modal.html'
})
export class ServiceModalComponent {
  @Input() service: Service | null = null;
  @Input() isEdit = false;
  @Output() save = new EventEmitter<Service>(); // <-- Modifié

  showModal = false;
  formData: Service = {
    nom: '',
    description: ''
  };
  submitted = false;

  ngOnChanges(): void {
    if (this.service) {
      this.formData = { ...this.service };
    } else {
      this.resetForm();
    }
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
      description: ''
    };
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.formData.nom.trim() && this.formData.description.trim()) {
      this.save.emit(this.formData); // <-- Modifié
    }
  }

  get modalTitle(): string {
    return this.isEdit ? 'Modifier le service' : 'Ajouter un service';
  }
  
}
