import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Service } from '../../../../services/services.service';

@Component({
  selector: 'app-service-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-detail-modal.html'
})
export class ServiceDetailModalComponent {
  @Input() service: Service | null = null;

  showModal = false;

  open(): void {
    this.showModal = true;
  }

  close(): void {
    this.showModal = false;
  }

}
