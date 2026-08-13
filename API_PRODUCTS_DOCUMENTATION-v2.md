# Chancorp Marketplace Products API - Documentación de Endpoints

> **Propósito de este documento:** Servir como referencia completa para desarrollar el frontend en Angular. Contiene todas las interfaces TypeScript, endpoints, ejemplos de request/response, y reglas de negocio necesarias para consumir esta API.

## Información General

**Base URL:** `http://localhost:5058/api`

**Headers requeridos:**
- **Category, SubCategory, Speciality, ProviderCategories (POST/PUT):** `Content-Type: application/json`
- **Products (POST/PUT):** `Content-Type: multipart/form-data` (el browser lo setea automáticamente al usar `FormData`, **NO setearlo manualmente**)

**Almacenamiento de archivos:** Las imágenes, catálogos (PDF) y videos de productos se suben a **Cloudinary**. El backend recibe los archivos via `multipart/form-data`, los sube a Cloudinary, y guarda las URLs resultantes en MongoDB. Al eliminar un producto, el backend también elimina los archivos de Cloudinary.

**Arquitectura:** Este backend maneja Productos, Categorías, SubCategorías, Especialidades y la relación Proveedor-Categoría. Los proveedores **NO** viven en este backend — son gestionados por otro microservicio (Users/Providers). El `providerId` que se usa aquí corresponde al campo `Id` (PK, int) de la tabla `Providers` en ese otro backend.

### Formato de respuestas

Todas las respuestas de todos los endpoints siguen esta estructura unificada:

```typescript
interface Response {
  success: boolean;           // true = operación exitosa, false = hubo error
  mensaje?: string;           // Mensaje descriptivo en español
  detalle?: string;           // Detalle adicional (opcional, raramente usado)
  data?: any;                 // Objeto individual (usado en: GET by ID, POST, PUT)
  dataLista?: any[];          // Lista de objetos (usado en: GET all, GET filtrados)
  detailedErrors?: DetailedError[];  // Errores de validación detallados (opcional)
}

interface DetailedError {
  field?: string;             // Nombre del campo con error
  message?: string;           // Descripción del error
}
```

**Regla para el frontend:** Siempre verificar `response.success` antes de procesar los datos. Si es `false`, mostrar `response.mensaje` como error.

### Paginación

Solo los endpoints de Productos y Especialidades usan paginación. La respuesta paginada viene dentro de `data` (NO en `dataLista`):

```typescript
interface PaginatedResult<T> {
  items: T[];               // Elementos de la página actual
  pageNumber: number;        // Página actual (desde 1)
  pageSize: number;          // Elementos por página
  totalCount: number;        // Total de elementos en la BD
  totalPages: number;        // ceil(totalCount / pageSize)
}
```

---

## Módulo: Categories (Categorías)

Las categorías son el primer nivel de clasificación de productos. Ejemplos: "Computación", "Electrónica", "Industria".

### Interfaces TypeScript

```typescript
interface CategoryDto {
  id: number;
  name: string;
  description: string;
  state: boolean;            // true = activa, false = inactiva
  createdAt: string;         // ISO 8601: "2026-01-13T05:01:08.45531Z"
  updatedAt: string;
}

interface CreateCategoryRequest {
  name: string;
  description: string;
  state: boolean;
}

interface UpdateCategoryRequest {
  name: string;
  description: string;
  state: boolean;
}
```

### Endpoints

| Método | Endpoint | Descripción | Body | Respuesta exitosa |
|--------|----------|-------------|------|-------------------|
| GET | `/api/Category` | Listar todas | — | `dataLista: CategoryDto[]` |
| GET | `/api/Category/{id}` | Obtener por ID | — | `data: CategoryDto` |
| POST | `/api/Category` | Crear | `CreateCategoryRequest` | `data: CategoryDto` (201) |
| PUT | `/api/Category/{id}` | Actualizar | `UpdateCategoryRequest` | `data: CategoryDto` |
| DELETE | `/api/Category/{id}` | Eliminar | — | `data: null` |

#### Ejemplos de respuesta

**GET /api/Category** → `200 OK`
```json
{
  "success": true,
  "mensaje": "Categorías obtenidas",
  "dataLista": [
    {
      "id": 1,
      "name": "Computación",
      "description": "Computadoras, laptops y accesorios",
      "state": true,
      "createdAt": "2026-01-13T05:01:08.45531Z",
      "updatedAt": "2026-01-13T05:01:08.45531Z"
    }
  ]
}
```

**GET /api/Category/999** → `404 Not Found`
```json
{
  "success": false,
  "mensaje": "Categoría no encontrada",
  "data": null
}
```

**POST /api/Category** → Body:
```json
{
  "name": "Nueva Categoría",
  "description": "Descripción de la categoría",
  "state": true
}
```
→ `201 Created` — respuesta con `data: CategoryDto` incluyendo el `id` generado.

**PUT /api/Category/1** → Body (sin id, se toma de la URL):
```json
{
  "name": "Categoría Actualizada",
  "description": "Nueva descripción",
  "state": true
}
```

**DELETE /api/Category/1** → `200 OK` con `"mensaje": "Categoría eliminada"`. Retorna `404` si no existe.

---

## Módulo: SubCategory (SubCategorías)

Las subcategorías pertenecen a una categoría padre. Ejemplo: Categoría "Computación" → SubCategorías "Laptops", "PC Escritorio", "Monitores".

### Interfaces TypeScript

```typescript
interface SubCategoryDto {
  id: number;
  categoryId: number;        // FK → Category.id
  name: string;
  description: string;
  state: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateSubCategoryRequest {
  categoryId: number;        // ID de la categoría padre (debe existir)
  name: string;
  description: string;
  state: boolean;
}

interface UpdateSubCategoryRequest {
  categoryId: number;
  name: string;
  description: string;
  state: boolean;
}
```

### Endpoints

| Método | Endpoint | Descripción | Body | Respuesta exitosa |
|--------|----------|-------------|------|-------------------|
| GET | `/api/SubCategory` | Listar todas | — | `dataLista: SubCategoryDto[]` |
| GET | `/api/SubCategory/{id}` | Obtener por ID | — | `data: SubCategoryDto` |
| GET | `/api/SubCategory/category/{categoryId}` | Filtrar por categoría padre | — | `dataLista: SubCategoryDto[]` |
| POST | `/api/SubCategory` | Crear | `CreateSubCategoryRequest` | `data: SubCategoryDto` (201) |
| PUT | `/api/SubCategory/{id}` | Actualizar | `UpdateSubCategoryRequest` | `data: SubCategoryDto` |
| DELETE | `/api/SubCategory/{id}` | Eliminar | — | `data: null` |

#### Ejemplos de respuesta

**GET /api/SubCategory/category/1** → Subcategorías de "Computación":
```json
{
  "success": true,
  "mensaje": "SubCategorías por categoría obtenidas",
  "dataLista": [
    {
      "id": 1,
      "categoryId": 1,
      "name": "Laptops",
      "description": "Computadoras portátiles",
      "state": true,
      "createdAt": "2026-01-13T05:01:08.45531Z",
      "updatedAt": "2026-01-13T05:01:08.45531Z"
    },
    {
      "id": 2,
      "categoryId": 1,
      "name": "PC Escritorio",
      "description": "Computadoras de escritorio",
      "state": true,
      "createdAt": "2026-01-13T05:01:08.45531Z",
      "updatedAt": "2026-01-13T05:01:08.45531Z"
    }
  ]
}
```

**POST /api/SubCategory** → Body:
```json
{
  "categoryId": 1,
  "name": "Monitores",
  "description": "Pantallas y monitores",
  "state": true
}
```

---

## Módulo: Speciality (Especialidades)

Las especialidades pertenecen a una subcategoría padre. Son el tercer nivel de clasificación, justo antes de los productos. Ejemplo: Categoría "Computación" → SubCategoría "Laptops" → Especialidades "Gaming", "Ultrabook", "Workstation".

### Interfaces TypeScript

```typescript
interface SpecialityDto {
  id: number;
  subCategoryId: number;     // FK → SubCategory.id
  name: string;
  description: string;
  state: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateSpecialityRequest {
  subCategoryId: number;     // ID de la subcategoría padre (debe existir)
  name: string;
  description: string;
  state: boolean;
}

interface UpdateSpecialityRequest {
  subCategoryId: number;
  name: string;
  description: string;
  state: boolean;
}
```

### Endpoints

| Método | Endpoint | Descripción | Body | Respuesta exitosa |
|--------|----------|-------------|------|-------------------|
| GET | `/api/Speciality?pageNumber=1&pageSize=10` | Listar todas (paginado) | — | `data: PaginatedResult<SpecialityDto>` |
| GET | `/api/Speciality/{id}` | Obtener por ID | — | `data: SpecialityDto` |
| GET | `/api/Speciality/subcategory/{subCategoryId}` | Filtrar por subcategoría padre | — | `dataLista: SpecialityDto[]` |
| POST | `/api/Speciality` | Crear | `CreateSpecialityRequest` | `data: SpecialityDto` |
| PUT | `/api/Speciality/{id}` | Actualizar | `UpdateSpecialityRequest` | `data: SpecialityDto` |
| DELETE | `/api/Speciality/{id}` | Eliminar | — | `data: null` |

**IMPORTANTE:** El endpoint `GET /api/Speciality` usa paginación (igual que Products). La respuesta viene en `data` como `PaginatedResult<SpecialityDto>`. `pageSize` máximo es 50.

#### Ejemplos de respuesta

**GET /api/Speciality?pageNumber=1&pageSize=10** → `200 OK`
```json
{
  "success": true,
  "mensaje": "Especialidades obtenidas",
  "data": {
    "items": [
      {
        "id": 1,
        "subCategoryId": 1,
        "name": "Gaming",
        "description": "Laptops para gaming de alta gama",
        "state": true,
        "createdAt": "2026-03-26T10:00:00Z",
        "updatedAt": "2026-03-26T10:00:00Z"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 5,
    "totalPages": 1
  }
}
```

**GET /api/Speciality/subcategory/1** → Especialidades de "Laptops":
```json
{
  "success": true,
  "mensaje": "Especialidades por subcategoría obtenidas",
  "dataLista": [
    {
      "id": 1,
      "subCategoryId": 1,
      "name": "Gaming",
      "description": "Laptops para gaming de alta gama",
      "state": true,
      "createdAt": "2026-03-26T10:00:00Z",
      "updatedAt": "2026-03-26T10:00:00Z"
    },
    {
      "id": 2,
      "subCategoryId": 1,
      "name": "Ultrabook",
      "description": "Laptops ultradelgadas para productividad",
      "state": true,
      "createdAt": "2026-03-26T10:00:00Z",
      "updatedAt": "2026-03-26T10:00:00Z"
    }
  ]
}
```

**POST /api/Speciality** → Body:
```json
{
  "subCategoryId": 1,
  "name": "Workstation",
  "description": "Laptops para trabajo profesional y diseño",
  "state": true
}
```
→ `200 OK` con `data: SpecialityDto` incluyendo el `id` generado.

**PUT /api/Speciality/1** → Body (sin id, se toma de la URL):
```json
{
  "subCategoryId": 1,
  "name": "Gaming Pro",
  "description": "Laptops gaming premium",
  "state": true
}
```

**DELETE /api/Speciality/1** → `200 OK` con `"mensaje": "Especialidad eliminada"`. Retorna `404` si no existe.

---

## Módulo: ProviderCategories (Relación Proveedor ↔ Categoría)

Gestiona la relación **muchos-a-muchos** entre proveedores y categorías. Un proveedor puede vender en múltiples categorías y una categoría puede tener múltiples proveedores.

### Conceptos clave para el frontend

- **`providerId`**: Es el `Id` (PK) de la tabla `Providers` del otro backend. NO es el `UserId`.
- **`isPrimary`**: Indica la categoría principal del proveedor (para mostrar en perfil, búsquedas, rankings). **Solo una categoría puede ser primaria por proveedor.** Si se marca una nueva como primaria, la anterior se desmarca automáticamente.
- **`state`**: Permite desactivar temporalmente una relación sin eliminarla (ej: proveedor pausado en esa categoría).
- **Asignaciones duplicadas**: Si se intenta asignar una categoría que ya existe para ese proveedor, se omite sin error.

### Interfaces TypeScript

```typescript
// Respuesta del backend
interface ProviderCategoryDto {
  id: number;                // PK de la tabla ProviderCategories
  providerId: number;        // ID del proveedor (del otro backend)
  categoryId: number;        // FK → Category.id
  isPrimary: boolean;        // true = categoría principal del proveedor
  state: boolean;            // true = relación activa
  createdAt: string;         // ISO 8601
  updatedAt: string;         // ISO 8601
  categoryName: string | null; // Nombre de la categoría (viene populated en consultas por proveedor, null en consultas por categoría)
}

// Para el POST — cada categoría con su flag individual
interface CategoryAssignment {
  categoryId: number;
  isPrimary?: boolean;       // Default: false. Máximo UNA con true en el array
}

// Request para asignar categorías
interface AssignCategoriesToProviderRequest {
  providerId: number;        // Debe ser > 0
  assignments: CategoryAssignment[];  // Al menos 1 elemento
}
```

### Endpoints

| Método | Endpoint | Descripción | Body | Respuesta exitosa |
|--------|----------|-------------|------|-------------------|
| POST | `/api/provider-categories` | Asignar categorías a proveedor | `AssignCategoriesToProviderRequest` | `dataLista: ProviderCategoryDto[]` |
| DELETE | `/api/provider-categories/{providerId}/{categoryId}` | Remover una asignación | — | `mensaje: string` |
| GET | `/api/provider-categories/provider/{providerId}` | Categorías de un proveedor | — | `dataLista: ProviderCategoryDto[]` |
| GET | `/api/provider-categories/category/{categoryId}` | Proveedores de una categoría | — | `dataLista: ProviderCategoryDto[]` |

#### POST /api/provider-categories — Asignar categorías

**Request body:**
```json
{
  "providerId": 1,
  "assignments": [
    { "categoryId": 1, "isPrimary": true },
    { "categoryId": 3, "isPrimary": false },
    { "categoryId": 5 }
  ]
}
```

**Response `200 OK`** — retorna TODAS las asignaciones actuales del proveedor (no solo las nuevas):
```json
{
  "success": true,
  "mensaje": "Categorías asignadas al proveedor",
  "dataLista": [
    {
      "id": 1,
      "providerId": 1,
      "categoryId": 1,
      "isPrimary": true,
      "state": true,
      "createdAt": "2026-03-23T10:00:00Z",
      "updatedAt": "2026-03-23T10:00:00Z",
      "categoryName": "Computación"
    },
    {
      "id": 2,
      "providerId": 1,
      "categoryId": 3,
      "isPrimary": false,
      "state": true,
      "createdAt": "2026-03-23T10:00:00Z",
      "updatedAt": "2026-03-23T10:00:00Z",
      "categoryName": "Electrónica"
    },
    {
      "id": 3,
      "providerId": 1,
      "categoryId": 5,
      "isPrimary": false,
      "state": true,
      "createdAt": "2026-03-23T10:00:00Z",
      "updatedAt": "2026-03-23T10:00:00Z",
      "categoryName": "Industria"
    }
  ]
}
```

**Errores posibles (todos retornan `400 Bad Request`):**

| Caso | Mensaje |
|------|---------|
| `providerId` es 0 o negativo | `"ProviderId debe ser mayor a 0"` |
| Array `assignments` vacío o null | `"Debe enviar al menos una asignación"` |
| Más de un `isPrimary: true` en el array | `"Solo puede haber una categoría primaria por proveedor"` |
| `categoryId` no existe en la BD | `"Categoría con Id {X} no encontrada"` |

#### DELETE /api/provider-categories/{providerId}/{categoryId}

**Ejemplo:** `DELETE /api/provider-categories/1/3`

**Response `200 OK`:**
```json
{
  "success": true,
  "mensaje": "Categoría removida del proveedor"
}
```

**Response `404 Not Found`:**
```json
{
  "success": false,
  "mensaje": "Asignación no encontrada"
}
```

#### GET /api/provider-categories/provider/{providerId}

Retorna las categorías del proveedor **con `categoryName` incluido** (útil para mostrar en el perfil del proveedor).

**Ejemplo:** `GET /api/provider-categories/provider/1`

```json
{
  "success": true,
  "mensaje": "Categorías del proveedor obtenidas",
  "dataLista": [
    {
      "id": 1,
      "providerId": 1,
      "categoryId": 1,
      "isPrimary": true,
      "state": true,
      "createdAt": "2026-03-23T10:00:00Z",
      "updatedAt": "2026-03-23T10:00:00Z",
      "categoryName": "Computación"
    },
    {
      "id": 2,
      "providerId": 1,
      "categoryId": 3,
      "isPrimary": false,
      "state": true,
      "createdAt": "2026-03-23T10:00:00Z",
      "updatedAt": "2026-03-23T10:00:00Z",
      "categoryName": "Electrónica"
    }
  ]
}
```

**Error `400`** si `providerId <= 0`: `"ProviderId debe ser mayor a 0"`

#### GET /api/provider-categories/category/{categoryId}

Retorna los proveedores de una categoría. **`categoryName` viene `null`** (redundante ya que el `categoryId` es conocido).

**Ejemplo:** `GET /api/provider-categories/category/1`

```json
{
  "success": true,
  "mensaje": "Proveedores de la categoría obtenidos",
  "dataLista": [
    {
      "id": 1,
      "providerId": 1,
      "categoryId": 1,
      "isPrimary": true,
      "state": true,
      "createdAt": "2026-03-23T10:00:00Z",
      "updatedAt": "2026-03-23T10:00:00Z",
      "categoryName": null
    },
    {
      "id": 4,
      "providerId": 3,
      "categoryId": 1,
      "isPrimary": false,
      "state": true,
      "createdAt": "2026-03-23T11:00:00Z",
      "updatedAt": "2026-03-23T11:00:00Z",
      "categoryName": null
    }
  ]
}
```

---

## Módulo: Products (Productos)

Los productos se almacenan en **MongoDB** (no en PostgreSQL como el resto). Pertenecen a una especialidad y a un proveedor.

### Modelo de Producto — Dos modalidades

El sistema soporta **dos tipos de productos** en una misma colección, diferenciados por el campo `hasVariations`:

| Modo | `hasVariations` | Descripción | Ejemplo |
|------|----------------|-------------|---------|
| **Producto Simple** | `false` | Producto único con precio, stock y atributos propios | "Laptop Gaming ASUS ROG" |
| **Producto con Variantes** | `true` | Producto "familia" que agrupa N variantes (subproductos), cada una con su precio/stock | "Válvulas de control de flujo en línea - Serie F" con 251 variantes |

**Analogía visual:**
- Producto Simple = una ficha de producto con precio y "Agregar al carrito" directo.
- Producto con Variantes = una ficha tipo Alibaba donde el usuario selecciona combinaciones de filtros (Material, Diámetro, Voltaje, etc.) y cada combinación es una variante con su propio SKU, precio y stock.

**Archivos (imágenes, catálogo, video):** Se envían como archivos reales via `multipart/form-data`. El backend los sube a **Cloudinary** y guarda las URLs en MongoDB. Las imágenes solo viven en el producto principal — las variantes NO tienen imagen propia.

### Interfaces TypeScript

```typescript
// ═══════════════════════════════════════════════════════════
// PRODUCTO (colección: products)
// ═══════════════════════════════════════════════════════════

interface ProductDto {
  id: string;                             // ObjectId de MongoDB (string, NO number)
  providerId: number;                     // ID del proveedor (del otro backend)
  specialityId: number;                   // FK → Speciality.id
  name: string;
  sku: string;                            // SKU del producto (vacío si hasVariations=true)
  brand: string;
  description: string;
  countryOrigin: string;
  productImg: string[];                   // URLs de imágenes en Cloudinary
  productVideo: string;                   // URL del video en Cloudinary
  catalogPdf: string;                     // URL del PDF catálogo en Cloudinary
  hasVariations: boolean;                 // DISCRIMINADOR: false=simple, true=con variantes

  // ─── Campos SOLO producto simple (hasVariations = false) ───
  priceProvider?: number;                 // Precio del proveedor (null si tiene variantes)
  priceSale?: number;                     // Precio de venta (null si tiene variantes)
  stock?: number;                         // Stock disponible (null si tiene variantes)
  discount?: number;                      // % descuento (null si tiene variantes)
  attributes?: Record<string, any>;       // Specs técnicos dinámicos (null si tiene variantes)

  // ─── Campos SOLO producto con variantes (hasVariations = true) ───
  primaryAttributes?: PrimaryAttributeDto[];  // Definición de filtros (null si es simple)

  // ─── Campos comunes ───
  warrantyTime: number;
  hasWarranty: boolean;
  isNew: boolean;
  isOfferUnique: boolean;
  showPrice: boolean;
  state: boolean;
  createdAt: string;
  updatedAt: string;
}

// Definición de un atributo primario (filtro)
interface PrimaryAttributeDto {
  name: string;                           // Ej: "Diámetro", "Material", "Voltaje"
  options: string[];                      // Ej: ["1\"", "2\"", "4\"", "6\""]
}

// ═══════════════════════════════════════════════════════════
// VARIANTE DE PRODUCTO (colección: productVariants)
// ═══════════════════════════════════════════════════════════

interface ProductVariantDto {
  id: string;                             // ObjectId de MongoDB
  productId: string;                      // Referencia al producto padre
  sku: string;                            // SKU único de esta variante (ej: "8F1200S")
  primarySelection: Record<string, any>;  // Valores seleccionados de los filtros primarios
                                          // Ej: { "Diámetro": "2\"", "Material": "Inox 316" }
  secondaryAttributes: Record<string, any>; // Specs específicos de esta variante
                                          // Ej: { "Función": "Flow Control", "Presión máxima": "5000 psi" }
  priceProvider: number;                  // Precio proveedor de esta variante
  priceSale: number;                      // Precio venta de esta variante
  stock: number;                          // Stock de esta variante
  discount: number;                       // % descuento de esta variante
  state: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Relación entre Producto y Variantes

```
Product (hasVariations = true)
  ├── name: "Válvulas de control de flujo en línea - Serie F"
  ├── brand: "Colorflow"
  ├── primaryAttributes: [
  │     { name: "Material", options: ["Inox 316", "Bronce", "Hierro fund."] },
  │     { name: "Diámetro", options: ["1\"", "2\"", "4\"", "6\""] },
  │     { name: "Conexión", options: ["NPT", "SAE", "BSPT"] }
  │   ]
  │
  └── ProductVariants (N documentos en otra colección):
        ├── { sku: "8F1200S", primarySelection: { "Material": "Inox 316", "Diámetro": "2\"" },
        │     secondaryAttributes: { "Función": "Flow Control", "Presión": "5000 psi" },
        │     priceProvider: 120, priceSale: 180, stock: 50 }
        ├── { sku: "8F200S", primarySelection: { "Material": "Bronce", "Diámetro": "1\"" },
        │     secondaryAttributes: { "Función": "Flow Control", "Presión": "3000 psi" },
        │     priceProvider: 80, priceSale: 120, stock: 30 }
        └── ... (hasta 251+ variantes)
```

**Para el frontend:**
- Los `primaryAttributes` del producto padre definen los **filtros** que se muestran como selectores/botones.
- Cuando el usuario selecciona una combinación de filtros, se consultan las variantes que coincidan con esa `primarySelection`.
- Los `secondaryAttributes` se muestran como tabla de especificaciones técnicas de la variante seleccionada.

### Endpoints de Productos

| Método | Endpoint | Content-Type | Descripción | Respuesta exitosa |
|--------|----------|-------------|-------------|-------------------|
| GET | `/api/Products?providerId=X&specialityId=Y&pageNumber=1&pageSize=10` | — | Listar paginado (filtros obligatorios) | `data: PaginatedResult<ProductDto>` |
| GET | `/api/Products/{id}` | — | Obtener por ID (incluye variantes si las tiene) | `data: { product, variants }` |
| POST | `/api/Products` | `multipart/form-data` | Crear producto (simple o con variantes) | `data: ProductDto` |
| PUT | `/api/Products` | `multipart/form-data` | Actualizar (parcial) con archivos | `data: ProductDto` |
| DELETE | `/api/Products/{id}` | — | Eliminar (cascade: elimina variantes + archivos Cloudinary) | `data: null` |

**IMPORTANTE para el frontend:**
- El `id` de productos es `string` (MongoDB ObjectId), no `number`.
- `GET /api/Products` requiere **2 query params obligatorios**: `providerId`, `specialityId`.
- `GET /api/Products/{id}` retorna **producto + variantes** cuando `hasVariations = true`.
- `DELETE` elimina automáticamente todas las variantes asociadas y archivos de Cloudinary.
- `pageSize` máximo es 50. Default: 10.
- **POST y PUT usan `multipart/form-data`** — NO `application/json`. Usar `FormData` en el frontend.
- **NO setear `Content-Type` manualmente** en el `HttpClient` para POST/PUT de Products.

#### Campos del FormData para POST/PUT de Productos

| Campo | Tipo | Requerido POST | Descripción |
|-------|------|----------------|-------------|
| `providerId` | string (número) | Sí | ID del proveedor |
| `specialityId` | string (número) | Sí | ID de la especialidad |
| `name` | string | Sí | Nombre del producto |
| `sku` | string | Solo simple | Código SKU (vacío si tiene variantes) |
| `brand` | string | Sí | Marca |
| `description` | string | Sí | Descripción |
| `countryOrigin` | string | Sí | País de origen |
| `hasVariations` | string (boolean) | Sí | `"true"` o `"false"` — **define el modo** |
| `priceProvider` | string (decimal) | Solo simple | Precio del proveedor |
| `priceSale` | string (decimal) | Solo simple | Precio de venta |
| `stock` | string (número) | Solo simple | Stock disponible |
| `discount` | string (decimal) | Solo simple | Porcentaje de descuento |
| `attributesJson` | string | Solo simple | `JSON.stringify({...})` specs técnicos dinámicos |
| `primaryAttributesJson` | string | Solo variantes | `JSON.stringify([{name, options}])` definición de filtros |
| `warrantyTime` | string (número) | Sí | Meses de garantía |
| `hasWarranty` | string (boolean) | Sí | `"true"` o `"false"` |
| `isNew` | string (boolean) | Sí | `"true"` o `"false"` |
| `isOfferUnique` | string (boolean) | Sí | `"true"` o `"false"` |
| `showPrice` | string (boolean) | Sí | `"true"` o `"false"` |
| `state` | string (boolean) | Sí | `"true"` o `"false"` |
| `productImages` | File (múltiple) | No | Archivos de imagen (jpg, png, webp) |
| `catalogFile` | File | No | Archivo PDF del catálogo |
| `videoFile` | File | No | Archivo de video (mp4, webm) |

**En PUT:** Solo enviar campos a modificar + `id` obligatorio. Para archivos: si se envían, reemplazan los anteriores.

#### GET /api/Products — Listado paginado

**URL:** `GET /api/Products?providerId=1&specialityId=1&pageNumber=1&pageSize=10`

**Response `200 OK`:**
```json
{
  "success": true,
  "mensaje": "Productos encontrados",
  "data": {
    "items": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "providerId": 1,
        "specialityId": 2,
        "name": "Laptop Gaming ASUS ROG",
        "sku": "ASUS-ROG-001",
        "brand": "ASUS",
        "description": "Laptop gaming de alta gama con RTX 4080",
        "countryOrigin": "Taiwan",
        "productImg": ["https://res.cloudinary.com/.../img1.jpg"],
        "productVideo": "",
        "catalogPdf": "https://res.cloudinary.com/.../catalog.pdf",
        "hasVariations": false,
        "priceProvider": 1500.00,
        "priceSale": 1899.99,
        "stock": 50,
        "discount": 10.0,
        "attributes": { "processor": "Intel Core i9-13900H", "ram": "32GB DDR5" },
        "primaryAttributes": null,
        "warrantyTime": 24,
        "hasWarranty": true,
        "isNew": true,
        "isOfferUnique": false,
        "showPrice": true,
        "state": true,
        "createdAt": "2026-02-16T10:50:00Z",
        "updatedAt": "2026-02-16T10:50:00Z"
      },
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j2",
        "providerId": 1,
        "specialityId": 2,
        "name": "Válvulas de control de flujo - Serie F",
        "sku": "",
        "brand": "Colorflow",
        "description": "Válvulas hidráulicas de control de flujo en línea",
        "countryOrigin": "USA",
        "productImg": ["https://res.cloudinary.com/.../valve1.jpg"],
        "productVideo": "",
        "catalogPdf": "https://res.cloudinary.com/.../valves.pdf",
        "hasVariations": true,
        "priceProvider": null,
        "priceSale": null,
        "stock": null,
        "discount": null,
        "attributes": null,
        "primaryAttributes": [
          { "name": "Material", "options": ["Inox 316", "Bronce", "Hierro fund."] },
          { "name": "Diámetro", "options": ["1\"", "2\"", "4\"", "6\""] }
        ],
        "warrantyTime": 12,
        "hasWarranty": true,
        "isNew": false,
        "isOfferUnique": false,
        "showPrice": true,
        "state": true,
        "createdAt": "2026-04-10T14:30:00Z",
        "updatedAt": "2026-04-10T14:30:00Z"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 25,
    "totalPages": 3
  }
}
```

#### GET /api/Products/{id} — Obtener producto por ID

**Respuesta especial:** Retorna el producto **+ sus variantes** (si `hasVariations = true`).

**Response para producto simple (`hasVariations = false`):**
```json
{
  "success": true,
  "mensaje": "Producto encontrado",
  "data": {
    "product": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "hasVariations": false,
      "priceProvider": 1500.00,
      "priceSale": 1899.99,
      "stock": 50,
      "attributes": { "processor": "i9-13900H", "ram": "32GB DDR5" },
      "primaryAttributes": null,
      "...": "demás campos"
    },
    "variants": null
  }
}
```

**Response para producto con variantes (`hasVariations = true`):**
```json
{
  "success": true,
  "mensaje": "Producto encontrado",
  "data": {
    "product": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Válvulas de control de flujo - Serie F",
      "hasVariations": true,
      "priceProvider": null,
      "priceSale": null,
      "stock": null,
      "attributes": null,
      "primaryAttributes": [
        { "name": "Material", "options": ["Inox 316", "Bronce", "Hierro fund."] },
        { "name": "Diámetro", "options": ["1\"", "2\"", "4\"", "6\""] },
        { "name": "Conexión", "options": ["NPT", "SAE", "BSPT", "BSPP"] }
      ],
      "...": "demás campos"
    },
    "variants": [
      {
        "id": "66a1b2c3d4e5f6g7h8i9j0k1",
        "productId": "65f1a2b3c4d5e6f7g8h9i0j2",
        "sku": "8F1200S",
        "primarySelection": { "Material": "Inox 316", "Diámetro": "2\"", "Conexión": "NPT" },
        "secondaryAttributes": { "Función": "Flow Control", "Presión máxima": "5000 psi", "Caudal": "25 gal/min" },
        "priceProvider": 120.00,
        "priceSale": 180.00,
        "stock": 50,
        "discount": 0,
        "state": true,
        "createdAt": "2026-04-10T15:00:00Z",
        "updatedAt": "2026-04-10T15:00:00Z"
      },
      {
        "id": "66a1b2c3d4e5f6g7h8i9j0k2",
        "productId": "65f1a2b3c4d5e6f7g8h9i0j2",
        "sku": "8F200S",
        "primarySelection": { "Material": "Bronce", "Diámetro": "1\"", "Conexión": "SAE" },
        "secondaryAttributes": { "Función": "Flow Control", "Presión máxima": "3000 psi", "Caudal": "3 gal/min" },
        "priceProvider": 80.00,
        "priceSale": 120.00,
        "stock": 30,
        "discount": 5,
        "state": true,
        "createdAt": "2026-04-10T15:05:00Z",
        "updatedAt": "2026-04-10T15:05:00Z"
      }
    ]
  }
}
```

#### POST /api/Products — Crear producto simple

```typescript
const formData = new FormData();
formData.append('providerId', '1');
formData.append('specialityId', '1');
formData.append('name', 'Laptop Gaming ASUS ROG');
formData.append('sku', 'ASUS-ROG-001');
formData.append('brand', 'ASUS');
formData.append('description', 'Laptop gaming de alta gama con RTX 4080');
formData.append('countryOrigin', 'Taiwan');
formData.append('hasVariations', 'false');  // ← PRODUCTO SIMPLE
formData.append('priceProvider', '1500.00');
formData.append('priceSale', '1899.99');
formData.append('stock', '50');
formData.append('discount', '10.0');
formData.append('attributesJson', JSON.stringify({
  processor: 'Intel Core i9-13900H',
  ram: '32GB DDR5',
  storage: '1TB NVMe SSD'
}));
formData.append('warrantyTime', '24');
formData.append('hasWarranty', 'true');
formData.append('isNew', 'true');
formData.append('isOfferUnique', 'false');
formData.append('showPrice', 'true');
formData.append('state', 'true');
formData.append('productImages', imageFile1);
formData.append('productImages', imageFile2);
formData.append('catalogFile', pdfFile);

this.http.post<Response>('http://localhost:5058/api/Products', formData).subscribe(...);
```

#### POST /api/Products — Crear producto con variantes

```typescript
const formData = new FormData();
formData.append('providerId', '1');
formData.append('specialityId', '3');
formData.append('name', 'Válvulas de control de flujo - Serie F');
formData.append('brand', 'Colorflow');
formData.append('description', 'Válvulas hidráulicas control flujo en línea');
formData.append('countryOrigin', 'USA');
formData.append('hasVariations', 'true');  // ← PRODUCTO CON VARIANTES
// NO enviar: priceProvider, priceSale, stock, discount, attributesJson
formData.append('primaryAttributesJson', JSON.stringify([
  { name: 'Material', options: ['Inox 316', 'Bronce', 'Hierro fund.'] },
  { name: 'Diámetro', options: ['1"', '2"', '4"', '6"'] },
  { name: 'Conexión', options: ['NPT', 'SAE', 'BSPT', 'BSPP'] }
]));
formData.append('warrantyTime', '12');
formData.append('hasWarranty', 'true');
formData.append('isNew', 'false');
formData.append('isOfferUnique', 'false');
formData.append('showPrice', 'true');
formData.append('state', 'true');
formData.append('productImages', valveImage1);
formData.append('catalogFile', valvesCatalogPdf);

this.http.post<Response>('http://localhost:5058/api/Products', formData).subscribe(...);
```

**Después de crear el producto con variantes**, se crean las variantes individualmente via `POST /api/ProductVariants`.

#### DELETE /api/Products/{id} — Eliminar producto

**Ejemplo:** `DELETE /api/Products/65f1a2b3c4d5e6f7g8h9i0j1`

**Comportamiento:**
1. Elimina todas las imágenes, catálogo y video de Cloudinary.
2. Si `hasVariations = true`, elimina **TODAS** las variantes asociadas (cascade delete).
3. Elimina el documento del producto de MongoDB.

→ `200 OK` con `"mensaje": "Producto eliminado"`. `404` si no existe.

---

## Módulo: ProductVariants (Variantes de Producto)

Las variantes son subproductos que pertenecen a un producto con `hasVariations = true`. Cada variante representa una combinación específica de los filtros primarios (ej: Material="Inox 316" + Diámetro="2\"") con su propio SKU, precio, stock y especificaciones secundarias.

**Almacenamiento:** Colección separada `productVariants` en MongoDB (NO embebidas en el producto padre). Esto permite queries eficientes y evita el límite de 16MB de MongoDB para productos con 200+ variantes.

### Interfaces TypeScript (Request)

```typescript
// Para el POST
interface CreateProductVariantRequest {
  productId: string;                      // ID del producto padre (debe existir y tener hasVariations=true)
  sku: string;                            // SKU único de esta variante
  primarySelection: Record<string, any>;  // Combinación de filtros seleccionados
  secondaryAttributes: Record<string, any>; // Specs técnicos de esta variante
  priceProvider: number;
  priceSale: number;
  stock: number;
  discount: number;
  state: boolean;
}

// Para el PUT
interface UpdateProductVariantRequest {
  id: string;                             // ID de la variante (requerido)
  sku?: string;
  primarySelection?: Record<string, any>;
  secondaryAttributes?: Record<string, any>;
  priceProvider?: number;
  priceSale?: number;
  stock?: number;
  discount?: number;
  state?: boolean;
}
```

### Endpoints de Variantes

| Método | Endpoint | Content-Type | Descripción | Respuesta exitosa |
|--------|----------|-------------|-------------|-------------------|
| GET | `/api/ProductVariants/by-product/{productId}?pageNumber=1&pageSize=50&filters[key]=value` | — | Variantes de un producto (con filtros dinámicos) | `data: PaginatedResult<ProductVariantDto>` |
| GET | `/api/ProductVariants/{id}` | — | Obtener variante por ID | `data: ProductVariantDto` |
| POST | `/api/ProductVariants` | `application/json` | Crear variante | `data: ProductVariantDto` |
| POST | `/api/ProductVariants/bulk` | `application/json` | Crear variantes en lote | `dataLista: ProductVariantDto[]` |
| PUT | `/api/ProductVariants` | `application/json` | Actualizar variante (parcial) | `data: ProductVariantDto` |
| DELETE | `/api/ProductVariants/{id}` | — | Eliminar variante | `data: null` |

**IMPORTANTE:**
- Las variantes usan `application/json` (NO multipart/form-data) porque no tienen archivos.
- El `productId` debe referir a un producto con `hasVariations = true`, sino retorna error.
- `pageSize` máximo es 200 para variantes (productos pueden tener muchas).
- Los **filtros dinámicos** se pasan como query params: `?filters[Material]=Inox 316&filters[Diámetro]=2"` para filtrar variantes por su `primarySelection`.

#### GET /api/ProductVariants/by-product/{productId} — Listar variantes con filtros

**Sin filtros (todas las variantes):**
```
GET /api/ProductVariants/by-product/65f1a2b3c4d5e6f7g8h9i0j2?pageNumber=1&pageSize=50
```

**Con filtros dinámicos (filtrar por combinación de primarias):**
```
GET /api/ProductVariants/by-product/65f1a2b3c4d5e6f7g8h9i0j2?pageNumber=1&pageSize=50&filters[Material]=Inox%20316&filters[Diámetro]=2"
```

**Response `200 OK`:**
```json
{
  "success": true,
  "mensaje": "Variantes encontradas",
  "data": {
    "items": [
      {
        "id": "66a1b2c3d4e5f6g7h8i9j0k1",
        "productId": "65f1a2b3c4d5e6f7g8h9i0j2",
        "sku": "8F1200S",
        "primarySelection": { "Material": "Inox 316", "Diámetro": "2\"", "Conexión": "NPT" },
        "secondaryAttributes": {
          "Función": "Flow Control",
          "Presión de trabajo máxima": "5000 psi",
          "Índice de caudal máximo": "25 gal/min",
          "Temperatura máxima": "+250 °F",
          "Temperatura mínima": "-40 °F",
          "Tipo de accionamiento": "Manual",
          "Estilo del resorte": "Metal",
          "Material de la junta": "Nitrile"
        },
        "priceProvider": 120.00,
        "priceSale": 180.00,
        "stock": 50,
        "discount": 0,
        "state": true,
        "createdAt": "2026-04-10T15:00:00Z",
        "updatedAt": "2026-04-10T15:00:00Z"
      }
    ],
    "pageNumber": 1,
    "pageSize": 50,
    "totalCount": 1,
    "totalPages": 1
  }
}
```

**Errores posibles:**
```json
{ "success": false, "mensaje": "Producto no encontrado" }
{ "success": false, "mensaje": "El producto no tiene variantes" }
```

#### POST /api/ProductVariants — Crear variante

**Request body (`application/json`):**
```json
{
  "productId": "65f1a2b3c4d5e6f7g8h9i0j2",
  "sku": "8F1200S",
  "primarySelection": {
    "Material": "Inox 316",
    "Diámetro": "2\"",
    "Conexión": "NPT"
  },
  "secondaryAttributes": {
    "Función": "Flow Control",
    "Presión de trabajo máxima": "5000 psi",
    "Índice de caudal máximo": "25 gal/min",
    "Temperatura máxima": "+250 °F",
    "Temperatura mínima": "-40 °F",
    "Tipo de accionamiento": "Manual",
    "Estilo del resorte": "Metal",
    "Material de la junta": "Nitrile"
  },
  "priceProvider": 120.00,
  "priceSale": 180.00,
  "stock": 50,
  "discount": 0,
  "state": true
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "mensaje": "Variante creada",
  "data": {
    "id": "66a1b2c3d4e5f6g7h8i9j0k1",
    "productId": "65f1a2b3c4d5e6f7g8h9i0j2",
    "sku": "8F1200S",
    "primarySelection": { "Material": "Inox 316", "Diámetro": "2\"", "Conexión": "NPT" },
    "secondaryAttributes": { "...": "..." },
    "priceProvider": 120.00,
    "priceSale": 180.00,
    "stock": 50,
    "discount": 0,
    "state": true,
    "createdAt": "2026-04-10T15:00:00Z",
    "updatedAt": "2026-04-10T15:00:00Z"
  }
}
```

**Errores posibles:**
```json
{ "success": false, "mensaje": "Producto padre no encontrado" }
{ "success": false, "mensaje": "El producto no admite variantes (HasVariations = false)" }
```

#### POST /api/ProductVariants/bulk — Crear variantes en lote

**Caso de uso:** El frontend envía todas las variantes de un producto de una sola vez (50-250+ variantes). Ideal para UX de creación masiva.

**Request body (`application/json`):**
```json
{
  "productId": "65f1a2b3c4d5e6f7g8h9i0j2",
  "variants": [
    {
      "sku": "8F1200S",
      "primarySelection": {
        "Material": "Inox 316",
        "Diámetro": "2\"",
        "Conexión": "NPT"
      },
      "secondaryAttributes": {
        "Función": "Flow Control",
        "Presión de trabajo máxima": "5000 psi"
      },
      "priceProvider": 120.00,
      "priceSale": 180.00,
      "stock": 50,
      "discount": 0,
      "state": true
    },
    {
      "sku": "8F1200M",
      "primarySelection": {
        "Material": "Inox 316",
        "Diámetro": "3\"",
        "Conexión": "NPT"
      },
      "secondaryAttributes": {
        "Función": "Flow Control",
        "Presión de trabajo máxima": "7500 psi"
      },
      "priceProvider": 150.00,
      "priceSale": 220.00,
      "stock": 30,
      "discount": 5,
      "state": true
    }
  ]
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "mensaje": "2 variantes creadas",
  "dataLista": [
    {
      "id": "66a1b2c3d4e5f6g7h8i9j0k1",
      "productId": "65f1a2b3c4d5e6f7g8h9i0j2",
      "sku": "8F1200S",
      "primarySelection": { "Material": "Inox 316", "Diámetro": "2\"", "Conexión": "NPT" },
      "secondaryAttributes": { "...": "..." },
      "priceProvider": 120.00,
      "priceSale": 180.00,
      "stock": 50,
      "discount": 0,
      "state": true,
      "createdAt": "2026-04-10T15:00:00Z",
      "updatedAt": "2026-04-10T15:00:00Z"
    },
    {
      "id": "66a1b2c3d4e5f6g7h8i9j0k2",
      "productId": "65f1a2b3c4d5e6f7g8h9i0j2",
      "sku": "8F1200M",
      "primarySelection": { "Material": "Inox 316", "Diámetro": "3\"", "Conexión": "NPT" },
      "secondaryAttributes": { "...": "..." },
      "priceProvider": 150.00,
      "priceSale": 220.00,
      "stock": 30,
      "discount": 5,
      "state": true,
      "createdAt": "2026-04-10T15:00:01Z",
      "updatedAt": "2026-04-10T15:00:01Z"
    }
  ]
}
```

**Errores posibles:**
```json
{ "success": false, "mensaje": "Producto padre no encontrado" }
{ "success": false, "mensaje": "El producto no admite variantes (HasVariations = false)" }
```

---

#### PUT /api/ProductVariants — Actualizar variante (parcial)

**Request body — solo campos a modificar + `id` requerido:**
```json
{
  "id": "66a1b2c3d4e5f6g7h8i9j0k1",
  "priceSale": 165.00,
  "stock": 45,
  "discount": 5
}
```

**Response:** `200 OK` con `data: ProductVariantDto` completo actualizado.

#### DELETE /api/ProductVariants/{id}

**Ejemplo:** `DELETE /api/ProductVariants/66a1b2c3d4e5f6g7h8i9j0k1`
→ `200 OK` con `"mensaje": "Variante eliminada"`. `404` si no existe.

---

## Resumen rápido de todos los Endpoints

| Módulo | Método | Endpoint | Respuesta en |
|--------|--------|----------|-------------|
| **Category** | GET | `/api/Category` | `dataLista` |
| | GET | `/api/Category/{id}` | `data` |
| | POST | `/api/Category` | `data` |
| | PUT | `/api/Category/{id}` | `data` |
| | DELETE | `/api/Category/{id}` | `data: null` |
| **SubCategory** | GET | `/api/SubCategory` | `dataLista` |
| | GET | `/api/SubCategory/{id}` | `data` |
| | GET | `/api/SubCategory/category/{categoryId}` | `dataLista` |
| | POST | `/api/SubCategory` | `data` |
| | PUT | `/api/SubCategory/{id}` | `data` |
| | DELETE | `/api/SubCategory/{id}` | `data: null` |
| **Speciality** | GET | `/api/Speciality?pageNumber&pageSize` | `data` (paginado) |
| | GET | `/api/Speciality/{id}` | `data` |
| | GET | `/api/Speciality/subcategory/{subCategoryId}` | `dataLista` |
| | POST | `/api/Speciality` | `data` |
| | PUT | `/api/Speciality/{id}` | `data` |
| | DELETE | `/api/Speciality/{id}` | `data: null` |
| **ProviderCategories** | POST | `/api/provider-categories` | `dataLista` |
| | DELETE | `/api/provider-categories/{providerId}/{categoryId}` | `data: null` |
| | GET | `/api/provider-categories/provider/{providerId}` | `dataLista` |
| | GET | `/api/provider-categories/category/{categoryId}` | `dataLista` |
| **Products** | GET | `/api/Products?providerId&specialityId&pageNumber&pageSize` | `data` (paginado) |
| | GET | `/api/Products/{id}` | `data: { product, variants }` |
| | POST | `/api/Products` (**multipart/form-data**) | `data` |
| | PUT | `/api/Products` (**multipart/form-data**) | `data` |
| | DELETE | `/api/Products/{id}` (cascade: variantes + Cloudinary) | `data: null` |
| **ProductVariants** | GET | `/api/ProductVariants/by-product/{productId}?filters[key]=val` | `data` (paginado) |
| | GET | `/api/ProductVariants/{id}` | `data` |
| | POST | `/api/ProductVariants` (**application/json**) | `data` |
| | POST | `/api/ProductVariants/bulk` (**application/json**) | `dataLista` |
| | PUT | `/api/ProductVariants` (**application/json**) | `data` |
| | DELETE | `/api/ProductVariants/{id}` | `data: null` |

---

## Relaciones entre Entidades

```
Provider (otro microservicio, tabla Providers.Id)
    │
    │ ProviderId (sin FK, solo referencia)
    ▼
ProviderCategories ──── N:N ────── Category
                                      │
                                      │ 1:N
                                      ▼
                                  SubCategory
                                      │
                                      │ 1:N
                                      ▼
                                  Speciality
                                      │
                                      │ 1:N
                                      ▼
                                   Product ← también tiene ProviderId
                                      │
                                      │ 1:N (solo si hasVariations = true)
                                      ▼
                                ProductVariant
```

- **Category 1 → N SubCategory**: Una categoría tiene muchas subcategorías
- **SubCategory 1 → N Speciality**: Una subcategoría tiene muchas especialidades
- **Speciality 1 → N Product**: Una especialidad tiene muchos productos
- **Product 1 → N ProductVariant**: Un producto con variantes tiene muchas variantes
- **Provider N ↔ N Category**: Relación muchos-a-muchos vía `ProviderCategories`
- **Provider 1 → N Product**: Un proveedor tiene muchos productos

### Almacenamiento

| Entidad | Base de datos | Colección/Tabla |
|---------|--------------|-----------------|
| Category | PostgreSQL (Supabase) | `categories` |
| SubCategory | PostgreSQL (Supabase) | `subcategories` |
| Speciality | PostgreSQL (Supabase) | `specialities` |
| ProviderCategory | PostgreSQL (Supabase) | `provider_categories` |
| Product | MongoDB | `products` |
| ProductVariant | MongoDB | `productVariants` |

---

## Guía para implementación Angular

### Servicios a crear

| Servicio | Responsabilidad |
|----------|----------------|
| `CategoryService` | CRUD de categorías |
| `SubCategoryService` | CRUD de subcategorías + filtro por categoría |
| `SpecialityService` | CRUD de especialidades + filtro por subcategoría + paginación |
| `ProviderCategoryService` | Asignar/remover categorías a proveedores + consultas bidireccionales |
| `ProductService` | CRUD de productos (simple y con variantes) + listado paginado |
| `ProductVariantService` | CRUD de variantes + query con filtros dinámicos |

### Tipos de datos importantes

| Entidad | Tipo de ID | Base de datos |
|---------|-----------|---------------|
| Category | `number` | PostgreSQL |
| SubCategory | `number` | PostgreSQL |
| Speciality | `number` | PostgreSQL |
| ProviderCategory | `number` | PostgreSQL |
| Product | `string` (ObjectId) | MongoDB |
| ProductVariant | `string` (ObjectId) | MongoDB |

### Dónde buscar los datos en la respuesta

| Si la respuesta tiene... | Buscar en | Tipo |
|--------------------------|-----------|------|
| Un solo objeto | `response.data` | `T` |
| Una lista | `response.dataLista` | `T[]` |
| Lista paginada (Products, Speciality, ProductVariants) | `response.data` | `PaginatedResult<T>` |
| Producto con variantes (GET by ID) | `response.data.product` + `response.data.variants` | `ProductDto` + `ProductVariantDto[]` |

### Ejemplo de servicio Angular para Products (con FormData)

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  private baseUrl = 'http://localhost:5058/api/Products';

  constructor(private http: HttpClient) {}

  getProducts(providerId: number, specialityId: number, pageNumber: number, pageSize: number): Observable<Response> {
    return this.http.get<Response>(
      `${this.baseUrl}?providerId=${providerId}&specialityId=${specialityId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  }

  getById(id: string): Observable<Response> {
    return this.http.get<Response>(`${this.baseUrl}/${id}`);
  }

  // IMPORTANTE: NO pasar headers con Content-Type
  create(data: any, images?: File[], catalog?: File, video?: File): Observable<Response> {
    const formData = this.buildFormData(data, images, catalog, video);
    return this.http.post<Response>(this.baseUrl, formData);
  }

  update(data: any, images?: File[], catalog?: File, video?: File): Observable<Response> {
    const formData = this.buildFormData(data, images, catalog, video);
    return this.http.put<Response>(this.baseUrl, formData);
  }

  delete(id: string): Observable<Response> {
    return this.http.delete<Response>(`${this.baseUrl}/${id}`);
  }

  private buildFormData(data: any, images?: File[], catalog?: File, video?: File): FormData {
    const formData = new FormData();

    for (const key of Object.keys(data)) {
      if (key === 'attributes') {
        formData.append('attributesJson', JSON.stringify(data[key]));
      } else if (key === 'primaryAttributes') {
        formData.append('primaryAttributesJson', JSON.stringify(data[key]));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, String(data[key]));
      }
    }

    if (images) {
      images.forEach(img => formData.append('productImages', img));
    }
    if (catalog) {
      formData.append('catalogFile', catalog);
    }
    if (video) {
      formData.append('videoFile', video);
    }

    return formData;
  }
}
```

### Ejemplo de servicio Angular para ProductVariants (JSON)

```typescript
@Injectable({ providedIn: 'root' })
export class ProductVariantService {
  private baseUrl = 'http://localhost:5058/api/ProductVariants';

  constructor(private http: HttpClient) {}

  // Obtener variantes con filtros dinámicos
  getByProductId(
    productId: string,
    pageNumber: number = 1,
    pageSize: number = 50,
    filters?: Record<string, string>
  ): Observable<Response> {
    let params = `?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        params += `&filters[${encodeURIComponent(key)}]=${encodeURIComponent(value)}`;
      }
    }
    return this.http.get<Response>(`${this.baseUrl}/by-product/${productId}${params}`);
  }

  getById(id: string): Observable<Response> {
    return this.http.get<Response>(`${this.baseUrl}/${id}`);
  }

  create(variant: CreateProductVariantRequest): Observable<Response> {
    return this.http.post<Response>(this.baseUrl, variant);
  }

  update(variant: UpdateProductVariantRequest): Observable<Response> {
    return this.http.put<Response>(this.baseUrl, variant);
  }

  delete(id: string): Observable<Response> {
    return this.http.delete<Response>(`${this.baseUrl}/${id}`);
  }
}
```

### Ejemplo de flujo completo en componentes

```typescript
// ═══════════════════════════════════════════════════════════
// CREAR PRODUCTO SIMPLE
// ═══════════════════════════════════════════════════════════
const simpleProduct = {
  providerId: 1,
  specialityId: 1,
  name: 'Laptop Gaming ASUS ROG',
  sku: 'ASUS-ROG-001',
  brand: 'ASUS',
  description: 'Laptop gaming de alta gama',
  countryOrigin: 'Taiwan',
  hasVariations: false,
  priceProvider: 1500,
  priceSale: 1899.99,
  stock: 50,
  discount: 10,
  attributes: { processor: 'i9-13900H', ram: '32GB DDR5', storage: '1TB SSD' },
  warrantyTime: 24,
  hasWarranty: true,
  isNew: true,
  isOfferUnique: false,
  showPrice: true,
  state: true
};

this.productService.create(simpleProduct, imageFiles, catalogFile)
  .subscribe(response => {
    if (response.success) {
      const product = response.data as ProductDto;
      console.log('Producto simple creado:', product.id);
    }
  });

// ═══════════════════════════════════════════════════════════
// CREAR PRODUCTO CON VARIANTES (2 pasos)
// ═══════════════════════════════════════════════════════════

// Paso 1: Crear el producto padre
const variantProduct = {
  providerId: 1,
  specialityId: 3,
  name: 'Válvulas de control de flujo - Serie F',
  brand: 'Colorflow',
  description: 'Válvulas hidráulicas de control de flujo en línea',
  countryOrigin: 'USA',
  hasVariations: true,
  primaryAttributes: [
    { name: 'Material', options: ['Inox 316', 'Bronce', 'Hierro fund.'] },
    { name: 'Diámetro', options: ['1"', '2"', '4"', '6"'] },
    { name: 'Conexión', options: ['NPT', 'SAE', 'BSPT'] }
  ],
  warrantyTime: 12,
  hasWarranty: true,
  isNew: false,
  isOfferUnique: false,
  showPrice: true,
  state: true
};

this.productService.create(variantProduct, valveImages, catalogPdf)
  .subscribe(response => {
    if (response.success) {
      const product = response.data as ProductDto;
      const productId = product.id;  // Guardar para crear variantes

      // Paso 2: Crear variantes asociadas
      const variant1: CreateProductVariantRequest = {
        productId: productId,
        sku: '8F1200S',
        primarySelection: { Material: 'Inox 316', Diámetro: '2"', Conexión: 'NPT' },
        secondaryAttributes: {
          Función: 'Flow Control',
          'Presión máxima': '5000 psi',
          'Caudal máximo': '25 gal/min',
          'Temp. máxima': '+250 °F'
        },
        priceProvider: 120,
        priceSale: 180,
        stock: 50,
        discount: 0,
        state: true
      };

      this.variantService.create(variant1).subscribe(...);
    }
  });

// ═══════════════════════════════════════════════════════════
// CONSULTAR PRODUCTO Y MOSTRAR VARIANTES
// ═══════════════════════════════════════════════════════════
this.productService.getById(productId).subscribe(response => {
  if (response.success) {
    const { product, variants } = response.data;

    if (product.hasVariations) {
      // Mostrar filtros desde primaryAttributes
      this.filters = product.primaryAttributes;  // [{name, options}]
      this.variants = variants;                  // ProductVariantDto[]
    } else {
      // Producto simple — mostrar precio/stock directo
      this.price = product.priceSale;
      this.stock = product.stock;
      this.specs = product.attributes;
    }
  }
});

// ═══════════════════════════════════════════════════════════
// FILTRAR VARIANTES DINÁMICAMENTE (usuario selecciona filtros)
// ═══════════════════════════════════════════════════════════
onFilterChange(selectedFilters: Record<string, string>) {
  // selectedFilters = { "Material": "Inox 316", "Diámetro": "2\"" }
  this.variantService.getByProductId(this.productId, 1, 50, selectedFilters)
    .subscribe(response => {
      if (response.success) {
        const paginated = response.data as PaginatedResult<ProductVariantDto>;
        this.filteredVariants = paginated.items;
      }
    });
}
```

### Reglas de negocio que debe conocer el frontend

1. **Fechas**: Todas vienen en UTC (ISO 8601). Convertir a local para mostrar al usuario.
2. **`state`**: En todas las entidades, `true` = activo, `false` = inactivo.
3. **`isPrimary` en ProviderCategories**: Solo UNA categoría puede ser primaria por proveedor.
4. **Products paginación**: `pageSize` máximo 50. ProductVariants máximo 200.
5. **`providerId`**: Corresponde al campo `Id` de la tabla `Providers` en el backend de Users. NO es el `UserId`.
6. **Actualización parcial**: Solo enviar campos modificados + `id` (tanto en Products como ProductVariants).
7. **`hasVariations` define el tipo de producto**:
   - `false` → Producto simple. Tiene `priceProvider`, `priceSale`, `stock`, `discount`, `attributes`. No tiene variantes.
   - `true` → Producto familia. Tiene `primaryAttributes`. NO tiene precio/stock propio. Las variantes tienen el precio/stock.
8. **Cascada de eliminación**:
   - Eliminar un producto con variantes → elimina automáticamente TODAS sus variantes.
   - Eliminar una categoría → elimina subcategorías y relaciones en ProviderCategories.
9. **Jerarquía de navegación**: Category → SubCategory → Speciality → Product → (ProductVariant).
10. **Flujo para producto con variantes**:
    - Primero crear el producto padre con `hasVariations: true` y `primaryAttributes`.
    - Luego crear cada variante via `POST /api/ProductVariants` referenciando el `productId`.
    - En el frontend, mostrar `primaryAttributes` como filtros/selectores.
    - Cuando el usuario selecciona una combinación, consultar variantes filtradas.
    - Mostrar `secondaryAttributes` como tabla de especificaciones de la variante seleccionada.
11. **Archivos de productos (Cloudinary)**:
    - Solo el producto padre tiene imágenes/video/catálogo. Las variantes NO tienen archivos propios.
    - POST/PUT de Products usan `multipart/form-data`. ProductVariants usan `application/json`.
    - En PUT Products, enviar archivos **reemplaza** los anteriores.
    - En DELETE, se eliminan automáticamente todos los archivos de Cloudinary + variantes.
12. **`attributes` vs `primaryAttributes`/`secondaryAttributes`**:
    - `attributes` (producto simple): Specs técnicos genéricos del producto. Se muestran en una tabla de "Ficha técnica".
    - `primaryAttributes` (producto padre con variantes): Definición de FILTROS. Cada atributo tiene `name` y `options[]`.
    - `secondaryAttributes` (en cada variante): Specs técnicos específicos de ESA variante. Se muestran al seleccionar la variante.
13. **Referencia para otros servicios (Orders, Reviews)**:
    - Producto simple → referenciar con `productId`.
    - Producto con variantes → referenciar con `productId` + `productVariantId` (el SKU y precio vienen de la variante).

---

**Versión:** 5.0  
**Última actualización:** Junio 2026
