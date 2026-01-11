import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';
// import { authGuard } from './guards/auth.guard';
// import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Connexion' }
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: { title: 'Inscription' }
  },
  {
    path: 'etudiant',
    loadComponent: () => import('./pages/shared/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ETUDIANT'] },
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/etudiant/dashboard-home/dashboard-home.component').then(m => m.EtudiantDashboardHomeComponent)
      },
      {
        path: 'recherche',
        loadComponent: () => import('./pages/etudiant/recherche/recherche').then(m => m.Recherche)
      },
      {
        path: 'requetes',
        loadComponent: () => import('./pages/etudiant/mes-requetes/mes-requetes.component').then(m => m.MesRequetesComponent)
      },
      {
        path: 'requetes/:id',
        loadComponent: () => import('./pages/etudiant/requete-details/requete-details.component').then(m => m.EtudiantRequeteDetailsComponent)
      },
      {
        path: 'nouvelle-requete',
        loadComponent: () => import('./pages/etudiant/nouvelle-requete/nouvelle-requete.component').then(m => m.NouvelleRequeteComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/etudiant/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      {
        path: 'profil',
        loadComponent: () => import('./pages/etudiant/profil/profil.component').then(m => m.EtudiantProfilComponent)
      },
      {
        path: 'aide',
        loadComponent: () => import('./pages/etudiant/aide/aide.component').then(m => m.AideComponent)
      }
    ]
  },
  // {
  //   path: 'forgot-password',
  //   loadComponent: () => import('./auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  //   data: { title: 'Mot de passe oublié' }
  // },
  // {
  //   path: 'etudiant',
  //   loadComponent: () => import('./pages/etudiant/dashboard-etudiant/dashboard-etudiant.component').then(m => m.DashboardEtudiantComponent),
  //   canActivate: [authGuard, roleGuard],
  //   data: { roles: ['ETUDIANT'] },
  //   children: [
  //     {
  //       path: '',
  //       loadComponent: () => import('./pages/etudiant/accueil/accueil.component').then(m => m.AccueilComponent)
  //     },
  //     // ... autres routes étudiant
  //   ]
  // },

  // Dashboards Admin, Agent, Responsable (layout unifié)
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
        loadComponent: () => import('./pages/admin/services/services').then(m => m.ServicesComponent)
      },
      {
        path: 'types-requetes',
        loadComponent: () => import('./pages/admin/type-requetes/type-requetes').then(m => m.TypeRequetesComponent)
      },
    ]
  },

  {
    path: 'agent',
    loadComponent: () => import('./pages/shared/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['AGENT_ACADEMIQUE'] },
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/agent/dashboard-home/dashboard-home.component').then(m => m.AgentDashboardHomeComponent)
      },
      {
        path: 'recherche',
        loadComponent: () => import('./pages/agent/recherche/recherche').then(m => m.Recherche)
      },
      {
        path: 'requetes',
        loadComponent: () => import('./pages/agent/requetes/requetes.component').then(m => m.AgentRequetesComponent)
      },
      {
        path: 'requetes/:id',
        loadComponent: () => import('./pages/agent/requete-details/requete-details.component').then(m => m.RequeteDetailsComponent)
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
      },
      {
        path: 'profil',
        loadComponent: () => import('./pages/agent/profil/profil.component').then(m => m.AgentProfilComponent)
      }
    ]
  },

  {
    path: 'responsable',
    loadComponent: () => import('./pages/shared/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['RESPONSABLE_PEDAGOGIQUE'] },
    children: [
      {
        path: '',
        loadComponent: () => import('./responsable/dashboard-home/dashboard-home').then(m => m.ResponsableDashboardHomeComponent)
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
      {
        path: 'requetes',
        loadComponent: () => import('./responsable/requetes/requetes').then(m => m.ResponsableRequetesComponent)
      },
      {
        path: 'requetes/:id',
        loadComponent: () => import('./responsable/requete-details/requete-details').then(m => m.ResponsableRequeteDetailsComponent)
      },
      {
        path: 'historique',
        loadComponent: () => import('./responsable/historique/historique').then(m => m.ResponsableHistoriqueComponent)
      },
      {
        path: 'statistiques',
        loadComponent: () => import('./responsable/statistiques/statistiques').then(m => m.ResponsableStatistiquesComponent)
      },
      {
        path: 'profil',
        loadComponent: () => import('./responsable/profil/profil').then(m => m.ResponsableProfilComponent)
      }
    ]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
