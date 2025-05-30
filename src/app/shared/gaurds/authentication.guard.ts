import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authenticationGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');

  if (user) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};