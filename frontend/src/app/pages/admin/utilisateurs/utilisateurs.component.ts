import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../services/toast.service';
import { ToastComponent } from '../../../components/toast/toast.component';

const API_URL = 'http://localhost:8000/api';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent],
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.scss']
})
export class UtilisateursComponent implements OnInit {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  
  utilisateurs: any[] = [];
  loading = true;
  error: string | null = null;
  
  // Filtres
  filtreRole: string = 'TOUS';
  filtreStatut: string = 'TOUS';
  searchTerm: string = '';
  
  // État de la recherche
  isSearching = false;
  searchMessage: string | null = null;
  searchMessageType: 'success' | 'warning' | 'info' = 'info';

  // Modal nouvel utilisateur
  showModal = false;
  isEditMode = false;
  selectedUserId: number | null = null;
  isSubmitting = false;
  newUser = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    role: 'ETUDIANT',
    is_active: true,
    profil: {
      matricule: '',
      filiere: '',
      niveau: 1,
      poste: '',
      departement: '',
      niveau_acces: 'admin'
    }
  };
  formErrors: any = {};

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.loading = true;
    this.error = null;
    
    this.http.get<any>(`${API_URL}/admin/utilisateurs`).subscribe({
      next: (response) => {
        console.log('=== RÉPONSE API loadUtilisateurs ===');
        console.log('Réponse complète:', response);
        
        if (response.success) {
          this.utilisateurs = response.data || [];
          console.log('Nombre d\'utilisateurs:', this.utilisateurs.length);
          
          // Vérifier les rôles du premier utilisateur
          if (this.utilisateurs.length > 0) {
            console.log('Premier utilisateur:', this.utilisateurs[0]);
            console.log('Rôles du premier utilisateur:', this.utilisateurs[0].roles);
          }
        } else {
          this.utilisateurs = [];
          this.error = response.message || 'Erreur lors du chargement';
        }
        
        this.loading = false;
        console.log('Utilisateurs chargés:', this.utilisateurs.length);
      },
      error: (err) => {
        console.error('Erreur complète:', err);
        this.error = 'Impossible de charger les utilisateurs';
        this.utilisateurs = [];
        this.loading = false;
      }
    });
  }

  get utilisateursFiltres(): any[] {
    const filtered = this.utilisateurs.filter(user => {
      // Filtre par rôle
      let matchRole = this.filtreRole === 'TOUS';
      if (!matchRole && user.roles && user.roles.length > 0) {
        // Mapper les libellés vers les noms français
        const roleMap: { [key: string]: string[] } = {
          'ETUDIANT': ['Étudiant', 'ETUDIANT'],
          'AGENT_ACADEMIQUE': ['Agent Académique', 'AGENT_ACADEMIQUE'],
          'RESPONSABLE_PEDAGOGIQUE': ['Responsable Pédagogique', 'RESPONSABLE_PEDAGOGIQUE'],
          'ADMINISTRATEUR': ['Administrateur', 'ADMINISTRATEUR']
        };
        
        const rolesToMatch = roleMap[this.filtreRole] || [this.filtreRole];
        matchRole = user.roles.some((r: any) => rolesToMatch.includes(r.nom) || rolesToMatch.includes(r.libelle));
      }
      
      // Filtre par statut
      const matchStatut = this.filtreStatut === 'TOUS' || 
        (this.filtreStatut === 'ACTIF' && user.is_active) ||
        (this.filtreStatut === 'INACTIF' && !user.is_active);
      
      // Filtre par recherche
      const matchSearch = !this.searchTerm || 
        user.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.prenom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.telephone?.includes(this.searchTerm);
      
      return matchRole && matchStatut && matchSearch;
    });

    this.updateSearchMessage(filtered.length);
    return filtered;
  }

  updateSearchMessage(resultCount: number): void {
    if (!this.searchTerm && this.filtreRole === 'TOUS' && this.filtreStatut === 'TOUS') {
      this.searchMessage = null;
      return;
    }

    if (this.searchTerm) {
      if (resultCount === 0) {
        this.searchMessage = `Aucun utilisateur trouvé pour "${this.searchTerm}"`;
        this.searchMessageType = 'warning';
      } else if (resultCount === 1) {
        this.searchMessage = `1 utilisateur trouvé pour "${this.searchTerm}"`;
        this.searchMessageType = 'success';
      } else {
        this.searchMessage = `${resultCount} utilisateurs trouvés pour "${this.searchTerm}"`;
        this.searchMessageType = 'success';
      }
    } else {
      if (resultCount === 0) {
        this.searchMessage = 'Aucun utilisateur ne correspond aux filtres sélectionnés';
        this.searchMessageType = 'warning';
      } else {
        this.searchMessage = `${resultCount} utilisateur(s) affiché(s)`;
        this.searchMessageType = 'info';
      }
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchMessage = null;
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.filtreRole = 'TOUS';
    this.filtreStatut = 'TOUS';
    this.searchMessage = null;
  }

  onSearchInput(): void {
    if (!this.searchTerm.trim()) {
      this.searchMessage = null;
    }
  }

  searchUser(): void {
    if (!this.searchTerm.trim()) {
      return;
    }

    this.isSearching = true;
    const filtered = this.utilisateursFiltres;
    
    setTimeout(() => {
      this.isSearching = false;
      
      if (filtered.length === 0) {
        this.searchMessage = `L'utilisateur "${this.searchTerm}" n'existe pas dans la base de données`;
        this.searchMessageType = 'warning';
      } else if (filtered.length === 1) {
        this.searchMessage = `✓ Utilisateur trouvé : ${filtered[0].nom} ${filtered[0].prenom}`;
        this.searchMessageType = 'success';
      } else {
        this.searchMessage = `✓ ${filtered.length} utilisateurs correspondent à votre recherche`;
        this.searchMessageType = 'success';
      }
    }, 300);
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedUserId = null;
    this.showModal = true;
    this.resetForm();
  }

  openEditModal(user: any): void {
    console.log('=== OUVERTURE MODAL ÉDITION ===');
    console.log('Utilisateur sélectionné:', user);
    
    this.isEditMode = true;
    this.selectedUserId = user.id;
    
    // Récupérer le rôle
    const userRole = user.roles && user.roles.length > 0 ? user.roles[0].nom : 'Étudiant';
    const roleKey = this.getRoleKey(userRole);
    
    console.log('Rôle utilisateur:', userRole, '→ Clé:', roleKey);
    
    // Pré-remplir le formulaire
    this.newUser = {
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      telephone: user.telephone || '',
      password: '', // Ne pas pré-remplir le mot de passe
      role: roleKey,
      is_active: user.is_active !== undefined ? user.is_active : true,
      profil: {
        matricule: user.profil_etudiant?.matricule || '',
        filiere: user.profil_etudiant?.filiere || '',
        niveau: user.profil_etudiant?.niveau || 1,
        poste: user.profil_agent_administratif?.poste || '',
        departement: user.profil_responsable_pedagogique?.departement || '',
        niveau_acces: user.profil_administrateur?.niveau_acces || 'admin'
      }
    };
    
    console.log('Formulaire pré-rempli:', this.newUser);
    this.showModal = true;
  }

  getRoleKey(roleName: string): string {
    const roleKeyMap: { [key: string]: string } = {
      'Étudiant': 'ETUDIANT',
      'Agent Académique': 'AGENT_ACADEMIQUE',
      'Responsable Pédagogique': 'RESPONSABLE_PEDAGOGIQUE',
      'Administrateur': 'ADMINISTRATEUR'
    };
    return roleKeyMap[roleName] || 'ETUDIANT';
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newUser = {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      password: '',
      role: 'ETUDIANT',
      is_active: true,
      profil: {
        matricule: '',
        filiere: '',
        niveau: 1,
        poste: '',
        departement: '',
        niveau_acces: 'admin'
      }
    };
    this.formErrors = {};
  }

  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    if (!this.newUser.nom.trim()) {
      this.formErrors.nom = 'Le nom est requis';
      isValid = false;
    }

    if (!this.newUser.prenom.trim()) {
      this.formErrors.prenom = 'Le prénom est requis';
      isValid = false;
    }

    if (!this.newUser.email.trim()) {
      this.formErrors.email = 'L\'email est requis';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newUser.email)) {
      this.formErrors.email = 'Email invalide';
      isValid = false;
    }

    // Le mot de passe est obligatoire seulement en mode création
    if (!this.isEditMode) {
      if (!this.newUser.password || this.newUser.password.length < 6) {
        this.formErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        isValid = false;
      }
    } else {
      // En mode édition, si un mot de passe est fourni, il doit être valide
      if (this.newUser.password && this.newUser.password.length < 6) {
        this.formErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        isValid = false;
      }
    }

    if (this.newUser.role === 'ETUDIANT') {
      if (!this.newUser.profil.matricule.trim()) {
        this.formErrors.matricule = 'Le matricule est requis pour un étudiant';
        isValid = false;
      }
      if (!this.newUser.profil.filiere.trim()) {
        this.formErrors.filiere = 'La filière est requise pour un étudiant';
        isValid = false;
      }
    } else if (this.newUser.role === 'AGENT_ACADEMIQUE') {
      if (!this.newUser.profil.poste.trim()) {
        this.formErrors.poste = 'Le poste est requis pour un agent';
        isValid = false;
      }
    } else if (this.newUser.role === 'RESPONSABLE_PEDAGOGIQUE') {
      if (!this.newUser.profil.departement.trim()) {
        this.formErrors.departement = 'Le département est requis pour un responsable';
        isValid = false;
      }
    }

    return isValid;
  }

  createUser(): void {
    if (this.isEditMode) {
      this.updateUser();
      return;
    }

    console.log('=== DÉBUT CRÉATION UTILISATEUR ===');
    console.log('Données du formulaire:', this.newUser);

    if (!this.validateForm()) {
      console.log('❌ Validation échouée:', this.formErrors);
      this.toastService.error('Veuillez remplir tous les champs obligatoires correctement');
      return;
    }

    console.log('✓ Validation réussie');
    this.isSubmitting = true;

    const roleMap: { [key: string]: string } = {
      'ETUDIANT': 'Étudiant',
      'AGENT_ACADEMIQUE': 'Agent Académique',
      'RESPONSABLE_PEDAGOGIQUE': 'Responsable Pédagogique',
      'ADMINISTRATEUR': 'Administrateur'
    };

    const userData: any = {
      nom: this.newUser.nom.trim(),
      prenom: this.newUser.prenom.trim(),
      email: this.newUser.email.trim().toLowerCase(),
      telephone: this.newUser.telephone?.trim() || null,
      password: this.newUser.password,
      role: roleMap[this.newUser.role] || this.newUser.role,
      is_active: this.newUser.is_active
    };

    if (this.newUser.role === 'ETUDIANT') {
      userData.profil_data = {
        matricule: this.newUser.profil.matricule.trim(),
        filiere: this.newUser.profil.filiere.trim(),
        niveau: parseInt(this.newUser.profil.niveau.toString())
      };
    } else if (this.newUser.role === 'AGENT_ACADEMIQUE') {
      userData.profil_data = {
        poste: this.newUser.profil.poste?.trim() || 'Agent',
        service_id: 1
      };
    } else if (this.newUser.role === 'RESPONSABLE_PEDAGOGIQUE') {
      userData.profil_data = {
        departement: this.newUser.profil.departement?.trim() || 'Département'
      };
    } else if (this.newUser.role === 'ADMINISTRATEUR') {
      userData.profil_data = {
        niveau_acces: this.newUser.profil.niveau_acces || 'admin'
      };
    }

    console.log('Données envoyées:', userData);

    this.http.post(`${API_URL}/admin/utilisateurs`, userData).subscribe({
      next: (response: any) => {
        console.log('✓ SUCCÈS:', response);
        this.isSubmitting = false;
        this.closeModal();
        this.loadUtilisateurs();
        this.toastService.success(`✓ Utilisateur ${this.newUser.prenom} ${this.newUser.nom} créé avec succès !`);
      },
      error: (err) => {
        console.log('❌ ERREUR:', err);
        this.isSubmitting = false;
        
        if (err.status === 422 && err.error?.errors) {
          this.formErrors = err.error.errors;
          
          if (err.error.errors.email) {
            this.toastService.error('⚠ Cet email est déjà utilisé');
          } else if (err.error.errors['profil_data.matricule']) {
            this.toastService.error('⚠ Ce matricule est déjà utilisé');
          } else {
            this.toastService.error('Veuillez corriger les erreurs dans le formulaire');
          }
        } else if (err.status === 0) {
          this.toastService.error('❌ Impossible de contacter le serveur');
        } else {
          const message = err.error?.message || 'Erreur lors de la création';
          this.toastService.error(`❌ ${message}`);
        }
      }
    });
  }

  updateUser(): void {
    console.log('=== DÉBUT MODIFICATION UTILISATEUR ===');
    console.log('ID:', this.selectedUserId);
    console.log('Données du formulaire:', this.newUser);

    if (!this.validateForm()) {
      console.log('❌ Validation échouée:', this.formErrors);
      this.toastService.error('Veuillez remplir tous les champs obligatoires correctement');
      return;
    }

    console.log('✓ Validation réussie');
    this.isSubmitting = true;

    const roleMap: { [key: string]: string } = {
      'ETUDIANT': 'Étudiant',
      'AGENT_ACADEMIQUE': 'Agent Académique',
      'RESPONSABLE_PEDAGOGIQUE': 'Responsable Pédagogique',
      'ADMINISTRATEUR': 'Administrateur'
    };

    const userData: any = {
      nom: this.newUser.nom.trim(),
      prenom: this.newUser.prenom.trim(),
      email: this.newUser.email.trim().toLowerCase(),
      telephone: this.newUser.telephone?.trim() || null,
      role: roleMap[this.newUser.role] || this.newUser.role,
      is_active: this.newUser.is_active
    };

    // Ajouter le mot de passe seulement s'il est fourni
    if (this.newUser.password && this.newUser.password.trim()) {
      userData.password = this.newUser.password;
    }

    if (this.newUser.role === 'ETUDIANT') {
      userData.profil_data = {
        matricule: this.newUser.profil.matricule.trim(),
        filiere: this.newUser.profil.filiere.trim(),
        niveau: parseInt(this.newUser.profil.niveau.toString())
      };
    } else if (this.newUser.role === 'AGENT_ACADEMIQUE') {
      userData.profil_data = {
        poste: this.newUser.profil.poste?.trim() || 'Agent',
        service_id: 1
      };
    } else if (this.newUser.role === 'RESPONSABLE_PEDAGOGIQUE') {
      userData.profil_data = {
        departement: this.newUser.profil.departement?.trim() || 'Département'
      };
    } else if (this.newUser.role === 'ADMINISTRATEUR') {
      userData.profil_data = {
        niveau_acces: this.newUser.profil.niveau_acces || 'admin'
      };
    }

    console.log('Données envoyées:', userData);

    this.http.put(`${API_URL}/admin/utilisateurs/${this.selectedUserId}`, userData).subscribe({
      next: (response: any) => {
        console.log('✓ SUCCÈS:', response);
        this.isSubmitting = false;
        this.closeModal();
        this.loadUtilisateurs();
        this.toastService.success(`✓ Utilisateur ${this.newUser.prenom} ${this.newUser.nom} modifié avec succès !`);
      },
      error: (err) => {
        console.log('❌ ERREUR:', err);
        this.isSubmitting = false;
        
        if (err.status === 422 && err.error?.errors) {
          this.formErrors = err.error.errors;
          this.toastService.error('Veuillez corriger les erreurs dans le formulaire');
        } else {
          const message = err.error?.message || 'Erreur lors de la modification';
          this.toastService.error(`❌ ${message}`);
        }
      }
    });
  }

  toggleActivation(user: any): void {
    const action = user.is_active ? 'désactiver' : 'activer';
    if (confirm(`Voulez-vous ${action} l'utilisateur ${user.nom} ${user.prenom} ?`)) {
      this.http.put(`${API_URL}/admin/utilisateurs/${user.id}/activate`, {}).subscribe({
        next: () => {
          user.is_active = !user.is_active;
          this.toastService.success(`Utilisateur ${user.is_active ? 'activé' : 'désactivé'} avec succès`);
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.toastService.error('Erreur lors de la modification');
        }
      });
    }
  }

  resetPassword(user: any): void {
    if (confirm(`Voulez-vous réinitialiser le mot de passe de ${user.nom} ${user.prenom} ?`)) {
      this.http.put(`${API_URL}/admin/utilisateurs/${user.id}/reset-password`, {}).subscribe({
        next: (response: any) => {
          this.toastService.success(`Mot de passe réinitialisé: ${response.new_password}`);
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.toastService.error('Erreur lors de la réinitialisation');
        }
      });
    }
  }

  getRoleBadgeClass(role: string): string {
    const roleMap: { [key: string]: string } = {
      // Libellés en majuscules
      'ADMINISTRATEUR': 'badge-admin',
      'AGENT_ACADEMIQUE': 'badge-agent',
      'RESPONSABLE_PEDAGOGIQUE': 'badge-responsable',
      'ETUDIANT': 'badge-etudiant',
      // Noms en français
      'Administrateur': 'badge-admin',
      'Agent Académique': 'badge-agent',
      'Responsable Pédagogique': 'badge-responsable',
      'Étudiant': 'badge-etudiant'
    };
    return roleMap[role] || 'badge-default';
  }

  getRoleLabel(role: string): string {
    const labelMap: { [key: string]: string } = {
      // Libellés en majuscules
      'ADMINISTRATEUR': 'Admin',
      'AGENT_ACADEMIQUE': 'Agent',
      'RESPONSABLE_PEDAGOGIQUE': 'Responsable',
      'ETUDIANT': 'Étudiant',
      // Noms en français
      'Administrateur': 'Admin',
      'Agent Académique': 'Agent',
      'Responsable Pédagogique': 'Responsable',
      'Étudiant': 'Étudiant'
    };
    return labelMap[role] || role;
  }
}
