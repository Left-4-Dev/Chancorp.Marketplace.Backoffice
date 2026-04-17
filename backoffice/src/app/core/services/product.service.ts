import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, ProductDto } from '../models';
import { environment } from '../../../environments/environment';

export interface ProductPaginatedResult {
  items: ProductDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/Products`;

  constructor(private http: HttpClient) {}

  getAll(
    providerId: number,
    specialityId: number,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<ApiResponse<ProductPaginatedResult>> {
    const params = new HttpParams()
      .set('providerId', providerId.toString())
      .set('specialityId', specialityId.toString())
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ApiResponse<ProductPaginatedResult>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<ApiResponse<ProductDto>> {
    return this.http.get<ApiResponse<ProductDto>>(`${this.apiUrl}/${id}`);
  }

  create(
    fields: Record<string, any>,
    images?: File[],
    catalogFile?: File,
    videoFile?: File
  ): Observable<ApiResponse<ProductDto>> {
    const formData = this.buildFormData(fields, images, catalogFile, videoFile);
    return this.http.post<ApiResponse<ProductDto>>(this.apiUrl, formData);
  }

  update(
    fields: Record<string, any>,
    images?: File[],
    catalogFile?: File,
    videoFile?: File
  ): Observable<ApiResponse<ProductDto>> {
    const formData = this.buildFormData(fields, images, catalogFile, videoFile);
    return this.http.put<ApiResponse<ProductDto>>(this.apiUrl, formData);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  private buildFormData(
    fields: Record<string, any>,
    images?: File[],
    catalogFile?: File,
    videoFile?: File
  ): FormData {
    const fd = new FormData();

    for (const key of Object.keys(fields)) {
      const val = fields[key];
      if (val !== null && val !== undefined && val !== '') {
        fd.append(key, String(val));
      }
    }

    if (images && images.length > 0) {
      images.forEach(img => fd.append('productImages', img));
    }
    if (catalogFile) {
      fd.append('catalogFile', catalogFile);
    }
    if (videoFile) {
      fd.append('videoFile', videoFile);
    }

    return fd;
  }
}
