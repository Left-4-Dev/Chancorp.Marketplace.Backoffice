import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { RoleService, UserRole } from '../services/role.service';

/**
 * UX-only per-role route guard. The APIs enforce roles on every request;
 * this only keeps users away from screens whose calls would be rejected.
 *
 * Usage: `{ path: '', component: X, canActivate: [RoleGuard], data: { role: 'admin' } }`.
 * Runs after AuthGuard (parent route), so the session is already synced.
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private roleService: RoleService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const required = route.data['role'] as UserRole | undefined;
    const current = this.roleService.role;

    if (!current) {
      return this.router.parseUrl('/login');
    }

    if (!required || required === current) {
      return true;
    }

    // Wrong role: send the user to their own dashboard.
    return this.router.parseUrl(current === 'admin' ? '/dashboard' : '/provider/dashboard');
  }
}
