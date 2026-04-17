import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { SyncResponse, MeResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.authApiUrl}/Auth`;

  constructor(private http: HttpClient) {}

  /** Sincronizar usuario de Clerk con la BD local. Llamar después de cada login. */
  sync(): Observable<ApiResponse<SyncResponse>> {
    return this.http.post<ApiResponse<SyncResponse>>(`${this.apiUrl}/sync`, {});
  }

  /** Debug: retorna los claims del JWT */
  me(): Observable<ApiResponse<MeResponse>> {
    return this.http.get<ApiResponse<MeResponse>>(`${this.apiUrl}/me`);
  }
}
