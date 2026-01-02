import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { authGuard } from './guards/auth-guard';
import { DashboardEtudiant } from './pages/etudiant/dashboard-etudiant/dashboard-etudiant';
import { MessagerieComponent } from './pages/etudiant/messagerie/messagerie';

// LE CHEMIN CORRIGÉ : On retire "layout" car le dossier est directement dans etudiant
import { NotificationsListComponent } from './pages/etudiant/notifications-list/notifications-list';
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
      { path: 'messagerie', component: MessagerieComponent },
      { path: '', redirectTo: 'notifications', pathMatch: 'full' },
    ]
  },

  // AJOUTE CES ROUTES (Exemple avec DashboardEtudiant pour tester la redirection)
  // Remplace DashboardEtudiant par tes vrais composants Agent/Admin plus tard
  {
    path: 'agent',
    component: DashboardEtudiant, // <--- Change par AgentDashboardComponent dès que possible
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    component: DashboardEtudiant, // <--- Change par AdminDashboardComponent
    canActivate: [authGuard]
  },
  {
    path: 'responsable',
    component: DashboardEtudiant,
    canActivate: [authGuard]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
