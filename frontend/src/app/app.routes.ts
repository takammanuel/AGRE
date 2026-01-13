import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';
import { DashboardEtudiant } from './pages/etudiant/dashboard-etudiant/dashboard-etudiant';
import { MessagerieComponent } from './pages/etudiant/messagerie/messagerie';
import { NotificationsListComponent } from './pages/etudiant/notifications-list/notifications-list';
import { MesRequetesComponent } from './pages/etudiant/mes-requetes/mes-requetes';
import { HistoriqueComponent } from './pages/etudiant/historique/historique';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // ESPACE ETUDIANT
  {
    path: 'etudiant',
    loadComponent: () => import('./pages/shared/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ETUDIANT'] },
    children: [
      { path: 'notifications', component: NotificationsListComponent },
      { path: 'mes-requetes', component: MesRequetesComponent },
      { path: 'historique', component: HistoriqueComponent },
      { path: 'messagerie', component: MessagerieComponent },
      { path: 'messagerie/:id', component: MessagerieComponent },
      {
        path: 'profil',
        loadComponent: () => import('./pages/shared/profile/profile').then(m => m.ProfileComponent)
      },
      {
        path: 'nouvelle-requete',
        loadComponent: () => import('./pages/etudiant/nouvelle-requete/nouvelle-requete').then(m => m.NouvelleRequeteComponent)
      },
      {
        path: 'mes-requetes',
        loadComponent: () => import('./pages/etudiant/mes-requetes/mes-requetes').then(m => m.MesRequetesComponent)
      },
      {
        path: 'requete/:id',
        loadComponent: () => import('./pages/etudiant/requete-detail/requete-detail').then(m => m.RequeteDetailComponent)
      },
    ]
  },

  // ESPACE ADMIN
  {
    path: 'admin',
    loadComponent: () => import('./pages/shared/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMINISTRATEUR'] },
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin/dashboard-home/dashboard-home.component').then(m => m.AdminDashboardHomeComponent)
      },
      {
        path: 'recherche',
        loadComponent: () => import('./pages/admin/recherche/recherche').then(m => m.Recherche)
      },
      {
        path: 'approbations',
        loadComponent: () => import('./pages/admin/approbations/approbations.component').then(m => m.ApprobationsComponent)
      },
      {
        path: 'requetes-escaladees',
        loadComponent: () => import('./pages/admin/requetes-escaladees/requetes-escaladees.component').then(m => m.RequetesEscaladeesComponent)
      },
      {
        path: 'utilisateurs',
        loadComponent: () => import('./pages/admin/utilisateurs/utilisateurs.component').then(m => m.UtilisateursComponent)
      },
      {
        path: 'historique',
        loadComponent: () => import('./pages/admin/historique/historique.component').then(m => m.AdminHistoriqueComponent)
      },
      {
        path: 'statistiques',
        loadComponent: () => import('./pages/admin/statistiques/statistiques.component').then(m => m.AdminStatistiquesComponent)
      },
      {
        path: 'profil',
        loadComponent: () => import('./pages/admin/profil/profil.component').then(m => m.AdminProfilComponent)
      },
      {
        path: 'services',
        loadComponent: () => import('./pages/admin/services/services').then(m => m.Services)
      },
      {
        path: 'types-requetes',
        loadComponent: () => import('./pages/admin/type-requetes/type-requetes').then(m => m.TypeRequetes)
      },
      {
        path: 'profil',
        loadComponent: () => import('./pages/shared/profile/profile').then(m => m.ProfileComponent)
      },
      { path: '', redirectTo: 'services', pathMatch: 'full' },
    ]
  },

  // ESPACE AGENT
  {
    path: 'agent',
    loadComponent: () => import('./pages/shared/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['AGENT_ACADEMIQUE'] },
    children: [
      {
        path: 'requetes',
        loadComponent: () => import('./pages/agent/liste-requetes/liste-requetes').then(m => m.ListeRequetesAgentComponent)
      },
      {
        path: 'profil',
        loadComponent: () => import('./pages/shared/profile/profile').then(m => m.ProfileComponent)
      },
      {
        path: 'requetes-affectees',
        loadComponent: () => import('./pages/agent/requetes-affectees/requetes-affectees').then(m => m.RequetesAffecteesComponent)
      },
      {
        path: 'requete/:id',
        loadComponent: () => import('./pages/agent/requete-detail/requete-detail').then(m => m.RequeteDetailAgentComponent)
      },
      {
        path: 'requete/:id/traiter',
        loadComponent: () => import('./pages/agent/requete-traiter/requete-traiter').then(m => m.RequeteTraiterComponent)
      },
      // { path: 'messagerie', component: MessagerieComponent },
      {
        path: 'recherche',
        loadComponent: () => import('./pages/agent/recherche/recherche').then(m => m.Recherche)
      },
      {
        path: 'urgentes',
        loadComponent: () => import('./pages/agent/requetes-urgentes/requetes-urgentes.component').then(m => m.AgentRequetesUrgentesComponent)
      },
      {
        path: 'messagerie',
        loadComponent: () => import('./pages/agent/messagerie/messagerie.component').then(m => m.AgentMessagerieComponent)
      },
      {
        path: 'historique',
        loadComponent: () => import('./pages/agent/historique/historique.component').then(m => m.AgentHistoriqueComponent)
      },
      {
        path: 'statistiques',
        loadComponent: () => import('./pages/agent/statistiques/statistiques.component').then(m => m.AgentStatistiquesComponent)
      }
    ]
  },

  // ESPACE RESPONSABLE
  {
    path: 'responsable',
    loadComponent: () => import('./pages/shared/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['RESPONSABLE_PEDAGOGIQUE'] },
    children: [
      {
        path: 'profil',
        loadComponent: () => import('./pages/shared/profile/profile').then(m => m.ProfileComponent)
      },
      {
        path: 'approbations',
        loadComponent: () => import('./pages/responsable/pending-approvals/pending-approvals').then(m => m.PendingApprovalsComponent)
      },
      {
        path: 'requete/:id',
        loadComponent: () => import('./pages/responsable/requete-detail/requete-detail').then(m => m.RequeteDetailResponsableComponent)
      },
      {
        path: 'recherche',
        loadComponent: () => import('./responsable/recherche/recherche').then(m => m.ResponsableRechercheComponent)
      },
      {
        path: 'approbations',
        loadComponent: () => import('./responsable/approbations/approbations').then(m => m.ResponsableApprobationsComponent)
      },
      {
        path: 'escaladees',
        loadComponent: () => import('./responsable/requetes-escaladees/requetes-escaladees').then(m => m.ResponsableRequetesEscaladeesComponent)
      },
      // {
      //   path: 'requetes',
      //   loadComponent: () => import('./responsable/requetes/requetes').then(m => m.ResponsableRequetesComponent)
      // },
      {
        path: 'historique',
        loadComponent: () => import('./responsable/historique/historique').then(m => m.ResponsableHistoriqueComponent)
      },
      {
        path: 'statistiques',
        loadComponent: () => import('./responsable/statistiques/statistiques').then(m => m.ResponsableStatistiquesComponent)
      },
    ]
  },

  // REDIRECTIONS
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
