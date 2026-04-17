import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Clerk se carga desde CDN (index.html) para incluir componentes UI
declare global {
  interface Window {
    Clerk?: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ClerkService {
  private _isLoaded$ = new BehaviorSubject<boolean>(false);
  private _isSignedIn$ = new BehaviorSubject<boolean>(false);

  isLoaded$: Observable<boolean> = this._isLoaded$.asObservable();
  isSignedIn$: Observable<boolean> = this._isSignedIn$.asObservable();

  get isLoaded(): boolean {
    return this._isLoaded$.value;
  }

  get isSignedIn(): boolean {
    return this._isSignedIn$.value;
  }

  get user() {
    return window.Clerk?.user ?? null;
  }

  private get clerk(): any {
    return window.Clerk ?? null;
  }

  async init(): Promise<void> {
    // Esperar a que el script CDN cargue Clerk en window.Clerk
    await this.waitForClerk();

    // Esperar a que Clerk esté completamente cargado (puede que aún esté initializándose)
    if (!this.clerk.loaded) {
      await this.clerk.load({
        appearance: {
          variables: {
            colorPrimary: '#5B4B8A'
          }
        }
      });
    }

    this._isLoaded$.next(true);
    this._isSignedIn$.next(!!this.clerk.user);

    this.clerk.addListener((emission: any) => {
      this._isSignedIn$.next(!!emission.user);
    });
  }

  private waitForClerk(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Clerk) {
        resolve();
        return;
      }
      // Polling hasta que el script CDN cargue
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.Clerk) {
          clearInterval(interval);
          resolve();
        } else if (attempts > 100) { // ~10 segundos
          clearInterval(interval);
          reject(new Error('Clerk no pudo cargarse desde CDN'));
        }
      }, 100);
    });
  }

  async getToken(): Promise<string | null> {
    if (!this.clerk?.session) return null;
    try {
      return await this.clerk.session.getToken();
    } catch {
      return null;
    }
  }

  mountSignIn(element: HTMLDivElement): void {
    this.clerk?.mountSignIn(element, {
      appearance: {
        variables: {
          colorPrimary: '#5B4B8A'
        },
        elements: {
          // Ocultar botones de OAuth (Google, Apple, etc.)
          socialButtonsBlockButton: { display: 'none' },
          socialButtonsBlockButtonArrow: { display: 'none' },
          socialButtonsProviderIcon: { display: 'none' },
          dividerRow: { display: 'none' },
          // Ocultar link de "Sign up"
          footerActionLink: { display: 'none' },
          footerActionText: { display: 'none' },
          footer: { display: 'none' }
        }
      },
      signUpUrl: undefined,
      withSignUp: false
    });
  }

  unmountSignIn(element: HTMLDivElement): void {
    this.clerk?.unmountSignIn(element);
  }

  async signOut(): Promise<void> {
    await this.clerk?.signOut();
    this._isSignedIn$.next(false);
  }
}
