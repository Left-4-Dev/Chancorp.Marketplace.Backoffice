import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, ProviderCategoryDto, AssignCategoriesToProviderRequest } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProviderCategoryService {
  private readonly apiUrl = `${environment.apiUrl}/provider-categories`;

  constructor(private http: HttpClient) {}

  getCategoriesByProvider(providerId: number): Observable<ApiResponse<ProviderCategoryDto>> {
    return this.http.get<ApiResponse<ProviderCategoryDto>>(`${this.apiUrl}/provider/${providerId}`);
  }

  assignCategories(request: AssignCategoriesToProviderRequest): Observable<ApiResponse<ProviderCategoryDto>> {
    return this.http.post<ApiResponse<ProviderCategoryDto>>(this.apiUrl, request);
  }

  removeCategory(providerId: number, categoryId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${providerId}/${categoryId}`);
  }
}
