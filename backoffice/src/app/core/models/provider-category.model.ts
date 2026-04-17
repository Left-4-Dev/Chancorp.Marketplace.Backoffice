export interface ProviderCategoryDto {
  id: number;
  providerId: number;
  categoryId: number;
  isPrimary: boolean;
  state: boolean;
  createdAt: string;
  updatedAt: string;
  categoryName: string | null;
}

export interface CategoryAssignment {
  categoryId: number;
  isPrimary?: boolean;
}

export interface AssignCategoriesToProviderRequest {
  providerId: number;
  assignments: CategoryAssignment[];
}
