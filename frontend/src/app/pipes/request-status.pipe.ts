import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'requestStatus',
  standalone: true
})
export class RequestStatusPipe implements PipeTransform {
  private statusMap: { [key: string]: string } = {
    'EN_ATTENTE': 'En attente',
    'AFFECTEE': 'Affectée',
    'EN_COURS': 'En cours',
    'TRAITEE': 'Traitée',
    'REJETEE': 'Rejetée',
    'INFORMATIONS_REQUISES': 'Informations requises',
    'EN_ATTENTE_APPROBATION': 'En attente d\'approbation'
  };

  transform(value: string | null | undefined): string {
    if (!value) return '';
    return this.statusMap[value] || value;
  }
}

