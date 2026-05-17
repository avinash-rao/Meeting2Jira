import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { StateService } from '../services/state.service';

export const configGuard: CanActivateFn = () => {
  const stateService = inject(StateService);
  const router = inject(Router);

  const config = stateService.getJiraConfig();
  
  if (!config) {
    // No config found, redirect to setup
    return router.createUrlTree(['/setup']);
  }
  
  return true;
};

export const setupGuard: CanActivateFn = () => {
  const stateService = inject(StateService);
  const router = inject(Router);

  const config = stateService.getJiraConfig();
  
  if (config) {
    // Already configured, redirect to upload
    return router.createUrlTree(['/upload']);
  }
  
  return true;
};

// Made with Bob