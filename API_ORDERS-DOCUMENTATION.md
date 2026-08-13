# Chancorp.Marketplace.Orders — API Documentation

> Microservicio de órdenes de compra. Base de datos: **MongoDB**.  
> Base URL (desarrollo): `http://localhost:5079`  
> Todas las respuestas siguen el wrapper estándar `Response`.

---

## Wrapper de Respuesta Estándar

Todas las respuestas de la API devuelven este objeto:

```typescript
interface ApiResponse {
  success: boolean;
  mensaje: string | null;
  detalle: string | null;
  detailedErrors: DetailedError[] | null;
  data: any | null;
  dataLista: any[] | null;
}

interface DetailedError {
  field: string | null;
  message: string | null;
}
```

---

## Interfaces TypeScript (para Angular v19)

### OrderDto

```typescript
export interface OrderDto {
  id: string;
  clientId: number;
  providerId: number;
  purchaseState: string;
  paymentMethod: string;
  total: number;
  deliveryDate: string | null;       // ISO 8601: "2026-01-20T00:00:00"
  mailingAddress: string;
  observations: string;
  state: boolean;
  createdAt: string;                 // ISO 8601
  updatedAt: string;                 // ISO 8601
  orderDetails: OrderDetailDto[] | null;
}
```

### OrderDetailDto

```typescript
export interface OrderDetailDto {
  id: string;
  orderId: string;
  productId: string;
  productVariantId: string | null; // ObjectId de la variante (null si es producto simple)
  productName: string;             // Nombre del producto (dato denormalizado)
  productImg: string;              // URL de imagen del producto (dato denormalizado)
  brand: string;                   // Marca del producto (dato denormalizado)
  providerName: string;            // Nombre del proveedor (dato denormalizado)
  sku: string;                     // SKU del producto o variante (dato denormalizado)
  quantity: number;
  cantCuotas: number;
  interes: number;
  precioxCuota: number;
  priceUnit: number;
  customDiscount: number;
  taxes: number;
  subtotal: number;
  state: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### ReviewDto

```typescript
export interface ReviewDto {
  id: string;
  productId: string;               // ObjectId del producto
  productVariantId: string | null; // ObjectId de la variante (null si es producto simple)
  clientId: number;
  providerId: number;              // ID del proveedor
  subject: string;
  description: string;
  rating: number;                  // Calificación (ej: 4.5)
  approvedState: string;           // Estado de aprobación (ej: "Approved", "Pending")
  state: boolean;
  createdAt: string;               // ISO 8601
  updatedAt: string;               // ISO 8601
}
```

### PaginatedResult\<T\>

```typescript
export interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
```

---

## Endpoints de Order

Base path: `/api/Order`

### 1. Obtener todas las órdenes

```
GET /api/Order?clientId={clientId}
```

| Parámetro  | Ubicación | Tipo     | Requerido | Descripción                          |
| ---------- | --------- | -------- | --------- | ------------------------------------ |
| `clientId` | query     | `number` | No        | Filtra órdenes por ID de cliente     |

**Response** `200 OK`  
`data`: `OrderDto[]` (cada orden incluye su array `orderDetails`).

```json
{
  "success": true,
  "mensaje": "Se encontraron 3 órdenes",
  "data": [
    {
      "id": "69657e02a984fae46a339ef6",
      "clientId": 1,
      "providerId": 1,
      "purchaseState": "Processing",
      "paymentMethod": "Tarjeta de Crédito Visa",
      "total": 2350,
      "deliveryDate": "2026-01-20T00:00:00",
      "mailingAddress": "Av. Javier Prado 123, San Isidro, Lima, Perú",
      "observations": "Entregar en horario de oficina (9am-6pm).",
      "state": true,
      "createdAt": "2026-01-12T14:30:00",
      "updatedAt": "2026-01-12T14:30:00",
      "orderDetails": [
        {
          "id": "64a1f2b3c4d5e6f7a8b9c0d1",
          "orderId": "69657e02a984fae46a339ef6",
          "productId": "60d5ec49f1a2c8b1a4e0c123",
          "productVariantId": null,
          "productName": "Laptop HP",
          "productImg": "https://res.cloudinary.com/.../laptop-hp.jpg",
          "brand": "HP",
          "providerName": "INVERSIONES PEPITO",
          "sku": "HP-LAP-001",
          "quantity": 2,
          "cantCuotas": 3,
          "interes": 5.5,
          "precioxCuota": 410.83,
          "priceUnit": 1175,
          "customDiscount": 0,
          "taxes": 0,
          "subtotal": 2350,
          "state": true,
          "createdAt": "2026-01-12T14:30:00",
          "updatedAt": "2026-01-12T14:30:00"
        }
      ]
    }
  ]
}
```

---

### 2. Obtener órdenes paginadas (con filtros obligatorios)

```
GET /api/Order/paginated?providerId={providerId}&startDate={startDate}&endDate={endDate}&pageNumber={pageNumber}&pageSize={pageSize}
```

| Parámetro    | Ubicación | Tipo       | Requerido | Default | Descripción                                    |
| ------------ | --------- | ---------- | --------- | ------- | ---------------------------------------------- |
| `providerId` | query     | `number`   | **Sí**    | —       | ID del proveedor                               |
| `startDate`  | query     | `DateTime` | **Sí**    | —       | Fecha inicio (ISO 8601: `2026-01-01T00:00:00`) |
| `endDate`    | query     | `DateTime` | **Sí**    | —       | Fecha fin (ISO 8601: `2026-03-15T23:59:59`)    |
| `pageNumber` | query     | `number`   | No        | `1`     | Número de página                                |
| `pageSize`   | query     | `number`   | No        | `10`    | Tamaño de página (max: 50)                     |

> **Formato de fecha desde Angular:** usar `toISOString()` o format `yyyy-MM-ddTHH:mm:ss` del DateTimePicker.

**Response** `200 OK`  
`data`: `PaginatedResult<OrderDto>` — cada orden incluye su array `orderDetails`.

```json
{
  "success": true,
  "mensaje": "Se encontraron 25 órdenes",
  "data": {
    "items": [
      {
        "id": "69657e02a984fae46a339ef6",
        "clientId": 1,
        "providerId": 1,
        "purchaseState": "Processing",
        "paymentMethod": "Tarjeta de Crédito Visa",
        "total": 2350,
        "deliveryDate": "2026-01-20T00:00:00",
        "mailingAddress": "Av. Javier Prado 123",
        "observations": "Entregar en horario de oficina",
        "state": true,
        "createdAt": "2026-01-12T14:30:00",
        "updatedAt": "2026-01-12T14:30:00",
        "orderDetails": []
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 25,
    "totalPages": 3
  }
}
```

**Ejemplo Angular:**

```typescript
getOrdersPaginated(
  providerId: number,
  startDate: Date,
  endDate: Date,
  pageNumber = 1,
  pageSize = 10
): Observable<ApiResponse> {
  const params = new HttpParams()
    .set('providerId', providerId)
    .set('startDate', startDate.toISOString())
    .set('endDate', endDate.toISOString())
    .set('pageNumber', pageNumber)
    .set('pageSize', pageSize);

  return this.http.get<ApiResponse>(`${this.baseUrl}/api/Order/paginated`, { params });
}
```

---

### 3. Obtener orden por ID

```
GET /api/Order/{id}
```

| Parámetro | Ubicación | Tipo     | Requerido | Descripción            |
| --------- | --------- | -------- | --------- | ---------------------- |
| `id`      | path      | `string` | **Sí**    | ObjectId de MongoDB    |

**Response** `200 OK`  
`data`: `OrderDto` (incluye `orderDetails`).

**Response** `404 Not Found`  
```json
{
  "success": false,
  "mensaje": "Orden con Id 64a... no encontrada",
  "data": null
}
```

---

### 4. Crear orden

```
POST /api/Order
Content-Type: application/json
```

**Request Body:**

```typescript
interface CreateOrderRequest {
  clientId: number;
  providerId: number;
  purchaseState: string;
  paymentMethod: string;
  total: number;
  deliveryDate: string | null;   // ISO 8601
  mailingAddress: string;
  observations: string;
  state: boolean;
}
```

```json
{
  "clientId": 1,
  "providerId": 1,
  "purchaseState": "Processing",
  "paymentMethod": "Tarjeta de Crédito Visa",
  "total": 2350,
  "deliveryDate": "2026-01-20T00:00:00",
  "mailingAddress": "Av. Javier Prado 123, San Isidro, Lima, Perú",
  "observations": "Entregar en horario de oficina",
  "state": true
}
```

**Response** `201 Created`  
`data`: `OrderDto` (la orden creada con su `id` generado).

**Response** `400 Bad Request` — si el body es nulo o inválido.

---

### 5. Actualizar orden

```
PUT /api/Order/{id}
Content-Type: application/json
```

| Parámetro | Ubicación | Tipo     | Requerido | Descripción         |
| --------- | --------- | -------- | --------- | ------------------- |
| `id`      | path      | `string` | **Sí**    | ObjectId de la orden |

**Request Body:**

```typescript
interface UpdateOrderRequest {
  providerId: number;
  purchaseState: string;
  paymentMethod: string;
  total: number;
  deliveryDate: string | null;
  mailingAddress: string;
  observations: string;
  state: boolean;
}
```

```json
{
  "providerId": 1,
  "purchaseState": "Shipped",
  "paymentMethod": "Tarjeta de Crédito Visa",
  "total": 2350,
  "deliveryDate": "2026-01-20T00:00:00",
  "mailingAddress": "Av. Javier Prado 123, San Isidro, Lima, Perú",
  "observations": "Entregar en horario de oficina",
  "state": true
}
```

**Response** `200 OK`  
`data`: `OrderDto` (la orden actualizada).

**Response** `404 Not Found` — si la orden no existe.

---

### 6. Eliminar orden

```
DELETE /api/Order/{id}
```

| Parámetro | Ubicación | Tipo     | Requerido | Descripción         |
| --------- | --------- | -------- | --------- | ------------------- |
| `id`      | path      | `string` | **Sí**    | ObjectId de la orden |

**Response** `200 OK`  
```json
{
  "success": true,
  "mensaje": "Orden eliminada exitosamente",
  "data": null
}
```

**Response** `404 Not Found` — si la orden no existe.

---

## Endpoints de OrderDetail

Base path: `/api/OrderDetail`

### 1. Obtener detalles de orden por OrderId

```
GET /api/OrderDetail/order/{orderId}
```

| Parámetro | Ubicación | Tipo     | Requerido | Descripción                    |
| --------- | --------- | -------- | --------- | ------------------------------ |
| `orderId` | path      | `string` | **Sí**    | ObjectId de la orden padre     |

**Response** `200 OK`  
`data`: `OrderDetailDto[]`

---

### 2. Obtener detalle de orden por ID

```
GET /api/OrderDetail/{id}
```

| Parámetro | Ubicación | Tipo     | Requerido | Descripción                   |
| --------- | --------- | -------- | --------- | ----------------------------- |
| `id`      | path      | `string` | **Sí**    | ObjectId del detalle de orden |

**Response** `200 OK`  
`data`: `OrderDetailDto`

**Response** `404 Not Found` — si el detalle no existe.

---

### 3. Crear detalle de orden

```
POST /api/OrderDetail
Content-Type: application/json
```

**Request Body:**

```typescript
interface CreateOrderDetailRequest {
  orderId: string;               // ObjectId de la orden padre
  productId: string;             // ObjectId del producto
  productVariantId: string | null; // ObjectId de la variante (null si es producto simple)
  productName: string;           // Nombre del producto (dato denormalizado)
  productImg: string;            // URL de imagen del producto (dato denormalizado)
  brand: string;                 // Marca del producto (dato denormalizado)
  providerName: string;          // Nombre del proveedor (dato denormalizado)
  sku: string;                   // SKU del producto o variante (dato denormalizado)
  quantity: number;
  cantCuotas: number;
  interes: number;
  precioxCuota: number;
  priceUnit: number;
  customDiscount: number;
  taxes: number;
  subtotal: number;
  state: boolean;
}
```

> **Nota sobre campos denormalizados:** `productName`, `productImg`, `brand`, `providerName` y `sku` se copian del producto (o de la variante, si aplica) al momento de crear el detalle. Esto garantiza que el historial de la orden mantenga los datos del producto tal como estaban al momento de la compra.

> **Nota sobre variantes:** Si el producto comprado tiene variantes (`hasVariations = true` en el microservicio de Productos), enviar `productVariantId` con el ObjectId de la variante seleccionada. El `sku` y `priceUnit` deben tomarse de la variante, no del producto padre. Si es un producto simple, enviar `productVariantId` como `null`.

```json
{
  "orderId": "69657e02a984fae46a339ef6",
  "productId": "60d5ec49f1a2c8b1a4e0c123",
  "productVariantId": null,
  "productName": "Laptop HP",
  "productImg": "https://example.com/img/laptop-hp.jpg",
  "brand": "HP",
  "providerName": "INVERSIONES PEPITO",
  "sku": "31131324234242242",
  "quantity": 2,
  "cantCuotas": 3,
  "interes": 5.5,
  "precioxCuota": 410.83,
  "priceUnit": 1175,
  "customDiscount": 0,
  "taxes": 0,
  "subtotal": 2350,
  "state": true
}
```

**Response** `201 Created`  
`data`: `OrderDetailDto`

**Response** `400 Bad Request` — si el body es nulo o inválido.

---

### 4. Actualizar detalle de orden

```
PUT /api/OrderDetail/{id}
Content-Type: application/json
```

| Parámetro | Ubicación | Tipo     | Requerido | Descripción                   |
| --------- | --------- | -------- | --------- | ----------------------------- |
| `id`      | path      | `string` | **Sí**    | ObjectId del detalle de orden |

**Request Body:**

```typescript
interface UpdateOrderDetailRequest {
  quantity: number;
  cantCuotas: number;
  interes: number;
  precioxCuota: number;
  priceUnit: number;
  customDiscount: number;
  taxes: number;
  subtotal: number;
  state: boolean;
}
```

```json
{
  "quantity": 3,
  "cantCuotas": 6,
  "interes": 4.5,
  "precioxCuota": 600,
  "priceUnit": 1175,
  "customDiscount": 50,
  "taxes": 18,
  "subtotal": 3525,
  "state": true
}
```

**Response** `200 OK`  
`data`: `OrderDetailDto`

**Response** `404 Not Found` — si el detalle no existe.

---

### 5. Eliminar detalle de orden

```
DELETE /api/OrderDetail/{id}
```

| Parámetro | Ubicación | Tipo     | Requerido | Descripción                   |
| --------- | --------- | -------- | --------- | ----------------------------- |
| `id`      | path      | `string` | **Sí**    | ObjectId del detalle de orden |

**Response** `200 OK`  
```json
{
  "success": true,
  "mensaje": "Detalle de orden eliminado exitosamente",
  "data": null
}
```

**Response** `404 Not Found` — si el detalle no existe.

---

## Endpoints de Review

Base path: `/api/Review`

### 1. Obtener reviews paginadas (excluyendo Pending)

```
GET /api/Review/paginated?providerId={providerId}&startDate={startDate}&endDate={endDate}&pageNumber={pageNumber}&pageSize={pageSize}
```

| Parámetro    | Ubicación | Tipo       | Requerido | Default | Descripción                                    |
| ------------ | --------- | ---------- | --------- | ------- | ---------------------------------------------- |
| `providerId` | query     | `number`   | No        | —       | Filtra por ID del proveedor                    |
| `startDate`  | query     | `DateTime` | No        | —       | Fecha inicio (ISO 8601: `2026-01-01T00:00:00`) |
| `endDate`    | query     | `DateTime` | No        | —       | Fecha fin (ISO 8601: `2026-03-15T23:59:59`)    |
| `pageNumber` | query     | `number`   | No        | `1`     | Número de página                               |
| `pageSize`   | query     | `number`   | No        | `10`    | Tamaño de página (max: 50)                     |

> Lista todas las reviews **excepto** las que tienen `approvedState == "Pending"` (estas se consultan en el endpoint `/pending`). Todos los filtros son opcionales. Ordenadas por `createdAt` descendente.

**Response** `200 OK`  
`data`: `PaginatedResult<ReviewDto>`

```json
{
  "success": true,
  "mensaje": "Se encontraron 12 reviews",
  "data": {
    "items": [
      {
        "id": "6965ca70a984fae46a339f06",
        "productId": "6965763aa984fae46a339eef",
        "productVariantId": null,
        "clientId": 1,
        "providerId": 1,
        "subject": "Excelente producto",
        "description": "La laptop llegó en perfectas condiciones.",
        "rating": 4.5,
        "approvedState": "Approved",
        "state": true,
        "createdAt": "2026-01-10T09:20:00",
        "updatedAt": "2026-01-10T10:00:00"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 12,
    "totalPages": 2
  }
}
```

**Ejemplo Angular:**

```typescript
getReviewsPaginated(
  pageNumber = 1,
  pageSize = 10,
  providerId?: number,
  startDate?: Date,
  endDate?: Date
): Observable<ApiResponse> {
  let params = new HttpParams()
    .set('pageNumber', pageNumber)
    .set('pageSize', pageSize);

  if (providerId) params = params.set('providerId', providerId);
  if (startDate) params = params.set('startDate', startDate.toISOString());
  if (endDate) params = params.set('endDate', endDate.toISOString());

  return this.http.get<ApiResponse>(`${this.baseUrl}/api/Review/paginated`, { params });
}
```

---

### 2. Obtener reviews por ProductId

```
GET /api/Review/product/{productId}
```

| Parámetro   | Ubicación | Tipo     | Requerido | Descripción                  |
| ----------- | --------- | -------- | --------- | ---------------------------- |
| `productId` | path      | `string` | **Sí**    | ObjectId del producto        |

**Response** `200 OK`  
`data`: `ReviewDto[]`

```json
{
  "success": true,
  "mensaje": "Se encontraron 3 reviews",
  "data": [
    {
      "id": "6965ca70a984fae46a339f06",
      "productId": "6965763aa984fae46a339eef",
      "productVariantId": null,
      "clientId": 1,
      "subject": "Excelente producto",
      "description": "La laptop llegó en perfectas condiciones, funciona muy bien.",
      "rating": 4.5,
      "approvedState": "Approved",
      "state": true,
      "createdAt": "2026-01-10T09:20:00",
      "updatedAt": "2026-01-10T10:00:00"
    }
  ]
}
```

---

### 3. Obtener reviews pendientes paginadas

```
GET /api/Review/pending?providerId={providerId}&startDate={startDate}&endDate={endDate}&pageNumber={pageNumber}&pageSize={pageSize}
```

| Parámetro    | Ubicación | Tipo       | Requerido | Default | Descripción                                    |
| ------------ | --------- | ---------- | --------- | ------- | ---------------------------------------------- |
| `providerId` | query     | `number`   | No        | —       | Filtra por ID del proveedor                    |
| `startDate`  | query     | `DateTime` | No        | —       | Fecha inicio (ISO 8601: `2026-01-01T00:00:00`) |
| `endDate`    | query     | `DateTime` | No        | —       | Fecha fin (ISO 8601: `2026-03-15T23:59:59`)    |
| `pageNumber` | query     | `number`   | No        | `1`     | Número de página                               |
| `pageSize`   | query     | `number`   | No        | `10`    | Tamaño de página (max: 50)                     |

> Solo lista reviews cuyo `approvedState` es `"Pending"`. Los filtros `providerId`, `startDate` y `endDate` son **opcionales**: si no se envían, se listan todas las reviews pendientes. Ordenadas por `createdAt` descendente (más recientes primero).

**Response** `200 OK`  
`data`: `PaginatedResult<ReviewDto>`

```json
{
  "success": true,
  "mensaje": "Se encontraron 5 reviews pendientes",
  "data": {
    "items": [
      {
        "id": "6965ca70a984fae46a339f06",
        "productId": "6965763aa984fae46a339eef",
        "productVariantId": null,
        "clientId": 1,
        "providerId": 1,
        "subject": "Excelente producto",
        "description": "La laptop llegó en perfectas condiciones.",
        "rating": 4.5,
        "approvedState": "Pending",
        "state": true,
        "createdAt": "2026-01-10T09:20:00",
        "updatedAt": "2026-01-10T10:00:00"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 5,
    "totalPages": 1
  }
}
```

**Ejemplo Angular:**

```typescript
getPendingReviews(
  pageNumber = 1,
  pageSize = 10,
  providerId?: number,
  startDate?: Date,
  endDate?: Date
): Observable<ApiResponse> {
  let params = new HttpParams()
    .set('pageNumber', pageNumber)
    .set('pageSize', pageSize);

  if (providerId) params = params.set('providerId', providerId);
  if (startDate) params = params.set('startDate', startDate.toISOString());
  if (endDate) params = params.set('endDate', endDate.toISOString());

  return this.http.get<ApiResponse>(`${this.baseUrl}/api/Review/pending`, { params });
}
```

---

### 4. Obtener reviews por ClientId

```
GET /api/Review/client/{clientId}
```

| Parámetro  | Ubicación | Tipo     | Requerido | Descripción          |
| ---------- | --------- | -------- | --------- | -------------------- |
| `clientId` | path      | `number` | **Sí**    | ID del cliente       |

**Response** `200 OK`  
`data`: `ReviewDto[]`

---

### 5. Obtener review por ID

```
GET /api/Review/{id}
```

| Parámetro | Ubicación | Tipo     | Requerido | Descripción             |
| --------- | --------- | -------- | --------- | ----------------------- |
| `id`      | path      | `string` | **Sí**    | ObjectId de la review   |

**Response** `200 OK`  
`data`: `ReviewDto`

**Response** `404 Not Found`  
```json
{
  "success": false,
  "mensaje": "Review con Id 64a... no encontrada",
  "data": null
}
```

---

### 6. Crear review

```
POST /api/Review
Content-Type: application/json
```

**Request Body:**

```typescript
interface CreateReviewRequest {
  productId: string;             // ObjectId del producto
  productVariantId: string | null; // ObjectId de la variante (null si es producto simple)
  clientId: number;
  providerId: number;            // ID del proveedor
  subject: string;
  description: string;
  rating: number;                // Calificación (ej: 4.5)
  approvedState: string;         // Estado de aprobación (ej: "Pending")
  state: boolean;
}
```

```json
{
  "productId": "6965763aa984fae46a339eef",
  "productVariantId": null,
  "clientId": 1,
  "providerId": 1,
  "subject": "Excelente producto",
  "description": "La laptop llegó en perfectas condiciones, funciona muy bien y la batería dura bastante.",
  "rating": 4.5,
  "approvedState": "Pending",
  "state": true
}
```

**Response** `201 Created`  
`data`: `ReviewDto` (la review creada con su `id` generado).

**Response** `400 Bad Request` — si el body es nulo o inválido.

---

### 7. Actualizar review

```
PUT /api/Review/{id}
Content-Type: application/json
```

| Parámetro | Ubicación | Tipo     | Requerido | Descripción             |
| --------- | --------- | -------- | --------- | ----------------------- |
| `id`      | path      | `string` | **Sí**    | ObjectId de la review   |

**Request Body:**

```typescript
interface UpdateReviewRequest {
  subject: string;
  description: string;
  rating: number;
  approvedState: string;
  state: boolean;
}
```

```json
{
  "subject": "Buen producto",
  "description": "Actualizo mi review, sigue funcionando bien después de 2 meses.",
  "rating": 4.0,
  "approvedState": "Approved",
  "state": true
}
```

**Response** `200 OK`  
`data`: `ReviewDto` (la review actualizada).

**Response** `404 Not Found` — si la review no existe.

---

### 8. Eliminar review

```
DELETE /api/Review/{id}
```

| Parámetro | Ubicación | Tipo     | Requerido | Descripción             |
| --------- | --------- | -------- | --------- | ----------------------- |
| `id`      | path      | `string` | **Sí**    | ObjectId de la review   |

**Response** `200 OK`  
```json
{
  "success": true,
  "mensaje": "Review eliminada exitosamente",
  "data": null
}
```

**Response** `404 Not Found` — si la review no existe.

---

## Resumen de Endpoints

| Método   | Ruta                                | Descripción                                   |
| -------- | ----------------------------------- | --------------------------------------------- |
| `GET`    | `/api/Order?clientId=`              | Listar órdenes (filtro opcional por clientId)  |
| `GET`    | `/api/Order/paginated?...`          | Órdenes paginadas (providerId + rango fechas) |
| `GET`    | `/api/Order/{id}`                   | Obtener orden por ID (con detalles)            |
| `POST`   | `/api/Order`                        | Crear orden                                    |
| `PUT`    | `/api/Order/{id}`                   | Actualizar orden                               |
| `DELETE` | `/api/Order/{id}`                   | Eliminar orden                                 |
| `GET`    | `/api/OrderDetail/order/{orderId}`  | Listar detalles por orderId                    |
| `GET`    | `/api/OrderDetail/{id}`             | Obtener detalle por ID                         |
| `POST`   | `/api/OrderDetail`                  | Crear detalle de orden                         |
| `PUT`    | `/api/OrderDetail/{id}`             | Actualizar detalle de orden                    |
| `DELETE` | `/api/OrderDetail/{id}`             | Eliminar detalle de orden                      |
| `GET`    | `/api/Review/paginated?...`         | Reviews paginadas (excluye Pending)            |
| `GET`    | `/api/Review/product/{productId}`   | Listar reviews por productId                   |
| `GET`    | `/api/Review/pending?...`           | Reviews pendientes paginadas                   |
| `GET`    | `/api/Review/client/{clientId}`     | Listar reviews por clientId                    |
| `GET`    | `/api/Review/{id}`                  | Obtener review por ID                          |
| `POST`   | `/api/Review`                       | Crear review                                   |
| `PUT`    | `/api/Review/{id}`                  | Actualizar review                              |
| `DELETE` | `/api/Review/{id}`                  | Eliminar review                                |

---

## Notas para el Frontend Angular v19

1. **Base URL**: `http://localhost:5079` (desarrollo).
2. **Formato de fechas**: Usar ISO 8601 (`yyyy-MM-ddTHH:mm:ss`). Angular `DatePipe` y `Date.toISOString()` son compatibles nativamente.
3. **IDs**: Todos los IDs son `string` (MongoDB ObjectId de 24 caracteres hexadecimales).
4. **Paginación**: El endpoint paginado requiere `providerId`, `startDate` y `endDate` como obligatorios. `pageNumber` y `pageSize` son opcionales (defaults: 1 y 10, max pageSize: 50).
5. **Respuesta wrapper**: Siempre verificar `response.success` antes de usar `response.data`.
6. **OrderDetails embebidos**: Al consultar órdenes (GET, GET paginated), los `orderDetails` vienen embebidos como array dentro de cada orden.
7. **Campos denormalizados en OrderDetail**: `productName`, `productImg`, `brand`, `providerName` y `sku` se guardan al momento de crear el detalle. Estos datos representan el estado del producto al momento de la compra.
8. **Soporte de variantes de producto**: Los campos `productVariantId` en `OrderDetail` y `Review` permiten referenciar una variante específica de un producto con variantes (`hasVariations = true` en el microservicio de Productos). Para productos simples, este campo es `null`. Cuando el producto tiene variantes, el `sku` y `priceUnit` del detalle deben tomarse de la variante, no del producto padre.
9. **Reviews**: Las reviews se consultan por `productId` o `clientId`. El campo `approvedState` indica si la review fue aprobada (ej: `"Pending"`, `"Approved"`, `"Rejected"`).
10. **CORS**: Asegurar que el backend tenga configurado CORS para el dominio del frontend Angular.
