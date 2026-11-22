import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';
import { SyncResponse, ProviderProfile } from '../models/auth.model';

export type UserRole = 'admin' | 'provider';

export interface UserSession {
  role: UserRole;
  userId: number | null;
  providerId: number | null;
  displayName: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  // No role until the backend sync confirms Admin or Provider (null = unauthenticated).
  private currentSession$ = new BehaviorSubject<UserSession | null>(null);

  // Emits only confirmed sessions, so subscribers never see a role that was not verified.
  session$ = this.currentSession$.pipe(
    filter((session): session is UserSession => session !== null)
  );

  constructor(private router: Router) {}

  get session(): UserSession | null {
    return this.currentSession$.value;
  }

  get role(): UserRole | null {
    return this.session?.role ?? null;
  }

  get isAdmin(): boolean {
    return this.role === 'admin';
  }

  get isProvider(): boolean {
    return this.role === 'provider';
  }

  get providerId(): number {
    return this.session?.providerId ?? 0;
  }

  get userId(): number {
    return this.session?.userId ?? 0;
  }

  /** Establecer sesión desde la respuesta del endpoint /api/Auth/sync */
  setSessionFromSync(syncData: SyncResponse): void {
    if (syncData.type === 'Admin') {
      this.currentSession$.next({
        role: 'admin',
        userId: syncData.userId ?? null,
        providerId: null,
        displayName: 'Administrador',
        email: syncData.email
      });
    } else if (syncData.type === 'Provider') {
      const providerProfile = syncData.profile as ProviderProfile | undefined;
      this.currentSession$.next({
        role: 'provider',
        userId: syncData.userId ?? null,
        providerId: providerProfile?.providerId ?? null,
        displayName: providerProfile?.enterpriseName ?? syncData.email,
        email: syncData.email
      });
    }
  }

  /** Limpiar sesión al hacer logout */
  clearSession(): void {
    this.currentSession$.next(null);
  }

  updateDisplayName(name: string): void {
    const session = this.session;
    if (!session) return;
    this.currentSession$.next({ ...session, displayName: name });
  }
}
