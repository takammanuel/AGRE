import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[];

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const hasRequiredRole = requiredRoles.some(role =>
    authService.hasRole(role)
  );

  if (hasRequiredRole) {
    return true;
  }

  // Rediriger selon le rôle de l'utilisateur
  const user = authService.getCurrentUser();

  if (user?.roles.includes('ADMINISTRATEUR')) {
    return router.parseUrl('/admin');
  } else if (user?.roles.includes('ETUDIANT')) {
    return router.parseUrl('/etudiant');
  } else if (user?.roles.includes('AGENT_ACADEMIQUE')) {
    return router.parseUrl('/agent');
  } else if (user?.roles.includes('RESPONSABLE_PEDAGOGIQUE')) {
    return router.parseUrl('/responsable');
  }

  return router.parseUrl('/login');
};
