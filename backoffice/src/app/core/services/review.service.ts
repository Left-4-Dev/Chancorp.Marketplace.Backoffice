import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, ReviewDto, ReviewPaginatedResult, UpdateReviewRequest } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly apiUrl = `${environment.ordersApiUrl}/Review`;

  constructor(private http: HttpClient) {}

  getPending(
    pageNumber: number = 1,
    pageSize: number = 10,
    providerId?: number,
    startDate?: string,
    endDate?: string
  ): Observable<ApiResponse<ReviewPaginatedResult>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (providerId) params = params.set('providerId', providerId.toString());
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<ApiResponse<ReviewPaginatedResult>>(`${this.apiUrl}/pending`, { params });
  }

  getPaginated(
    pageNumber: number = 1,
    pageSize: number = 10,
    providerId?: number,
    startDate?: string,
    endDate?: string
  ): Observable<ApiResponse<ReviewPaginatedResult>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (providerId) params = params.set('providerId', providerId.toString());
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<ApiResponse<ReviewPaginatedResult>>(`${this.apiUrl}/paginated`, { params });
  }

  update(id: string, request: UpdateReviewRequest): Observable<ApiResponse<ReviewDto>> {
    return this.http.put<ApiResponse<ReviewDto>>(`${this.apiUrl}/${id}`, request);
  }
}
