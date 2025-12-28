import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { authGuard } from './guards/auth-guard';
import { DashboardEtudiant } from './pages/etudiant/dashboard-etudiant/dashboard-etudiant';
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
      // {
      //   path: '',
      //   redirectTo: 'accueil',
      //   pathMatch: 'full'
      // },
      // {
      //   path: 'accueil',
      //   loadComponent: () => import('./pages/etudiant/accueil/accueil.component').then(m => m.AccueilComponent)
      // },
      // Autres routes enfants à venir...
    ]
  },
  // {
  //   path: 'forgot-password',
  //   loadComponent: () => import('./auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  //   data: { title: 'Mot de passe oublié' }
  // },
  // {
  //   path: 'admin',
  //   canActivate: [authGuard, roleGuard],
  //   data: { roles: ['ADMINISTRATEUR'] },
  //   loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
  //   data: { title: 'Admin Dashboard' }
  // },
  // {
  //   path: 'etudiant',
  //   canActivate: [authGuard, roleGuard],
  //   data: { roles: ['ETUDIANT'] },
  //   loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
  //   data: { title: 'Tableau de bord Étudiant' }
  // },
  // {
  //   path: 'agent',
  //   canActivate: [authGuard, roleGuard],
  //   data: { roles: ['AGENT_ACADEMIQUE'] },
  //   loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
  //   data: { title: 'Tableau de bord Agent' }
  // },
  // {
  //   path: 'responsable',
  //   canActivate: [authGuard, roleGuard],
  //   data: { roles: ['RESPONSABLE_PEDAGOGIQUE'] },
  //   loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
  //   data: { title: 'Tableau de bord Responsable' }
  // },
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
