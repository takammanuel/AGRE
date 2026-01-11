import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface FAQ {
  question: string;
  answer: string;
  category: string;
  expanded?: boolean;
}

@Component({
  selector: 'app-aide',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './aide.component.html',
  styleUrls: ['./aide.component.scss']
})
export class AideComponent {
  selectedCategory: string = 'all';
  
  categories = [
    { id: 'all', label: 'Toutes', icon: 'bi-grid' },
    { id: 'requetes', label: 'Requêtes', icon: 'bi-file-earmark-text' },
    { id: 'compte', label: 'Compte', icon: 'bi-person' },
    { id: 'notifications', label: 'Notifications', icon: 'bi-bell' },
    { id: 'technique', label: 'Technique', icon: 'bi-gear' }
  ];

  faqs: FAQ[] = [
    {
      question: 'Comment créer une nouvelle requête ?',
      answer: 'Pour créer une nouvelle requête, cliquez sur le bouton "Nouvelle requête" dans le menu ou sur la page d\'accueil. Remplissez le formulaire en sélectionnant le type de requête, en ajoutant une description détaillée et en joignant les documents nécessaires si besoin.',
      category: 'requetes'
    },
    {
      question: 'Quels types de requêtes puis-je soumettre ?',
      answer: 'Vous pouvez soumettre différents types de requêtes : certificat de scolarité, relevé de notes, attestation de stages, demande de bourse, certificat du diplôme, changement de filière, et réévaluation de note.',
      category: 'requetes'
    },
    {
      question: 'Combien de temps faut-il pour traiter ma requête ?',
      answer: 'Le délai de traitement varie selon le type de requête. En général, les requêtes standards sont traitées sous 3-5 jours ouvrables. Les requêtes urgentes sont prioritaires et traitées plus rapidement.',
      category: 'requetes'
    },
    {
      question: 'Comment suivre l\'état de ma requête ?',
      answer: 'Vous pouvez suivre l\'état de vos requêtes dans la section "Mes requêtes". Chaque requête affiche son statut actuel (En attente, En cours, Traitée, Rejetée) et vous recevez des notifications à chaque changement d\'état.',
      category: 'requetes'
    },
    {
      question: 'Puis-je annuler une requête après l\'avoir soumise ?',
      answer: 'Une fois soumise, une requête ne peut pas être annulée directement. Contactez le service concerné via la messagerie pour demander l\'annulation de votre requête.',
      category: 'requetes'
    },
    {
      question: 'Comment modifier mes informations personnelles ?',
      answer: 'Allez dans "Mon profil" depuis le menu. Vous pouvez y modifier votre nom, prénom, email et numéro de téléphone. N\'oubliez pas de cliquer sur "Enregistrer les modifications".',
      category: 'compte'
    },
    {
      question: 'Comment changer mon mot de passe ?',
      answer: 'Dans la section "Mon profil", cliquez sur "Changer le mot de passe". Entrez votre mot de passe actuel, puis votre nouveau mot de passe (minimum 8 caractères) et confirmez-le.',
      category: 'compte'
    },
    {
      question: 'J\'ai oublié mon mot de passe, que faire ?',
      answer: 'Sur la page de connexion, cliquez sur "Mot de passe oublié". Suivez les instructions pour réinitialiser votre mot de passe via email.',
      category: 'compte'
    },
    {
      question: 'Comment activer les notifications ?',
      answer: 'Les notifications sont activées par défaut. Vous recevez une notification à chaque changement d\'état de vos requêtes. Consultez-les dans la section "Notifications".',
      category: 'notifications'
    },
    {
      question: 'Pourquoi je ne reçois pas de notifications ?',
      answer: 'Vérifiez que les notifications ne sont pas bloquées dans votre navigateur. Assurez-vous également que votre email est correct dans votre profil.',
      category: 'notifications'
    },
    {
      question: 'Quels formats de fichiers puis-je joindre ?',
      answer: 'Vous pouvez joindre des fichiers PDF, DOC, DOCX, JPG et PNG. La taille maximale par fichier est de 10 Mo.',
      category: 'technique'
    },
    {
      question: 'Le site ne fonctionne pas correctement, que faire ?',
      answer: 'Essayez de vider le cache de votre navigateur et de vous reconnecter. Si le problème persiste, contactez le support technique.',
      category: 'technique'
    }
  ];

  get filteredFaqs(): FAQ[] {
    if (this.selectedCategory === 'all') {
      return this.faqs;
    }
    return this.faqs.filter(faq => faq.category === this.selectedCategory);
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
  }

  toggleFaq(faq: FAQ): void {
    faq.expanded = !faq.expanded;
  }
}
