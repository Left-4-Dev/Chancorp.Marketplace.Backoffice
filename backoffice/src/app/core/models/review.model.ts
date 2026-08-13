export interface ReviewDto {
  id: string;
  productId: string;
  productVariantId: string | null;
  clientId: number;
  providerId: number;
  subject: string;
  description: string;
  rating: number;
  approvedState: string;
  state: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateReviewRequest {
  subject: string;
  description: string;
  rating: number;
  approvedState: string;
  state: boolean;
}

export interface ReviewPaginatedResult {
  items: ReviewDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
