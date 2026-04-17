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
        if (response.success && response.data && response.data.isRegistered) {
          this.roleService.setSessionFromSync(response.data);
        } else {
          await this.clerkService.signOut();
          this.router.navigate(['/login']);
          return false;
        }
      } catch {
        await this.clerkService.signOut();
        this.router.navigate(['/login']);
        return false;
      }
    }

    return true;
  }
}
