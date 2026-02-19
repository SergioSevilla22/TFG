import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const role = authService.getUserRole();

  // Permitimos ambos tipos de admin
  if (role === 'admin_plataforma' || role === 'admin_club') {
    return true;
  }

  // Si no es admin, fuera
  router.navigate(['/home']);
  return false;
};
