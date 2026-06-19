import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priority',
  standalone: true
})
export class PriorityPipe implements PipeTransform {
  transform(value: 'URGENTE' | 'STANDARD' | string | null | undefined): string {
    if (!value) return '';
    return value === 'URGENTE' ? 'Urgente' : 'Standard';
  }

  getBadgeClass(value: 'URGENTE' | 'STANDARD' | string | null | undefined): string {
    if (!value) return '';
    return value === 'URGENTE' ? 'badge-danger' : 'badge-secondary';
  }
}

