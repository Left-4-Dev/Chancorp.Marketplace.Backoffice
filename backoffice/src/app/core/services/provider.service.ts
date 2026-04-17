import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedData, ProviderDto, CreateProviderRequest, UpdateProviderRequest } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {
  private readonly apiUrl = `${environment.usersApiUrl}/Provider`;
  private readonly usersApiUrl = `${environment.usersApiUrl}/Users`;

  constructor(private http: HttpClient) {}

  getAll(pageNumber: number = 1, pageSize: number = 10): Observable<ApiResponse<PaginatedData<ProviderDto>>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ApiResponse<PaginatedData<ProviderDto>>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<ProviderDto>> {
    return this.http.get<ApiResponse<ProviderDto>>(`${this.apiUrl}/${id}`);
  }

  create(provider: CreateProviderRequest): Observable<ApiResponse<ProviderDto>> {
    return this.http.post<ApiResponse<ProviderDto>>(this.apiUrl, provider);
  }

  update(provider: UpdateProviderRequest): Observable<ApiResponse<ProviderDto>> {
    return this.http.put<ApiResponse<ProviderDto>>(this.apiUrl, provider);
  }

  delete(userId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.usersApiUrl}/${userId}`);
  }
}
