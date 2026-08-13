// ═══════════════════════════════════════════════════════════
// PRODUCTO (colección: products)
// ═══════════════════════════════════════════════════════════

export interface ProductDto {
  id: string;
  providerId: number;
  specialityId: number;
  name: string;
  sku: string;
  brand: string;
  description: string;
  countryOrigin: string;
  productImg: string[];
  productVideo: string;
  catalogPdf: string;
  hasVariations: boolean;

  // Solo producto simple (hasVariations = false)
  priceProvider?: number | null;
  priceSale?: number | null;
  stock?: number | null;
  discount?: number | null;
  attributes?: Record<string, any> | null;

  // Solo producto con variantes (hasVariations = true)
  primaryAttributes?: PrimaryAttributeDto[] | null;

  // Comunes
  warrantyTime: number;
  hasWarranty: boolean;
  isNew: boolean;
  isOfferUnique: boolean;
  showPrice: boolean;
  state: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PrimaryAttributeDto {
  name: string;
  options: string[];
}

// Respuesta de GET /api/Products/{id}
export interface ProductDetailResponse {
  product: ProductDto;
  variants: ProductVariantDto[] | null;
}

// ═══════════════════════════════════════════════════════════
// VARIANTE DE PRODUCTO (colección: productVariants)
// ═══════════════════════════════════════════════════════════

export interface ProductVariantDto {
  id: string;
  productId: string;
  sku: string;
  primarySelection: Record<string, any>;
  secondaryAttributes: Record<string, any>;
  priceProvider: number;
  priceSale: number;
  stock: number;
  discount: number;
  state: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductVariantRequest {
  productId: string;
  sku: string;
  primarySelection: Record<string, any>;
  secondaryAttributes: Record<string, any>;
  priceProvider: number;
  priceSale: number;
  stock: number;
  discount: number;
  state: boolean;
}

export interface UpdateProductVariantRequest {
  id: string;
  sku?: string;
  primarySelection?: Record<string, any>;
  secondaryAttributes?: Record<string, any>;
  priceProvider?: number;
  priceSale?: number;
  stock?: number;
  discount?: number;
  state?: boolean;
}

export interface BulkCreateVariantsRequest {
  productId: string;
  variants: Omit<CreateProductVariantRequest, 'productId'>[];
}

// ═══════════════════════════════════════════════════════════
// CAMPOS PARA FORMDATA (CREATE/UPDATE)
// ═══════════════════════════════════════════════════════════

export interface CreateProductFields {
  providerId: number;
  specialityId: number;
  name: string;
  sku: string;
  brand: string;
  description: string;
  countryOrigin: string;
  hasVariations: boolean;
  // Solo simple
  priceProvider?: number;
  priceSale?: number;
  stock?: number;
  discount?: number;
  attributesJson?: string;
  // Solo variantes
  primaryAttributesJson?: string;
  // Comunes
  warrantyTime: number;
  hasWarranty: boolean;
  isNew: boolean;
  isOfferUnique: boolean;
  showPrice: boolean;
  state: boolean;
}

export interface UpdateProductFields {
  id: string;
  providerId?: number;
  specialityId?: number;
  name?: string;
  sku?: string;
  brand?: string;
  description?: string;
  countryOrigin?: string;
  hasVariations?: boolean;
  priceProvider?: number;
  priceSale?: number;
  stock?: number;
  discount?: number;
  attributesJson?: string;
  primaryAttributesJson?: string;
  warrantyTime?: number;
  hasWarranty?: boolean;
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
