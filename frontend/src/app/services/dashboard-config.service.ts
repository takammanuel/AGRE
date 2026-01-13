import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { BadgeCounterService } from './badge-counter.service';
import { Observable, map } from 'rxjs';

export interface DashboardConfig {
  role: string;
  roleLabel: string;
  primaryColor: string;
  backgroundColor: string;
  menuItems: MenuItem[];
  widgets: WidgetConfig[];
}

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number | null;
  roles: string[];
}

export interface WidgetConfig {
  type: 'stats' | 'chart' | 'list' | 'actions';
  title: string;
  roles: string[];
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardConfigService {
  private authService = inject(AuthService);
  private badgeCounterService = inject(BadgeCounterService);

  getDashboardConfig(): DashboardConfig {
    const user = this.authService.getCurrentUser();
    const primaryRole = user?.roles?.[0] || '';

    const configs: { [key: string]: DashboardConfig } = {
      'ADMINISTRATEUR': this.getAdminConfig(),
      'AGENT_ACADEMIQUE': this.getAgentConfig(),
      'RESPONSABLE_PEDAGOGIQUE': this.getResponsableConfig(),
      'ETUDIANT': this.getEtudiantConfig()
    };

    return configs[primaryRole] || this.getDefaultConfig();
  }

  /**
   * Obtenir les compteurs de badges
   */
  getBadgeCounts(): Observable<any> {
    return this.badgeCounterService.counts$;
  }

  /**
   * Rafraîchir les compteurs
   */
  refreshBadges(): void {
    this.badgeCounterService.refreshCounts();
  }

  /**
   * Configuration Admin
   */
  private getAdminConfig(): DashboardConfig {
    return {
      role: 'ADMINISTRATEUR',
      roleLabel: 'Administrateur',
      primaryColor: 'var(--admin-color)',
      backgroundColor: 'var(--admin-bg)',
      menuItems: [
        { label: 'Tableau de bord', icon: 'bi-speedometer2', route: '/admin', roles: ['ADMINISTRATEUR'] },
        { label: 'Recherche', icon: 'bi-search', route: '/admin/recherche', roles: ['ADMINISTRATEUR'] },
        { label: 'Approbations', icon: 'bi-check-circle', route: '/admin/approbations', roles: ['ADMINISTRATEUR'] },
        { label: 'Requêtes escaladées', icon: 'bi-exclamation-triangle', route: '/admin/requetes-escaladees', roles: ['ADMINISTRATEUR'] },
        { label: 'Utilisateurs', icon: 'bi-people', route: '/admin/utilisateurs', roles: ['ADMINISTRATEUR'] },
        { label: 'Services', icon: 'bi-building', route: '/admin/services', roles: ['ADMINISTRATEUR'] },
        { label: 'Types de requêtes', icon: 'bi-file-earmark-text', route: '/admin/types-requetes', roles: ['ADMINISTRATEUR'] },
        { label: 'Historique', icon: 'bi-clock-history', route: '/admin/historique', roles: ['ADMINISTRATEUR'] },
        { label: 'Statistiques', icon: 'bi-graph-up', route: '/admin/statistiques', roles: ['ADMINISTRATEUR'] },
        { label: 'Mon profil', icon: 'bi-person', route: '/admin/profil', roles: ['ADMINISTRATEUR'] },
      ],
      widgets: [
        { type: 'stats', title: 'Vue d\'ensemble', roles: ['ADMINISTRATEUR'] },
        { type: 'chart', title: 'Statistiques globales', roles: ['ADMINISTRATEUR'] },
        { type: 'list', title: 'Activités récentes', roles: ['ADMINISTRATEUR'] },
      ]
    };
  }

  private getAgentConfig(): DashboardConfig {
    return {
      role: 'AGENT_ACADEMIQUE',
      roleLabel: 'Agent Académique',
      primaryColor: 'var(--agent-color)',
      backgroundColor: 'var(--agent-bg)',
      menuItems: [
        { label: 'Tableau de bord', icon: 'bi-speedometer2', route: '/agent', roles: ['AGENT_ACADEMIQUE'] },
        { label: 'Requêtes affectées', icon: 'bi-inbox', route: '/agent/requetes-affectees', badge: null, roles: ['AGENT_ACADEMIQUE'] },
        { label: 'Requêtes urgentes', icon: 'bi-exclamation-triangle', route: '/agent/urgentes', badge: null, roles: ['AGENT_ACADEMIQUE'] },
        { label: 'Ma messagerie', icon: 'bi-envelope', route: '/agent/messagerie', roles: ['AGENT_ACADEMIQUE'] },
        { label: 'Historique', icon: 'bi-clock-history', route: '/agent/historique', roles: ['AGENT_ACADEMIQUE'] },
        { label: 'Statistiques', icon: 'bi-graph-up', route: '/agent/statistiques', roles: ['AGENT_ACADEMIQUE'] },
        { label: 'Mon profil', icon: 'bi-person', route: '/agent/profil', roles: ['AGENT_ACADEMIQUE'] },
      ],
      widgets: [
        { type: 'stats', title: 'Mes requêtes', roles: ['AGENT_ACADEMIQUE'] },
        { type: 'actions', title: 'Actions rapides', roles: ['AGENT_ACADEMIQUE'] },
        { type: 'list', title: 'Requêtes récentes', roles: ['AGENT_ACADEMIQUE'] },
      ]
    };
  }

  private getResponsableConfig(): DashboardConfig {
    return {
      role: 'RESPONSABLE_PEDAGOGIQUE',
      roleLabel: 'Responsable Pédagogique',
      primaryColor: 'var(--responsable-color)',
      backgroundColor: 'var(--responsable-bg)',
      menuItems: [
        { label: 'Tableau de bord', icon: 'bi-speedometer2', route: '/responsable', roles: ['RESPONSABLE_PEDAGOGIQUE'] },
        { label: 'Recherche', icon: 'bi-search', route: '/responsable/recherche', roles: ['RESPONSABLE_PEDAGOGIQUE'] },
        { label: 'Approbations', icon: 'bi-check-circle', route: '/responsable/approbations', badge: 5, roles: ['RESPONSABLE_PEDAGOGIQUE'] },
        { label: 'Requêtes escaladées', icon: 'bi-arrow-up-circle', route: '/responsable/escaladees', badge: 2, roles: ['RESPONSABLE_PEDAGOGIQUE'] },
        { label: 'Toutes les requêtes', icon: 'bi-list-ul', route: '/responsable/requetes', roles: ['RESPONSABLE_PEDAGOGIQUE'] },
        { label: 'Historique', icon: 'bi-clock-history', route: '/responsable/historique', roles: ['RESPONSABLE_PEDAGOGIQUE'] },
        { label: 'Statistiques', icon: 'bi-graph-up', route: '/responsable/statistiques', roles: ['RESPONSABLE_PEDAGOGIQUE'] },
        { label: 'Mon profil', icon: 'bi-person', route: '/responsable/profil', roles: ['RESPONSABLE_PEDAGOGIQUE'] },
      ],
      widgets: [
        { type: 'stats', title: 'Approbations en attente', roles: ['RESPONSABLE_PEDAGOGIQUE'] },
        { type: 'chart', title: 'Taux d\'approbation', roles: ['RESPONSABLE_PEDAGOGIQUE'] },
        { type: 'list', title: 'Dernières décisions', roles: ['RESPONSABLE_PEDAGOGIQUE'] },
      ]
    };
  }

  private getEtudiantConfig(): DashboardConfig {
    return {
      role: 'ETUDIANT',
      roleLabel: 'Étudiant',
      primaryColor: 'var(--etudiant-color)',
      backgroundColor: 'var(--etudiant-bg)',
      menuItems: [
        { label: 'Accueil', icon: 'bi-house', route: '/etudiant', roles: ['ETUDIANT'] },
        { label: 'Mes requêtes', icon: 'bi-file-earmark-text', route: '/etudiant/mes-requetes', roles: ['ETUDIANT'] },
        { label: 'Nouvelle requête', icon: 'bi-plus-circle', route: '/etudiant/nouvelle-requete', roles: ['ETUDIANT'] },
        { label: 'Notifications', icon: 'bi-bell', route: '/etudiant/notifications', badge: 3, roles: ['ETUDIANT'] },
        { label: 'Mon profil', icon: 'bi-person', route: '/etudiant/profil', roles: ['ETUDIANT'] },
        { label: 'Aide', icon: 'bi-question-circle', route: '/etudiant/aide', roles: ['ETUDIANT'] },
      ],
      widgets: [
        { type: 'stats', title: 'Mes requêtes', roles: ['ETUDIANT'] },
        { type: 'actions', title: 'Actions rapides', roles: ['ETUDIANT'] },
        { type: 'list', title: 'Activités récentes', roles: ['ETUDIANT'] },
      ]
    };
  }

  private getDefaultConfig(): DashboardConfig {
    return {
      role: '',
      roleLabel: 'Utilisateur',
      primaryColor: 'var(--primary-color)',
      backgroundColor: 'var(--neutral-50)',
      menuItems: [],
      widgets: []
    };
  }
}
