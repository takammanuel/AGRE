import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RequeteService } from '../../../services/requete.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './historique.html'
})
export class HistoriqueComponent implements OnInit {
  private requeteService = inject(RequeteService);
  private authService = inject(AuthService);
  private router = inject(Router);

  public historique: any[] = [];
  public loading: boolean = true;
  public monId: number | null = null;

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.id) {
      this.monId = user.id;
      this.chargerHistorique(user.id);
    }
  }

  chargerHistorique(userId: number): void {
    this.loading = true;
    this.requeteService.getRequetesByEtudiant(userId).subscribe({
      next: (res: any) => {
        const toutes = res.data || [];
        // Filtre : Uniquement les requêtes terminées ou rejetées
        this.historique = toutes.filter((r: any) => {
          const s = r.statut.toLowerCase();
          return s.includes('termin') || s.includes('rejet');
        });
        this.loading = false;
      },
      error: (err) => {
        console.error("Erreur historique:", err);
        this.loading = false;
      }
    });
  }

  voirDetails(id: number): void {
    // Redirige vers la messagerie pour voir l'échange complet
    this.router.navigate(['/etudiant/messagerie', id]);
  }
}
