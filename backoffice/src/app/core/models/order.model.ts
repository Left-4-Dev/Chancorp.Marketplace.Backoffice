export interface OrderDto {
  id: string;
  clientId: number;
  providerId: number;
  purchaseState: string;
  paymentMethod: string;
  total: number;
  deliveryDate: string | null;
  mailingAddress: string;
  observations: string;
  state: boolean;
  createdAt: string;
  updatedAt: string;
  orderDetails: OrderDetailDto[] | null;
}

export interface OrderDetailDto {
  id: string;
  orderId: string;
  productId: string;
  productVariantId: string | null;
  productName: string;
  productImg: string;
  brand: string;
  providerName: string;
  sku: string;
  quantity: number;
  cantCuotas: number;
  interes: number;
  precioxCuota: number;
  priceUnit: number;
  customDiscount: number;
  taxes: number;
  subtotal: number;
  state: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderPaginatedResult {
  items: OrderDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CreateOrderRequest {
  clientId: number;
  purchaseState: string;
  paymentMethod: string;
  total: number;
  deliveryDate: string | null;
  mailingAddress: string;
  observations: string;
  state: boolean;
}

export interface CreateOrderDetailRequest {
  orderId: string;
  productId: string;
  productVariantId: string | null;
  quantity: number;
  cantCuotas: number;
  interes: number;
  precioperCuota: number;
  priceUnit: number;
  customDiscount: number;
  taxes: number;
  subtotal: number;
  productName: string;
  brand: string;
  sku: string;
  productImg: string;
  providerName: string;
  state: boolean;
}
