import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
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
  private currentSession$ = new BehaviorSubject<UserSession>({
    role: 'admin',
    userId: null,
    providerId: null,
    displayName: '',
    email: ''
  });

  session$ = this.currentSession$.asObservable();

  constructor(private router: Router) {}

  get session(): UserSession {
    return this.currentSession$.value;
  }

  get role(): UserRole {
    return this.session.role;
  }

  get isAdmin(): boolean {
    return this.role === 'admin';
  }

  get isProvider(): boolean {
    return this.role === 'provider';
  }

  get providerId(): number {
    return this.session.providerId ?? 0;
  }

  get userId(): number {
    return this.session.userId ?? 0;
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
    this.currentSession$.next({
      role: 'admin',
      userId: null,
      providerId: null,
      displayName: '',
      email: ''
    });
  }

  updateDisplayName(name: string): void {
    this.currentSession$.next({ ...this.session, displayName: name });
  }
}
