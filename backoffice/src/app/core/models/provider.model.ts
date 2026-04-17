export interface ProviderDto {
  userId: number;
  userEmail: string;
  userType: string;
  userState: boolean;
  providerId: number;
  enterpriseName: string;
  providerType: string;
  phone: string;
  sector: string;
  docType: string;
  docNumber: string;
  countryCode: string;
  region: string;
  address: string;
  website: string;
  state: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProviderRequest {
  userEmail: string;
  userPassword: string;
  enterpriseName: string;
  providerType: string;
  phone: string;
  sector: string;
  docType: string;
  docNumber: string;
  countryCode: string;
  region: string;
  address: string;
  website: string;
}

export interface UpdateProviderRequest {
  userId: number;
  userEmail?: string;
  enterpriseName?: string;
  providerType?: string;
  phone?: string;
  sector?: string;
  docType?: string;
  docNumber?: string;
  countryCode?: string;
  region?: string;
  address?: string;
  website?: string;
}
