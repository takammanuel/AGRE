import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService, StoreRequestData } from '../../../services/request.service';
import { TypeRequetesService } from '../../../services/type-requetes.service';

@Component({
  selector: 'app-nouvelle-requete',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './nouvelle-requete.html',
  styleUrls: ['./nouvelle-requete.css']
})
export class NouvelleRequeteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private requestService = inject(RequestService);
  private typeRequetesService = inject(TypeRequetesService);

  requestForm!: FormGroup;
  typesRequetes: any[] = [];
  selectedFiles: File[] = [];
  loading = false;
  error = '';
  success = false;

  ngOnInit(): void {
    this.requestForm = this.fb.group({
      type_requete_id: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      priorite: ['STANDARD', Validators.required]
    });

    this.loadTypesRequetes();
  }

  loadTypesRequetes(): void {
    this.typeRequetesService.getForStudents().subscribe({
      next: (response) => {
        this.typesRequetes = response.types_requetes;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des types de requêtes', error);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      if (this.selectedFiles.length + files.length > 5) {
        this.error = 'Vous ne pouvez pas joindre plus de 5 fichiers';
        return;
      }
      this.selectedFiles = [...this.selectedFiles, ...files];
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  onSubmit(): void {
    if (this.requestForm.invalid) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.loading = true;
    this.error = '';

    const formData: StoreRequestData = {
      type_requete_id: this.requestForm.value.type_requete_id,
      description: this.requestForm.value.description,
      priorite: this.requestForm.value.priorite,
      pieces_jointes: this.selectedFiles.length > 0 ? this.selectedFiles : undefined
    };

    this.requestService.createRequest(formData).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/etudiant/mes-requetes']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Erreur lors de la soumission de la requête';
        console.error(error);
      }
    });
  }

  navigateToCreateRequest(): void {
    this.router.navigate(['/etudiant/nouvelle-requete']);
  }

  navigateToRequests(): void {
    this.router.navigate(['/etudiant/mes-requetes']);
  }
}

