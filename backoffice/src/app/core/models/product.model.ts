export interface ProductDto {
  id: string;
  providerId: number;
  specialityId: number;
  name: string;
  sku: string;
  brand: string;
  description: string;
  countryOrigin: string;
  priceProvider: number;
  priceSale: number;
  stock: number;
  datasheet?: Record<string, any>;
  variations?: Record<string, any>[];
  catalog: string;
  productImg: string[];
  productVideo: string;
  warrantyTime: number;
  hasWarranty: boolean;
  discount: number;
  isNew: boolean;
  isOfferUnique: boolean;
  showPrice: boolean;
  state: boolean;
  createdAt: string;
  updatedAt: string;
}

// Campos escalares para construir FormData en create
export interface CreateProductFields {
  providerId: number;
  specialityId: number;
  name: string;
  sku: string;
  brand: string;
  description: string;
  countryOrigin: string;
  priceProvider: number;
  priceSale: number;
  stock: number;
  datasheetJson?: string;
  variationsJson?: string;
  warrantyTime: number;
  hasWarranty: boolean;
  discount: number;
  isNew: boolean;
  isOfferUnique: boolean;
  showPrice: boolean;
  state: boolean;
}

// Campos escalares para construir FormData en update (parcial + id obligatorio)
export interface UpdateProductFields {
  id: string;
  providerId?: number;
  specialityId?: number;
  name?: string;
  sku?: string;
  brand?: string;
  description?: string;
  countryOrigin?: string;
  priceProvider?: number;
  priceSale?: number;
  stock?: number;
  datasheetJson?: string;
  variationsJson?: string;
  warrantyTime?: number;
  hasWarranty?: boolean;
  discount?: number;
  isNew?: boolean;
  isOfferUnique?: boolean;
  showPrice?: boolean;
  state?: boolean;
}

// Límites de archivos
export const FILE_LIMITS = {
  IMAGE_MAX_SIZE: 5 * 1024 * 1024,       // 5 MB por imagen
  IMAGE_MAX_COUNT: 5,                     // Máx 5 imágenes por producto
  IMAGE_ACCEPTED: '.jpg,.jpeg,.png,.webp',
  CATALOG_MAX_SIZE: 10 * 1024 * 1024,     // 10 MB
  CATALOG_ACCEPTED: '.pdf',
  VIDEO_MAX_SIZE: 50 * 1024 * 1024,       // 50 MB
  VIDEO_MAX_DURATION: 60,                  // 60 segundos
  VIDEO_ACCEPTED: '.mp4,.webm',
};
