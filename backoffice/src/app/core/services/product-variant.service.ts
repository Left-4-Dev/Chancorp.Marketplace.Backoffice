import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, ProductVariantDto, CreateProductVariantRequest, UpdateProductVariantRequest, BulkCreateVariantsRequest } from '../models';
import { environment } from '../../../environments/environment';

export interface VariantPaginatedResult {
  items: ProductVariantDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductVariantService {
  private readonly apiUrl = `${environment.apiUrl}/ProductVariants`;

  constructor(private http: HttpClient) {}

  getByProductId(
    productId: string,
    pageNumber: number = 1,
    pageSize: number = 50,
    filters?: Record<string, string>
  ): Observable<ApiResponse<VariantPaginatedResult>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        params = params.set(`filters[${key}]`, value);
      }
    }

    return this.http.get<ApiResponse<VariantPaginatedResult>>(
      `${this.apiUrl}/by-product/${productId}`,
      { params }
    );
  }

  getById(id: string): Observable<ApiResponse<ProductVariantDto>> {
    return this.http.get<ApiResponse<ProductVariantDto>>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateProductVariantRequest): Observable<ApiResponse<ProductVariantDto>> {
    return this.http.post<ApiResponse<ProductVariantDto>>(this.apiUrl, request);
  }

  bulkCreate(request: BulkCreateVariantsRequest): Observable<ApiResponse<ProductVariantDto[]>> {
    return this.http.post<ApiResponse<ProductVariantDto[]>>(`${this.apiUrl}/bulk`, request);
  }

  update(request: UpdateProductVariantRequest): Observable<ApiResponse<ProductVariantDto>> {
    return this.http.put<ApiResponse<ProductVariantDto>>(this.apiUrl, request);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
