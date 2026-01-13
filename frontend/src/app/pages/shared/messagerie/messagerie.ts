import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../services/message.service';
import { AuthService } from '../../../services/auth.service';
import { RequeteService } from '../../../services/requete.service';
import { DashboardConfigService } from '../../../services/dashboard-config.service';

@Component({
  selector: 'app-messagerie-shared',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messagerie.html',
  styleUrls: ['./messagerie.css']
})
export class MessagerieSharedComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private requeteService = inject(RequeteService);
  private dashboardConfig = inject(DashboardConfigService);

  // Conversations
  conversations: any[] = [];
  loadingConversations = true;

  // Conversation active
  requeteId: number | null = null;
  requete: any = null;
  messages: any[] = [];
  newMessage = '';
  currentUser: any = null;
  loading = true;
  sending = false;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadConversations();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.requeteId = +params['id'];
        this.loadRequete();
        this.loadMessages();
      } else {
        this.requeteId = null;
        this.requete = null;
        this.messages = [];
      }
    });
  }

  loadConversations(): void {
    this.loadingConversations = true;
    this.messageService.getConversations().subscribe({
      next: (res: any) => {
        this.conversations = res.data || [];
        this.loadingConversations = false;
      },
      error: () => {
        this.loadingConversations = false;
      }
    });
  }

  selectConversation(conv: any): void {
    const config = this.dashboardConfig.getDashboardConfig();
    const rolePrefix = this.getRolePrefix(config.role);
    this.router.navigate([`/${rolePrefix}/messagerie`, conv.requete_id]);
  }

  private getRolePrefix(role: string): string {
    switch (role) {
      case 'ADMINISTRATEUR': return 'admin';
      case 'AGENT_ACADEMIQUE': return 'agent';
      case 'RESPONSABLE_PEDAGOGIQUE': return 'responsable';
      default: return 'etudiant';
    }
  }

  loadRequete(): void {
    if (!this.requeteId) return;
    this.requeteService.getRequeteById(this.requeteId).subscribe({
      next: (res: any) => {
        this.requete = res.data || res;
      },
      error: (err) => console.error('Erreur chargement requête', err)
    });
  }

  loadMessages(): void {
    if (!this.requeteId) return;
    this.loading = true;
    this.messageService.getMessagesByRequete(this.requeteId).subscribe({
      next: (res: any) => {
        this.messages = res.data || [];
        this.loading = false;
        this.scrollToBottom();
        
        // Marquer les messages comme lus
        this.messageService.markAsRead(this.requeteId!).subscribe(() => {
          // Rafraîchir la liste des conversations pour mettre à jour les badges
          this.loadConversations();
        });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.requeteId || !this.currentUser) return;

    this.sending = true;
    
    // Déterminer le destinataire selon qui envoie
    let recepteurId: number | null = null;
    
    const etudiantId = this.requete?.etudiant_id || this.requete?.utilisateur_id || this.requete?.etudiant?.id;
    const agentId = this.requete?.agent_id || this.requete?.agent?.id;
    
    if (this.currentUser.id === etudiantId) {
      // L'étudiant envoie -> destinataire = agent (ou admin si pas d'agent)
      recepteurId = agentId || this.requete?.responsable_id || 1; // fallback admin
    } else {
      // L'agent/admin répond -> destinataire = étudiant
      recepteurId = etudiantId;
    }

    if (!recepteurId) {
      console.error('Impossible de déterminer le destinataire');
      this.sending = false;
      return;
    }

    const messageData = {
      contenu: this.newMessage,
      emetteur_id: this.currentUser.id,
      recepteur_id: recepteurId,
      requete_id: this.requeteId
    };

    this.messageService.sendMessage(messageData).subscribe({
      next: () => {
        this.newMessage = '';
        this.sending = false;
        this.loadMessages();
        this.loadConversations(); // Refresh la liste
      },
      error: (err) => {
        console.error('Erreur envoi message', err);
        this.sending = false;
      }
    });
  }

  isMyMessage(message: any): boolean {
    return message.emetteur_id === this.currentUser?.id;
  }

  isActiveConversation(conv: any): boolean {
    return conv.requete_id === this.requeteId;
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  formatTimeAgo(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}
