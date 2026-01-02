import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../../services/message';
import { AuthService } from '../../../services/auth.service';
import { Message } from '../../../models/communication';

@Component({
  selector: 'app-messagerie',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messagerie.html',
  styleUrls: ['./messagerie.css']
})
export class MessagerieComponent implements OnInit {
  private messageService = inject(MessageService);
  private authService = inject(AuthService);

  messages: Message[] = [];
  nouveauMessage: string = '';
  etudiantId: number | null = null;

  ngOnInit(): void {
    // Récupération de l'utilisateur connecté via ton AuthService
    const user = this.authService.getCurrentUser();
    this.etudiantId = user ? user.id : null;

    this.chargerDiscussion();
  }

  chargerDiscussion(): void {
    this.messageService.getMessages().subscribe({
      next: (data) => {
        this.messages = Array.isArray(data) ? data : [];
        this.scrollToBottom();
      },
      error: (err) => console.error('Erreur chargement:', err)
    });
  }

  envoyer(): void {
    // Vérification de sécurité avant l'envoi
    if (!this.nouveauMessage.trim() || this.etudiantId === null) {
      console.error("Impossible d'envoyer : message vide ou utilisateur non connecté");
      return;
    }

    const texteAEnvoyer = this.nouveauMessage;
    this.nouveauMessage = ''; // Vide l'input pour l'UX

    // Envoi avec emetteur_id et recepteur_id
    this.messageService.sendMessage(texteAEnvoyer, this.etudiantId, 1).subscribe({
      next: (msg) => {
        // On s'assure que le message a l'ID pour s'afficher à droite
        if (!msg.emetteur_id) msg.emetteur_id = this.etudiantId as number;

        this.messages.push(msg);
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Erreur de validation (422):', err.error.errors);
        this.nouveauMessage = texteAEnvoyer; // Restaure le texte en cas d'échec
        alert("Erreur serveur : " + JSON.stringify(err.error.errors));
      }
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const chatBox = document.getElementById('chat-box');
      if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    }, 100);
  }
}
