import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EtudiantService } from '../../../services/etudiant.service';

@Component({
  selector: 'app-etudiant-requete-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './requete-details.component.html',
  styleUrls: ['./requete-details.component.scss']
})
export class EtudiantRequeteDetailsComponent implements OnInit {
  private etudiantService = inject(EtudiantService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  requete: any = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRequeteDetails(+id);
    }
  }

  loadRequeteDetails(id: number): void {
    this.loading = true;
    this.error = null;
    
    this.etudiantService.getRequeteDetails(id).subscribe({
      next: (response) => {
        this.requete = response.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement:', err);
        this.error = 'Impossible de charger les détails de la requête';
        this.loading = false;
      }
    });
  }

  getStatusClass(statut: string): string {
    const statusMap: { [key: string]: string } = {
      'EN_ATTENTE': 'status-pending',
      'EN_COURS': 'status-progress',
      'TRAITEE': 'status-completed',
      'REJETEE': 'status-rejected'
    };
    return statusMap[statut] || 'status-default';
  }

  getStatusLabel(statut: string): string {
    const labelMap: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'TRAITEE': 'Traitée',
      'REJETEE': 'Rejetée'
    };
    return labelMap[statut] || statut;
  }

  getPriorityClass(priorite: string): string {
    return priorite === 'URGENTE' ? 'priority-urgent' : 'priority-standard';
  }

  getPriorityLabel(priorite: string): string {
    return priorite === 'URGENTE' ? 'Urgente' : 'Standard';
  }

  downloadFile(file: any): void {
    const url = `http://localhost:8000/storage/${file.chemin_fichier}`;
    window.open(url, '_blank');
  }

  goBack(): void {
    this.router.navigate(['/etudiant/requetes']);
  }
}
