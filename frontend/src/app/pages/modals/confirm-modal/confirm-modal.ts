import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ConfirmModalConfig {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
}

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.html'
})
export class ConfirmModalComponent {
  @Output() confirm = new EventEmitter<void>();

  showModal = false;
  config: ConfirmModalConfig = {
    title: 'Confirmation',
    message: 'Êtes-vous sûr de vouloir continuer ?',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    confirmColor: 'danger'
  };

  open(config?: ConfirmModalConfig): void {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.showModal = true;
  }

  close(): void {
    this.showModal = false;
  }

  onConfirm(): void {
    this.confirm.emit();
  }

}
