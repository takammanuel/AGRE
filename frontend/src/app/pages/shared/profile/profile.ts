import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService, UpdateProfileData, UserProfile } from '../../../services/profile.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  loading = true;
  saving = false;
  error = '';
  success = '';

  // Mode édition
  editMode = false;

  // Données du formulaire
  formData: UpdateProfileData = {};

  // Pour le select des services (agents)
  services: any[] = [];

  // Pour la photo
  selectedPhoto: File | null = null;
  photoPreview: string | null = null;

  constructor(
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.profileService.getProfile().subscribe({
      next: (response: any) => {
        this.profile = response.data || response;
        console.log('Profil chargé:', this.profile);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement profil:', error);
        this.error = 'Erreur lors du chargement du profil';
        this.loading = false;
      }
    });
  }

  // Vérifier les rôles
  hasRole(role: string): boolean {
    return this.profile?.roles?.includes(role) || this.profile?.role === role || false;
  }

  isEtudiant(): boolean {
    return this.hasRole('ETUDIANT');
  }

  isAgent(): boolean {
    return this.hasRole('AGENT_ACADEMIQUE');
  }

  isResponsable(): boolean {
    return this.hasRole('RESPONSABLE_PEDAGOGIQUE');
  }

  isAdmin(): boolean {
    return this.hasRole('ADMINISTRATEUR');
  }

  // Gestion de la photo
  onPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.match('image.*')) {
        this.error = 'Veuillez sélectionner une image';
        return;
      }

      // Vérifier la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.error = 'L\'image ne doit pas dépasser 2MB';
        return;
      }

      this.selectedPhoto = file;

      // Créer un preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadPhoto(): void {
    if (!this.selectedPhoto) return;

    this.saving = true;
    this.profileService.updatePhoto(this.selectedPhoto).subscribe({
      next: (response: any) => {
        this.success = response.message || 'Photo mise à jour avec succès';
        this.selectedPhoto = null;
        this.photoPreview = null;
        this.saving = false;

        // Recharger le profil
        this.loadProfile();
      },
      error: (error: any) => {
        console.error('Erreur upload photo:', error);
        this.error = 'Erreur lors du téléchargement de la photo';
        this.saving = false;
      }
    });
  }

  // Édition du profil
  startEdit(): void {
    this.editMode = true;
    this.formData = {};

    // Pré-remplir avec les données actuelles
    if (this.profile) {
      this.formData.nom = this.profile.nom;
      this.formData.prenom = this.profile.prenom;
      this.formData.telephone = this.profile.telephone;

      // Pré-remplir selon le rôle
      if (this.isEtudiant() && this.profile.profil_etudiant) {
        this.formData.matricule = this.profile.profil_etudiant.matricule;
        this.formData.niveau = this.profile.profil_etudiant.niveau;
        this.formData.filiere = this.profile.profil_etudiant.filiere;
      }

      if (this.isAgent() && this.profile.profil_agent) {
        this.formData.poste = this.profile.profil_agent.poste;
        this.formData.service_id = this.profile.profil_agent.service_id;
      }

      if (this.isResponsable() && this.profile.profil_responsable) {
        this.formData.departement = this.profile.profil_responsable.departement;
      }

      if (this.isAdmin() && this.profile.profil_admin) {
        this.formData.niveau_acces = this.profile.profil_admin.niveau_acces;
      }
    }
  }

  cancelEdit(): void {
    this.editMode = false;
    this.formData = {};
    this.error = '';
  }

  saveProfile(): void {
    if (!this.profile) return;

    this.saving = true;
    this.profileService.updateProfile(this.formData).subscribe({
      next: (response: any) => {
        this.success = response.message || 'Profil mis à jour avec succès';
        this.editMode = false;
        this.saving = false;

        // Recharger le profil
        this.loadProfile();

         // Mettre à jour les infos dans le service d'auth
        this.authService.updateUserInfo({
          nom: this.profile?.nom || '',
          prenom: this.profile?.prenom || '',
          email: this.profile?.email || '',
          roles: this.profile?.roles || []
        });
      },
      error: (error: any) => {
        console.error('Erreur mise à jour profil:', error);
        this.error = error.error?.message || 'Erreur lors de la mise à jour';
        this.saving = false;
      }
    });
  }

  // Formater la date
  formatDate(dateString: string): string {
    if (!dateString) return 'Non vérifié';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
