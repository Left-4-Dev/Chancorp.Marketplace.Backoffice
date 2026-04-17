import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, OrderDto, OrderPaginatedResult, CreateOrderRequest, CreateOrderDetailRequest, OrderDetailDto } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = `${environment.ordersApiUrl}/Order`;
  private readonly detailApiUrl = `${environment.ordersApiUrl}/OrderDetail`;

  constructor(private http: HttpClient) {}

  getPaginated(
    providerId: number,
    startDate: string,
    endDate: string,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<ApiResponse<OrderPaginatedResult>> {
    const params = new HttpParams()
      .set('providerId', providerId.toString())
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ApiResponse<OrderPaginatedResult>>(`${this.apiUrl}/paginated`, { params });
  }

  createOrder(order: CreateOrderRequest): Observable<ApiResponse<OrderDto>> {
    return this.http.post<ApiResponse<OrderDto>>(this.apiUrl, order);
  }

  createOrderDetail(detail: CreateOrderDetailRequest): Observable<ApiResponse<OrderDetailDto>> {
    return this.http.post<ApiResponse<OrderDetailDto>>(this.detailApiUrl, detail);
  }
}
