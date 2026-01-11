import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // 1. IMPORTATION NÉCESSAIRE
import { RequeteService } from '../../../services/requete.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-mes-requetes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // 2. AJOUT ICI POUR ROUTERLINK
  templateUrl: './mes-requetes.html',
  styles: [`
    .modal-backdrop { background-color: rgba(0,0,0,0.5); z-index: 1040; position: fixed; top: 0; left: 0; width: 100%; height: 100%; }
    .modal { z-index: 1050; display: block; }
    .card { transition: transform 0.2s; border-radius: 10px; }
    .card:hover { transform: translateY(-3px); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
  `]
})
export class MesRequetesComponent implements OnInit {
  private requeteService = inject(RequeteService);
  private authService = inject(AuthService);

  public mesRequetes: any[] = [];
  public loading: boolean = true;
  public currentUser: any = null;
  public showModal: boolean = false;
  public isSending: boolean = false;

  // 3. CORRECTION DU MODÈLE : 'titre' au lieu de 'objet'
  public nouvelleRequete = {
    titre: '', // Doit être exactement 'titre' comme dans le HTML
    description: ''
  };

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser && this.currentUser.id) {
      this.chargerRequetes(this.currentUser.id);
    } else {
      this.loading = false;
    }
  }

  chargerRequetes(userId: number): void {
    this.loading = true;
    this.requeteService.getRequetesByEtudiant(userId).subscribe({
      next: (res: any) => {
        this.mesRequetes = res.data || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error("Erreur chargement :", err);
        this.loading = false;
      }
    });
  }

  ouvrirModal() { this.showModal = true; }

  fermerModal() {
    this.showModal = false;
    // Reset avec 'titre' ici aussi
    this.nouvelleRequete = { titre: '', description: '' };
  }

  soumettreRequete(): void {
    if (!this.nouvelleRequete.titre || !this.nouvelleRequete.description) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    this.isSending = true;

    const payload = {
      titre: this.nouvelleRequete.titre,
      description: this.nouvelleRequete.description,
      utilisateur_id: this.currentUser.id,
      type_requete_id: 1 // À adapter selon ton besoin
    };

    this.requeteService.createRequete(payload).subscribe({
      next: (res: any) => {
        this.isSending = false;
        this.fermerModal();
        this.chargerRequetes(this.currentUser.id);
      },
      error: (err: any) => {
        console.error("Erreur création :", err);
        this.isSending = false;
        alert("Erreur lors de l'envoi.");
      }
    });
  }
}
