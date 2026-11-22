import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ClerkService } from '../services/clerk.service';
import { AuthService } from '../services/auth.service';
import { RoleService } from '../services/role.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private clerkService: ClerkService,
    private authService: AuthService,
    private roleService: RoleService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    // Esperar a que Clerk cargue si aún no lo ha hecho
    if (!this.clerkService.isLoaded) {
      await this.clerkService.init();
    }

    if (!this.clerkService.isSignedIn) {
      this.router.navigate(['/login']);
      return false;
    }

    // Si Clerk está autenticado pero no hay sesión en RoleService, sincronizar
    if (!this.roleService.userId) {
      try {
        const response = await firstValueFrom(this.authService.sync());
        const data = response.data;
        // Only Admin and Provider may use the backoffice.
        if (response.success && data && data.isRegistered && (data.type === 'Admin' || data.type === 'Provider')) {
          this.roleService.setSessionFromSync(data);
          // Force a fresh token so API calls carry the role claim written during sync.
          await this.clerkService.refreshToken();
        } else {
          this.roleService.clearSession();
          await this.clerkService.signOut();
          this.router.navigate(['/login']);
          return false;
        }
      } catch {
        this.roleService.clearSession();
        await this.clerkService.signOut();
        this.router.navigate(['/login']);
        return false;
      }
    }

    return true;
  }
}
