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
