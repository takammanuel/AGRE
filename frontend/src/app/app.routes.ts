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
    component: DashboardEtudiant,
    canActivate: [authGuard],
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
      { path: '', redirectTo: 'mes-requetes', pathMatch: 'full' },
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
      { path: '', redirectTo: 'requetes', pathMatch: 'full' },
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
        path: '',
        loadComponent: () => import('./pages/shared/profile/profile').then(m => m.ProfileComponent)
      },
    ]
  },

  // REDIRECTIONS
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
