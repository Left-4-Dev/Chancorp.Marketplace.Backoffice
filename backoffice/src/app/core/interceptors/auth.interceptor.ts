import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { ClerkService } from '../services/clerk.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private clerkService: ClerkService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.clerkService.getToken()).pipe(
      switchMap(token => {
        if (token) {
          const authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          });
          return next.handle(authReq);
        }
        return next.handle(req);
      })
    );
  }
}
