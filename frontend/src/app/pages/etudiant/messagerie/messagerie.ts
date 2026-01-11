import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { RequeteService } from '../../../services/requete.service';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from '../../../services/message.service';
import { NotificationService } from '../../../services/notification.service'; // AJOUTÉ

@Component({
  selector: 'app-messagerie',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './messagerie.html'
})
export class MessagerieComponent implements OnInit {
  private requeteService = inject(RequeteService);
  private messageService = inject(MessageService);
  public authService = inject(AuthService);
  public notificationService = inject(NotificationService); // AJOUTÉ
  private route = inject(ActivatedRoute);

  public requetes: any[] = [];
  public messages: any[] = [];
  public requeteId: number | null = null;
  public currentRequete: any = null;
  public monId: number | null = null;
  public nouveauMessage: string = '';

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.monId = user.id;
      this.chargerListe();
    }

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.requeteId = +params['id'];
        this.chargerDiscussion(this.requeteId);
      }
    });
  }

  chargerListe(): void {
    this.requeteService.getRequetesByEtudiant(this.monId!).subscribe({
      next: (res: any) => this.requetes = res.data || []
    });
  }

  chargerDiscussion(id: number): void {
    this.requeteService.getRequeteById(id).subscribe({
      next: (res: any) => this.currentRequete = res.data
    });

    this.messageService.getMessagesByRequete(id).subscribe({
      next: (res: any) => {
        this.messages = res.data || [];
      }
    });
  }

  envoyer(): void {
    if (!this.nouveauMessage.trim() || !this.requeteId) return;

    // Déterminer le destinataire : l'agent assigné à la requête ou Charlie (ID 3) par défaut
    const recepteurId = this.currentRequete?.agent_id || this.currentRequete?.responsable_id || 3;

    const payload = {
      contenu: this.nouveauMessage,
      emetteur_id: this.monId,
      requete_id: this.requeteId,
      recepteur_id: recepteurId
    };

    this.messageService.sendMessage(payload).subscribe({
      next: (res: any) => {
        this.messages.push(res.data);
        this.nouveauMessage = '';
        // FORCE LA MISE À JOUR DU BADGE DE NOTIFICATION
        this.notificationService.refreshCount();
      }
    });
  }
}
