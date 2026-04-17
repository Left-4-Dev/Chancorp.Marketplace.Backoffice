// Respuesta del endpoint POST /api/Auth/sync
export interface SyncResponse {
  userId?: number;
  email: string;
  type?: string;       // 'Admin' | 'Provider' | 'Client'
  state?: boolean;
  isRegistered: boolean;
  profile?: ClientProfile | ProviderProfile;
  clerkUserId?: string;
}

export interface ClientProfile {
  clientId: number;
  contactName: string;
  contactSurname: string;
  enterpriseName: string;
}

export interface ProviderProfile {
  providerId: number;
  enterpriseName: string;
  providerType: string;
}

// Respuesta del endpoint GET /api/Auth/me
export interface MeResponse {
  clerkUserId: string;
  email: string;
}
