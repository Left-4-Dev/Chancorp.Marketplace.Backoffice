import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, SubCategoryDto, CreateSubCategoryRequest, UpdateSubCategoryRequest } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubCategoryService {
  private readonly apiUrl = `${environment.apiUrl}/SubCategory`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<SubCategoryDto>> {
    return this.http.get<ApiResponse<SubCategoryDto>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<SubCategoryDto>> {
    return this.http.get<ApiResponse<SubCategoryDto>>(`${this.apiUrl}/${id}`);
  }

  getByCategoryId(categoryId: number): Observable<ApiResponse<SubCategoryDto>> {
    return this.http.get<ApiResponse<SubCategoryDto>>(`${this.apiUrl}/category/${categoryId}`);
  }

  create(subCategory: CreateSubCategoryRequest): Observable<ApiResponse<SubCategoryDto>> {
    return this.http.post<ApiResponse<SubCategoryDto>>(this.apiUrl, subCategory);
  }

  update(id: number, subCategory: UpdateSubCategoryRequest): Observable<ApiResponse<SubCategoryDto>> {
    return this.http.put<ApiResponse<SubCategoryDto>>(`${this.apiUrl}/${id}`, subCategory);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
