import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { VaultService } from '../services/vault.service';

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
    return router.createUrlTree(['/unlock']);
  } else {
    return true;
  }
}

export const vaultUnlocked: CanActivateFn = () => {
  const router = inject(Router);
  const vaultService = inject(VaultService);

  if (vaultService.isUnlocked()) {
    return true;
  } else {
    return router.createUrlTree(['/unlock']);
  }
}