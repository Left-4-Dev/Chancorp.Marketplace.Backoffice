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

**Archivos (imágenes, catálogo, video):** Se envían como archivos reales via `multipart/form-data`. El backend los sube a **Cloudinary** y guarda las URLs en MongoDB. El frontend **NO** necesita interactuar con Cloudinary directamente.

### Interfaces TypeScript

```typescript
// Respuesta del backend (GET, POST, PUT) — no cambia
interface ProductDto {
  id: string;                          // ObjectId de MongoDB (string, NO number)
  providerId: number;                  // ID del proveedor (del otro backend)
  specialityId: number;                // FK → Speciality.id
  name: string;
  sku: string;
  brand: string;
  description: string;
  countryOrigin: string;
  priceProvider: number;               // Precio del proveedor (decimal)
  priceSale: number;                   // Precio de venta al público (decimal)
  stock: number;
  datasheet?: Record<string, any>;     // Especificaciones técnicas (objeto dinámico)
  variations?: Record<string, any>[];  // Variaciones: color, talla, etc. (array dinámico)
  catalog: string;                     // URL del PDF en Cloudinary
  productImg: string[];                // URLs de imágenes en Cloudinary
  productVideo: string;                // URL del video en Cloudinary
  warrantyTime: number;                // Meses de garantía
  hasWarranty: boolean;
  discount: number;                    // Porcentaje de descuento (ej: 10.0 = 10%)
  isNew: boolean;
  isOfferUnique: boolean;
  showPrice: boolean;                  // Si se muestra el precio en el frontend
  state: boolean;
  createdAt: string;
  updatedAt: string;
}

// Para construir el FormData en el POST
interface CreateProductFormFields {
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
  datasheetJson?: string;              // JSON.stringify(Record<string, any>)
  variationsJson?: string;             // JSON.stringify(Record<string, any>[])
  warrantyTime: number;
  hasWarranty: boolean;
  discount: number;
  isNew: boolean;
  isOfferUnique: boolean;
  showPrice: boolean;
  state: boolean;
  // Archivos — se envían como File en el FormData
  productImages?: File[];              // Imágenes del producto (múltiples)
  catalogFile?: File;                  // PDF del catálogo (uno solo)
  videoFile?: File;                    // Video del producto (uno solo)
}

// Para construir el FormData en el PUT — actualización PARCIAL
interface UpdateProductFormFields {
  id: string;                          // ObjectId (requerido siempre)
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
  datasheetJson?: string;              // JSON.stringify(Record<string, any>)
  variationsJson?: string;             // JSON.stringify(Record<string, any>[])
  warrantyTime?: number;
  hasWarranty?: boolean;
  discount?: number;
  isNew?: boolean;
  isOfferUnique?: boolean;
  showPrice?: boolean;
  state?: boolean;
  // Archivos — si se envían, REEMPLAZAN los anteriores en Cloudinary
  productImages?: File[];              // Si se envían, reemplazan TODAS las imágenes
  catalogFile?: File;                  // Si se envía, reemplaza el catálogo anterior
  videoFile?: File;                    // Si se envía, reemplaza el video anterior
}
```

### Endpoints

| Método | Endpoint | Content-Type | Descripción | Respuesta exitosa |
|--------|----------|-------------|-------------|-------------------|
| GET | `/api/Products?providerId=X&specialityId=Y&pageNumber=1&pageSize=10` | — | Listar paginado (filtros obligatorios) | `data: PaginatedResult<ProductDto>` |
| GET | `/api/Products/{id}` | — | Obtener por ID | `data: ProductDto` |
| POST | `/api/Products` | `multipart/form-data` | Crear con archivos | `data: ProductDto` |
| PUT | `/api/Products` | `multipart/form-data` | Actualizar (parcial) con archivos | `data: ProductDto` |
| DELETE | `/api/Products/{id}` | — | Eliminar (incluye archivos de Cloudinary) | `data: null` |

**IMPORTANTE para el frontend:**
- El `id` de productos es `string` (MongoDB ObjectId), no `number`.
- `GET /api/Products` requiere **2 query params obligatorios**: `providerId`, `specialityId`.
- La respuesta paginada viene en **`data`** (NO en `dataLista`).
- `PUT` recibe el `id` en el FormData (no en la URL). Solo actualiza los campos enviados.
- `pageSize` máximo es 50. Default: 10.
- **POST y PUT usan `multipart/form-data`** — NO `application/json`. Usar `FormData` en el frontend.
- **NO setear `Content-Type` manualmente** en el `HttpClient` para POST/PUT de Products. El browser lo pone automáticamente con el boundary correcto.
- **`datasheetJson` y `variationsJson`** son strings que contienen JSON serializado (usar `JSON.stringify()`).
- **`productImages`** es el nombre del campo para múltiples archivos de imagen. Se puede hacer `formData.append('productImages', file)` múltiples veces.
- **Archivos en PUT**: Si se envían `productImages`, `catalogFile` o `videoFile`, los archivos anteriores se **eliminan de Cloudinary** y se reemplazan. Si NO se envían, los archivos existentes se mantienen.
- **DELETE** elimina automáticamente todos los archivos del producto en Cloudinary (imágenes, catálogo, video).

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
        "priceProvider": 1500.00,
        "priceSale": 1899.99,
        "stock": 50,
        "datasheet": {
          "processor": "Intel Core i9-13900H",
          "ram": "32GB DDR5"
        },
        "variations": [
          { "color": "Negro", "storage": "1TB", "additionalPrice": 0 }
        ],
        "catalog": "https://res.cloudinary.com/dyaswn2t2/raw/upload/v1713/chancorp-marketplace/products/1/catalogs/gaming-laptops-2026.pdf",
        "productImg": ["https://res.cloudinary.com/dyaswn2t2/image/upload/v1713/chancorp-marketplace/products/1/images/img1.jpg"],
        "productVideo": "",
        "warrantyTime": 24,
        "hasWarranty": true,
        "discount": 10.0,
        "isNew": true,
        "isOfferUnique": false,
        "showPrice": true,
        "state": true,
        "createdAt": "2026-02-16T10:50:00Z",
        "updatedAt": "2026-02-16T10:50:00Z"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 25,
    "totalPages": 3
  }
}
```

**Si la especialidad no existe:**
```json
{
  "success": false,
  "mensaje": "La especialidad no existe"
}
```

#### POST /api/Products — Crear producto (multipart/form-data)

**Formato:** `multipart/form-data` — NO JSON.

**Campos del FormData:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `providerId` | string (número) | Sí | ID del proveedor |
| `specialityId` | string (número) | Sí | ID de la especialidad |
| `name` | string | Sí | Nombre del producto |
| `sku` | string | Sí | Código SKU |
| `brand` | string | Sí | Marca |
| `description` | string | Sí | Descripción |
| `countryOrigin` | string | Sí | País de origen |
| `priceProvider` | string (decimal) | Sí | Precio del proveedor |
| `priceSale` | string (decimal) | Sí | Precio de venta |
| `stock` | string (número) | Sí | Stock disponible |
| `datasheetJson` | string | No | `JSON.stringify({...})` con especificaciones técnicas |
| `variationsJson` | string | No | `JSON.stringify([{...}])` con variaciones |
| `warrantyTime` | string (número) | Sí | Meses de garantía |
| `hasWarranty` | string (boolean) | Sí | `"true"` o `"false"` |
| `discount` | string (decimal) | Sí | Porcentaje de descuento |
| `isNew` | string (boolean) | Sí | `"true"` o `"false"` |
| `isOfferUnique` | string (boolean) | Sí | `"true"` o `"false"` |
| `showPrice` | string (boolean) | Sí | `"true"` o `"false"` |
| `state` | string (boolean) | Sí | `"true"` o `"false"` |
| `productImages` | File (múltiple) | No | Archivos de imagen (jpg, png, webp) |
| `catalogFile` | File | No | Archivo PDF del catálogo |
| `videoFile` | File | No | Archivo de video (mp4, webm) |

**Ejemplo en TypeScript/Angular:**
```typescript
const formData = new FormData();
formData.append('providerId', '1');
formData.append('specialityId', '1');
formData.append('name', 'Laptop Gaming ASUS ROG');
formData.append('sku', 'ASUS-ROG-001');
formData.append('brand', 'ASUS');
formData.append('description', 'Laptop gaming de alta gama con RTX 4080');
formData.append('countryOrigin', 'Taiwan');
formData.append('priceProvider', '1500.00');
formData.append('priceSale', '1899.99');
formData.append('stock', '50');
formData.append('datasheetJson', JSON.stringify({
  processor: 'Intel Core i9-13900H',
  ram: '32GB DDR5',
  storage: '1TB NVMe SSD'
}));
formData.append('variationsJson', JSON.stringify([
  { color: 'Negro', storage: '1TB', additionalPrice: 0 },
  { color: 'Gris', storage: '2TB', additionalPrice: 200 }
]));
formData.append('warrantyTime', '24');
formData.append('hasWarranty', 'true');
formData.append('discount', '10.0');
formData.append('isNew', 'true');
formData.append('isOfferUnique', 'false');
formData.append('showPrice', 'true');
formData.append('state', 'true');

// Archivos — desde un <input type="file"> o drag & drop
formData.append('productImages', imageFile1);  // File object
formData.append('productImages', imageFile2);  // Mismo nombre para múltiples
formData.append('catalogFile', pdfFile);        // File object
formData.append('videoFile', videoFile);         // File object

// IMPORTANTE: NO setear Content-Type en headers
this.http.post<Response>('http://localhost:5058/api/Products', formData).subscribe(...);
```

→ `200 OK` con `data: ProductDto` (incluye el `id` generado por MongoDB y las URLs de Cloudinary en `productImg`, `catalog`, `productVideo`).

**Response ejemplo:**
```json
{
  "success": true,
  "mensaje": "Producto creado",
  "data": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "providerId": 1,
    "specialityId": 1,
    "name": "Laptop Gaming ASUS ROG",
    "catalog": "https://res.cloudinary.com/dyaswn2t2/raw/upload/v1713/chancorp-marketplace/products/1/catalogs/dell-2026.pdf",
    "productImg": [
      "https://res.cloudinary.com/dyaswn2t2/image/upload/v1713/chancorp-marketplace/products/1/images/img1.jpg",
      "https://res.cloudinary.com/dyaswn2t2/image/upload/v1713/chancorp-marketplace/products/1/images/img2.jpg"
    ],
    "productVideo": "https://res.cloudinary.com/dyaswn2t2/video/upload/v1713/chancorp-marketplace/products/1/videos/demo.mp4",
    "...": "demás campos"
  }
}
```

#### PUT /api/Products — Actualizar producto (parcial, multipart/form-data)

**Formato:** `multipart/form-data` — NO JSON.

Solo enviar en el FormData los campos que se quieren actualizar + `id` obligatorio. Los campos no enviados mantienen su valor actual.

**Reglas de archivos en PUT:**
- Si se envía `productImages` → se **eliminan TODAS** las imágenes anteriores de Cloudinary y se suben las nuevas.
- Si se envía `catalogFile` → se **elimina** el catálogo anterior de Cloudinary y se sube el nuevo.
- Si se envía `videoFile` → se **elimina** el video anterior de Cloudinary y se sube el nuevo.
- Si **NO** se envían archivos → los archivos existentes se mantienen intactos.

**Ejemplo — actualizar solo precio y stock (sin cambiar archivos):**
```typescript
const formData = new FormData();
formData.append('id', '65f1a2b3c4d5e6f7g8h9i0j1');
formData.append('priceSale', '1799.99');
formData.append('stock', '45');
formData.append('discount', '15.0');

this.http.put<Response>('http://localhost:5058/api/Products', formData).subscribe(...);
```

**Ejemplo — reemplazar imágenes del producto:**
```typescript
const formData = new FormData();
formData.append('id', '65f1a2b3c4d5e6f7g8h9i0j1');
formData.append('productImages', newImageFile1);
formData.append('productImages', newImageFile2);
// Las imágenes anteriores se eliminan de Cloudinary automáticamente

this.http.put<Response>('http://localhost:5058/api/Products', formData).subscribe(...);
```

→ `200 OK` con `data: ProductDto` completo (con URLs actualizadas). `404` si no existe.

#### DELETE /api/Products/{id}

**Ejemplo:** `DELETE /api/Products/65f1a2b3c4d5e6f7g8h9i0j1`
→ `200 OK` con `"mensaje": "Producto eliminado"`. `404` si no existe.

**Comportamiento:** Además de eliminar el documento de MongoDB, el backend **elimina automáticamente** de Cloudinary todas las imágenes, el catálogo PDF y el video asociados al producto. No se requiere acción adicional del frontend.

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
| | GET | `/api/Products/{id}` | `data` |
| | POST | `/api/Products` (**multipart/form-data**) | `data` |
| | PUT | `/api/Products` (**multipart/form-data**) | `data` |
| | DELETE | `/api/Products/{id}` (elimina archivos de Cloudinary) | `data: null` |

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
```

- **Category 1 → N SubCategory**: Una categoría tiene muchas subcategorías
- **SubCategory 1 → N Speciality**: Una subcategoría tiene muchas especialidades
- **Speciality 1 → N Product**: Una especialidad tiene muchos productos
- **Provider N ↔ N Category**: Relación muchos-a-muchos vía `ProviderCategories`
- **Provider 1 → N Product**: Un proveedor tiene muchos productos

---

## Guía para implementación Angular

### Servicios a crear

| Servicio | Responsabilidad |
|----------|----------------|
| `CategoryService` | CRUD de categorías |
| `SubCategoryService` | CRUD de subcategorías + filtro por categoría |
| `SpecialityService` | CRUD de especialidades + filtro por subcategoría + paginación |
| `ProviderCategoryService` | Asignar/remover categorías a proveedores + consultas bidireccionales |
| `ProductService` | CRUD de productos + listado paginado con filtros |

### Tipos de datos importantes

| Entidad | Tipo de ID | Base de datos |
|---------|-----------|---------------|
| Category | `number` | PostgreSQL |
| SubCategory | `number` | PostgreSQL |
| Speciality | `number` | PostgreSQL |
| ProviderCategory | `number` | PostgreSQL |
| Product | `string` (ObjectId) | MongoDB |

### Dónde buscar los datos en la respuesta

| Si la respuesta tiene... | Buscar en | Tipo |
|--------------------------|-----------|------|
| Un solo objeto | `response.data` | `T` |
| Una lista | `response.dataLista` | `T[]` |
| Lista paginada (Products y Speciality) | `response.data` | `PaginatedResult<T>` |

### Ejemplo de servicio Angular para ProviderCategories

```typescript
@Injectable({ providedIn: 'root' })
export class ProviderCategoryService {
  private baseUrl = 'http://localhost:5058/api/provider-categories';

  constructor(private http: HttpClient) {}

  assignCategories(request: AssignCategoriesToProviderRequest): Observable<Response> {
    return this.http.post<Response>(this.baseUrl, request);
  }

  removeCategory(providerId: number, categoryId: number): Observable<Response> {
    return this.http.delete<Response>(`${this.baseUrl}/${providerId}/${categoryId}`);
  }

  getCategoriesByProvider(providerId: number): Observable<Response> {
    return this.http.get<Response>(`${this.baseUrl}/provider/${providerId}`);
  }

  getProvidersByCategory(categoryId: number): Observable<Response> {
    return this.http.get<Response>(`${this.baseUrl}/category/${categoryId}`);
  }
}
```

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

  // IMPORTANTE: NO pasar headers con Content-Type
  update(data: any, images?: File[], catalog?: File, video?: File): Observable<Response> {
    const formData = this.buildFormData(data, images, catalog, video);
    return this.http.put<Response>(this.baseUrl, formData);
  }

  delete(id: string): Observable<Response> {
    return this.http.delete<Response>(`${this.baseUrl}/${id}`);
  }

  private buildFormData(data: any, images?: File[], catalog?: File, video?: File): FormData {
    const formData = new FormData();

    // Campos escalares
    for (const key of Object.keys(data)) {
      if (key === 'datasheet') {
        formData.append('datasheetJson', JSON.stringify(data[key]));
      } else if (key === 'variations') {
        formData.append('variationsJson', JSON.stringify(data[key]));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, String(data[key]));
      }
    }

    // Archivos
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

### Ejemplo de consumo en componentes

```typescript
// Listar categorías (dataLista)
this.categoryService.getAll().subscribe(response => {
  if (response.success) {
    this.categories = response.dataLista as CategoryDto[];
  }
});

// Obtener un producto por ID (data)
this.productService.getById(id).subscribe(response => {
  if (response.success) {
    this.product = response.data as ProductDto;
  }
});

// Listar productos paginados (data con PaginatedResult)
this.productService.getProducts(providerId, specialityId, page, size).subscribe(response => {
  if (response.success) {
    const paginated = response.data as PaginatedResult<ProductDto>;
    this.products = paginated.items;
    this.totalPages = paginated.totalPages;
  }
});

// Crear producto con archivos (FormData)
const productData = {
  providerId: 1,
  specialityId: 1,
  name: 'Laptop Gaming ASUS ROG',
  sku: 'ASUS-ROG-001',
  brand: 'ASUS',
  description: 'Laptop gaming de alta gama',
  countryOrigin: 'Taiwan',
  priceProvider: 1500,
  priceSale: 1899.99,
  stock: 50,
  datasheet: { processor: 'i9-13900H', ram: '32GB DDR5' },
  variations: [{ color: 'Negro', storage: '1TB' }],
  warrantyTime: 24,
  hasWarranty: true,
  discount: 10,
  isNew: true,
  isOfferUnique: false,
  showPrice: true,
  state: true
};

// imageFiles viene de un <input type="file" multiple>
const imageFiles: File[] = Array.from(fileInput.files);
const catalogFile: File = catalogInput.files[0];
const videoFile: File = videoInput.files[0];

this.productService.create(productData, imageFiles, catalogFile, videoFile)
  .subscribe(response => {
    if (response.success) {
      const product = response.data as ProductDto;
      console.log('URLs de imágenes:', product.productImg);  // URLs de Cloudinary
      console.log('URL del catálogo:', product.catalog);      // URL de Cloudinary
    }
  });

// Actualizar solo precio (sin tocar archivos)
this.productService.update({ id: '65f1a2b3...', priceSale: 1799.99 })
  .subscribe(...);

// Actualizar reemplazando imágenes
const newImages: File[] = [newFile1, newFile2];
this.productService.update({ id: '65f1a2b3...' }, newImages)
  .subscribe(...);

// Asignar categorías a proveedor (dataLista en respuesta)
const request: AssignCategoriesToProviderRequest = {
  providerId: 1,
  assignments: [
    { categoryId: 1, isPrimary: true },
    { categoryId: 3 }
  ]
};
this.providerCategoryService.assignCategories(request).subscribe(response => {
  if (response.success) {
    this.providerCategories = response.dataLista as ProviderCategoryDto[];
  }
});
```

### Reglas de negocio que debe conocer el frontend

1. **Fechas**: Todas vienen en UTC (ISO 8601). Convertir a local para mostrar al usuario.
2. **`state`**: En todas las entidades, `true` = activo, `false` = inactivo.
3. **`isPrimary` en ProviderCategories**: Solo UNA categoría puede ser primaria por proveedor. Si el usuario marca una nueva, enviarla con `isPrimary: true` y el backend desmarca la anterior.
4. **Products paginación**: `pageSize` máximo 50. El backend valida que la `specialityId` exista.
5. **`providerId`**: Corresponde al campo `Id` de la tabla `Providers` en el backend de Users. NO es el `UserId`.
6. **Actualización parcial de productos**: Solo enviar los campos modificados + el `id` en el FormData.
7. **`datasheet` y `variations`**: Son campos dinámicos. Se envían como JSON strings (`datasheetJson`, `variationsJson`) en el FormData. Usar `JSON.stringify()` para serializar.
8. **Cascada de eliminación**: Eliminar una categoría elimina sus subcategorías y las relaciones en ProviderCategories. Eliminar una subcategoría elimina sus especialidades.
9. **Jerarquía de navegación**: Category → SubCategory → Speciality → Product. Para llegar a productos, el usuario navega por los 3 niveles de clasificación.
10. **Archivos de productos (Cloudinary)**:
    - POST/PUT de Products usan `multipart/form-data` — **NO** `application/json`.
    - **NO** setear `Content-Type` en los headers del HttpClient para Products. El browser lo genera automáticamente.
    - Las imágenes, catálogo y video se suben al backend como `File` objects en el `FormData`.
    - El backend sube los archivos a Cloudinary y guarda las URLs en MongoDB.
    - En PUT, enviar archivos **reemplaza** los anteriores (los viejos se eliminan de Cloudinary).
    - En DELETE, el backend elimina automáticamente todos los archivos de Cloudinary.
    - Las URLs de archivos en la respuesta (`productImg`, `catalog`, `productVideo`) son URLs públicas de Cloudinary que se pueden usar directamente en `<img>`, `<a>`, `<video>`.

---

**Versión:** 4.0  
**Última actualización:** Abril 2026
