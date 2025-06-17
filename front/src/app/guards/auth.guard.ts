// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (AuthService.isAuthenticated()) {
    return true;
  } else {
    return router.createUrlTree(['/signin']);
  }
};

export const authNoAuthGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (AuthService.isAuthenticated()) {
    return router.createUrlTree(['/home']);
  } else {
    return true;
  }
}