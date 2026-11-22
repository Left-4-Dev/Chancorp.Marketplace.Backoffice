import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClerkService } from '../../core/services/clerk.service';
import { AuthService } from '../../core/services/auth.service';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('signInContainer') signInContainer!: ElementRef<HTMLDivElement>;

  loading = true;
  syncing = false;
  error = '';

  private signedInSub!: Subscription;

  constructor(
    private clerkService: ClerkService,
    private authService: AuthService,
    private roleService: RoleService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initClerk();
  }

  ngAfterViewInit(): void {
    // Se monta el sign-in después de que Clerk cargue y la vista esté lista
  }

  ngOnDestroy(): void {
    this.signedInSub?.unsubscribe();
    if (this.signInContainer?.nativeElement) {
      this.clerkService.unmountSignIn(this.signInContainer.nativeElement);
    }
  }

  private async initClerk(): Promise<void> {
    try {
      await this.clerkService.init();
      this.loading = false;
      this.cdr.detectChanges();

      // Si ya está logueado, sincronizar y redirigir
      if (this.clerkService.isSignedIn) {
        this.syncAndRedirect();
        return;
      }

      // Montar el formulario de sign-in de Clerk
      setTimeout(() => {
        if (this.signInContainer?.nativeElement) {
          this.clerkService.mountSignIn(this.signInContainer.nativeElement);
        }
      });

      // Escuchar cuando el usuario se loguee
      this.signedInSub = this.clerkService.isSignedIn$.subscribe(signedIn => {
        if (signedIn && !this.syncing) {
          this.syncAndRedirect();
        }
      });
    } catch (err) {
      this.loading = false;
      this.error = 'Error al inicializar la autenticación. Intente recargar la página.';
      console.error('Clerk init error:', err);
    }
  }

  private syncAndRedirect(): void {
    this.syncing = true;
    this.error = '';

    this.authService.sync().subscribe({
      next: async (response) => {
        if (!response.success || !response.data) {
          this.error = response.mensaje || 'Error al sincronizar el usuario';
          this.syncing = false;
          return;
        }

        const syncData = response.data;

        if (!syncData.isRegistered) {
          this.error = 'Tu cuenta no está registrada en el sistema. Contacta al administrador.';
          this.syncing = false;
          this.clerkService.signOut();
          return;
        }

        // Solo Admin y Provider tienen acceso al backoffice
        if (syncData.type !== 'Admin' && syncData.type !== 'Provider') {
          this.error = 'No tienes permisos para acceder al panel de administración.';
          this.syncing = false;
          this.clerkService.signOut();
          return;
        }

        // Establecer sesión real en RoleService
        this.roleService.setSessionFromSync(syncData);

        // Forzar un token nuevo para que las llamadas a la API incluyan el claim `role` escrito durante el sync
        await this.clerkService.refreshToken();

        // Redirigir según tipo
        if (syncData.type === 'Admin') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/provider/products']);
        }

        this.syncing = false;
      },
      error: (err) => {
        this.error = 'Error de conexión al sincronizar. Verifique que el servidor esté activo.';
        this.syncing = false;
        console.error('Sync error:', err);
      }
    });
  }
}
