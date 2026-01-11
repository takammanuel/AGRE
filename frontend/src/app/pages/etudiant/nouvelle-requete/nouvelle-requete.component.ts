import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EtudiantService } from '../../../services/etudiant.service';

@Component({
  selector: 'app-nouvelle-requete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nouvelle-requete.component.html',
  styleUrls: ['./nouvelle-requete.component.scss']
})
export class NouvelleRequeteComponent implements OnInit {
  private etudiantService = inject(EtudiantService);
  private router = inject(Router);
  
  typesRequetes: any[] = [];
  loading = false;
  submitting = false;
  error: string | null = null;
  
  // Formulaire
  formData = {
    type_requete_id: 0,
    description: '',
    priorite: 'STANDARD'
  };
  
  selectedFiles: File[] = [];

  ngOnInit(): void {
    this.loadTypesRequetes();
  }

  loadTypesRequetes(): void {
    this.loading = true;
    
    this.etudiantService.getTypesRequetes().subscribe({
      next: (response) => {
        this.typesRequetes = response.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des types:', err);
        this.error = 'Impossible de charger les types de requêtes';
        this.loading = false;
      }
    });
  }

  onFileSelect(event: any): void {
    const files = event.target.files;
    if (files) {
      this.selectedFiles = Array.from(files);
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  onSubmit(): void {
    // Validation
    if (!this.formData.type_requete_id || this.formData.type_requete_id === 0 || !this.formData.description.trim()) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.submitting = true;
    this.error = null;

    const requestData = {
      type_requete_id: Number(this.formData.type_requete_id),
      description: this.formData.description.trim(),
      priorite: this.formData.priorite,
      pieces_jointes: this.selectedFiles
    };

    console.log('Envoi de la requête:', requestData);

    this.etudiantService.createRequete(requestData).subscribe({
      next: (response) => {
        console.log('Requête créée avec succès:', response);
        this.submitting = false;
        this.router.navigate(['/etudiant/requetes']);
      },
      error: (err) => {
        console.error('Erreur complète:', err);
        this.error = err.error?.message || err.message || 'Erreur lors de la création de la requête';
        this.submitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/etudiant/requetes']);
  }
}
