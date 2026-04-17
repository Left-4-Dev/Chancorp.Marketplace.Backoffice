import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, SpecialityDto, CreateSpecialityRequest, UpdateSpecialityRequest } from '../models';
import { environment } from '../../../environments/environment';

export interface SpecialityPaginatedResult {
  items: SpecialityDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class SpecialityService {
  private readonly apiUrl = `${environment.apiUrl}/Speciality`;

  constructor(private http: HttpClient) {}

  getAll(pageNumber: number = 1, pageSize: number = 50): Observable<ApiResponse<SpecialityPaginatedResult>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<ApiResponse<SpecialityPaginatedResult>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<SpecialityDto>> {
    return this.http.get<ApiResponse<SpecialityDto>>(`${this.apiUrl}/${id}`);
  }

  getBySubCategoryId(subCategoryId: number): Observable<ApiResponse<SpecialityDto>> {
    return this.http.get<ApiResponse<SpecialityDto>>(`${this.apiUrl}/subcategory/${subCategoryId}`);
  }

  create(speciality: CreateSpecialityRequest): Observable<ApiResponse<SpecialityDto>> {
    return this.http.post<ApiResponse<SpecialityDto>>(this.apiUrl, speciality);
  }

  update(id: number, speciality: UpdateSpecialityRequest): Observable<ApiResponse<SpecialityDto>> {
    return this.http.put<ApiResponse<SpecialityDto>>(`${this.apiUrl}/${id}`, speciality);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
