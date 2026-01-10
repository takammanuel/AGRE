import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { authGuard } from './guards/auth-guard';
import { DashboardEtudiant } from './pages/etudiant/dashboard-etudiant/dashboard-etudiant';
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
    component: DashboardEtudiant,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'accueil',
        pathMatch: 'full'
      },
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
  {
    path: 'admin',
    loadComponent: () => import('./pages/shared/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMINISTRATEUR'] },
    children: [
      {
        path: 'services',
        loadComponent: () => import('./pages/admin/services/services').then(m => m.ServicesComponent)
      },
      {
        path: 'types-requetes',
        loadComponent: () => import('./pages/admin/type-requetes/type-requetes').then(m => m.TypeRequetesComponent)
      },
      {
        path: 'profil',
        loadComponent: () => import('./pages/shared/profile/profile').then(m => m.ProfileComponent)
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
    ]
  },

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
