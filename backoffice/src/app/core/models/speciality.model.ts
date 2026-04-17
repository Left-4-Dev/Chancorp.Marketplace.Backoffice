export interface SpecialityDto {
  id: number;
  subCategoryId: number;
  name: string;
  description: string;
  state: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpecialityRequest {
  subCategoryId: number;
  name: string;
  description: string;
  state: boolean;
}

export interface UpdateSpecialityRequest {
  subCategoryId: number;
  name: string;
  description: string;
  state: boolean;
}
