import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-type-requete-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './type-requete-detail-modal.html'
})
export class TypeRequeteDetailModalComponent {
  @Input() typeRequete: any = null;

  showModal = false;

  open(): void {
    this.showModal = true;
  }

  close(): void {
    this.showModal = false;
  }
}
