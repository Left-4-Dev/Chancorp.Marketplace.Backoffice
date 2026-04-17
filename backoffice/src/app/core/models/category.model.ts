export interface CategoryDto {
  id: number;
  name: string;
  description: string;
  state: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  state: boolean;
}

export interface UpdateCategoryRequest {
  name: string;
  description: string;
  state: boolean;
}
