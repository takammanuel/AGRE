import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagerieService, Conversation, Message, ConversationDetail, Etudiant } from '../../../services/messagerie.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-agent-messagerie',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messagerie.component.html',
  styleUrls: ['./messagerie.component.scss']
})
export class AgentMessagerieComponent implements OnInit {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  private messagerieService = inject(MessagerieService);
  private authService = inject(AuthService);
  
  conversations: Conversation[] = [];
  selectedConversation: ConversationDetail | null = null;
  selectedUserId: number | null = null;
  
  etudiants: Etudiant[] = [];
  showNewMessageModal = false;
  selectedEtudiant: number | null = null;
  
  newMessage = '';
  loading = true;
  loadingMessages = false;
  sending = false;
  error: string | null = null;
  
  currentUserId: number = 0;

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserId = user?.id || 0;
    
    this.loadConversations();
    this.loadEtudiants();
  }

  loadConversations(): void {
    this.loading = true;
    this.error = null;
    
    this.messagerieService.getConversations().subscribe({
      next: (response) => {
        this.conversations = response.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des conversations:', err);
        this.error = 'Impossible de charger les conversations';
        this.loading = false;
      }
    });
  }

  loadEtudiants(): void {
    this.messagerieService.getEtudiants().subscribe({
      next: (response) => {
        this.etudiants = response.data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des étudiants:', err);
      }
    });
  }

  selectConversation(userId: number): void {
    this.selectedUserId = userId;
    this.loadingMessages = true;
    
    this.messagerieService.getConversation(userId).subscribe({
      next: (response) => {
        this.selectedConversation = response.data;
        this.loadingMessages = false;
        
        // Mettre à jour le compteur non lu dans la liste
        const conv = this.conversations.find(c => c.user_id === userId);
        if (conv) {
          conv.unread_count = 0;
          conv.is_read = true;
        }
        
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la conversation:', err);
        this.loadingMessages = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedUserId) return;
    
    this.sending = true;
    
    this.messagerieService.sendMessage({
      destinataire_id: this.selectedUserId,
      contenu: this.newMessage.trim()
    }).subscribe({
      next: (response) => {
        // Ajouter le message à la conversation
        if (this.selectedConversation) {
          this.selectedConversation.messages.push(response.data);
        }
        
        // Mettre à jour la liste des conversations
        this.updateConversationList(response.data);
        
        this.newMessage = '';
        this.sending = false;
        
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        console.error('Erreur lors de l\'envoi du message:', err);
        this.sending = false;
      }
    });
  }

  onEnterPress(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  startNewConversation(): void {
    this.showNewMessageModal = true;
  }

  closeNewMessageModal(): void {
    this.showNewMessageModal = false;
    this.selectedEtudiant = null;
  }

  selectEtudiantForNewMessage(etudiantId: number): void {
    this.selectedEtudiant = etudiantId;
    this.showNewMessageModal = false;
    
    // Vérifier si une conversation existe déjà
    const existingConv = this.conversations.find(c => c.user_id === etudiantId);
    if (existingConv) {
      this.selectConversation(etudiantId);
    } else {
      // Créer une nouvelle conversation vide
      const etudiant = this.etudiants.find(e => e.id === etudiantId);
      if (etudiant) {
        this.selectedUserId = etudiantId;
        this.selectedConversation = {
          user: {
            id: etudiant.id,
            nom: etudiant.nom,
            prenom: etudiant.prenom,
            email: etudiant.email
          },
          messages: []
        };
      }
    }
  }

  private updateConversationList(message: Message): void {
    const otherUserId = message.recepteur_id === this.currentUserId 
      ? message.emetteur_id 
      : message.recepteur_id;
    
    const conv = this.conversations.find(c => c.user_id === otherUserId);
    
    if (conv) {
      conv.last_message = message.contenu;
      conv.last_message_date = message.created_at;
      
      // Déplacer en haut de la liste
      this.conversations = [
        conv,
        ...this.conversations.filter(c => c.user_id !== otherUserId)
      ];
    } else {
      // Recharger les conversations
      this.loadConversations();
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Erreur lors du scroll:', err);
    }
  }

  isMyMessage(message: Message): boolean {
    return message.emetteur_id === this.currentUserId;
  }

  formatDate(date: string): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Hier';
    } else if (days < 7) {
      return d.toLocaleDateString('fr-FR', { weekday: 'long' });
    } else {
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  }
}
