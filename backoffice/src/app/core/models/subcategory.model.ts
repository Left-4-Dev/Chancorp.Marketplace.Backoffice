export interface SubCategoryDto {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  state: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubCategoryRequest {
  categoryId: number;
  name: string;
  description: string;
  state: boolean;
}

export interface UpdateSubCategoryRequest {
  categoryId: number;
  name: string;
  description: string;
  state: boolean;
}
