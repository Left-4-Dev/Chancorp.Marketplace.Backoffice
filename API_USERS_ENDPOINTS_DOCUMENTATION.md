# Documentación de API - Chancorp Marketplace Users Service

## Información General

**Servicio:** Chancorp.Marketplace.Users  
**Descripción:** Microservicio para la gestión de usuarios, clientes y proveedores en el marketplace de Chancorp  
**Tecnología:** ASP.NET Core 8.0  
**Patrón de Arquitectura:** Clean Architecture + CQRS con MediatR  

---

## Estructura de Respuesta Estándar

Todos los endpoints retornan un objeto `Response` con la siguiente estructura:

```json
{
  "success": true,
  "mensaje": "Mensaje descriptivo de la operación",
  "detalle": "Detalles adicionales (opcional)",
  "data": {},
  "dataLista": [],
  "detailedErrors": [
    {
      "field": "nombreDelCampo",
      "message": "Mensaje de error del campo"
    }
  ]
}
```

### Propiedades del Response:
- **success** (boolean): Indica si la operación fue exitosa
- **mensaje** (string, nullable): Mensaje descriptivo del resultado
- **detalle** (string, nullable): Información adicional sobre el resultado
- **data** (object, nullable): Objeto con los datos retornados
- **dataLista** (array, nullable): Lista de objetos retornados
- **detailedErrors** (array, nullable): Lista de errores detallados por campo

---

## 1. ENDPOINTS DE CLIENTES (Client)

Base URL: `/api/Client`

### 1.1. Crear Cliente

**Endpoint:** `POST /api/Client`

**Descripción:** Crea un nuevo cliente junto con su usuario asociado. El sistema automáticamente crea un registro de Usuario con tipo "Client".

**Request Body:**
```json
{
  "userEmail": "string",
  "userPassword": "string",
  "contactName": "string",
  "contactSurname": "string",
  "customerType": "string",
  "docType": "string",
  "docNumber": "string",
  "phone": "string",
  "country": "string",
  "region": "string",
  "enterpriseName": "string",
  "enterpriseAddress": "string",
  "enterpriseEmail": "string"
}
```

**Campos del Request:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| userEmail | string | Sí | Email del usuario (credencial de acceso) |
| userPassword | string | Sí | Contraseña del usuario |
| contactName | string | Sí | Nombre del contacto principal |
| contactSurname | string | Sí | Apellido del contacto principal |
| customerType | string | Sí | Tipo de cliente (ej: "Persona Natural", "Empresa") |
| docType | string | Sí | Tipo de documento (ej: "DNI", "RUC", "Passport") |
| docNumber | string | Sí | Número de documento |
| phone | string | Sí | Teléfono de contacto |
| country | string | Sí | País |
| region | string | Sí | Región o estado |
| enterpriseName | string | Sí | Nombre de la empresa (si aplica) |
| enterpriseAddress | string | Sí | Dirección de la empresa |
| enterpriseEmail | string | Sí | Email corporativo de la empresa |

**Response exitoso (200 OK):**
```json
{
  "success": true,
  "mensaje": "Cliente creado exitosamente",
  "data": {
    "userId": 1,
    "clientId": 1,
    "userEmail": "cliente@example.com"
  }
}
```

**Response con error (200 OK con success: false):**
```json
{
  "success": false,
  "mensaje": "Error al crear el cliente",
  "detailedErrors": [
    {
      "field": "userEmail",
      "message": "El email ya está registrado"
    }
  ]
}
```

**Ejemplo de uso (cURL):**
```bash
curl -X POST "http://localhost:5000/api/Client" \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "cliente@example.com",
    "userPassword": "Password123!",
    "contactName": "Juan",
    "contactSurname": "Pérez",
    "customerType": "Empresa",
    "docType": "RUC",
    "docNumber": "20123456789",
    "phone": "+51987654321",
    "country": "Perú",
    "region": "Lima",
    "enterpriseName": "Empresa SAC",
    "enterpriseAddress": "Av. Principal 123",
    "enterpriseEmail": "contacto@empresa.com"
  }'
```

---

### 1.2. Obtener Cliente por ID

**Endpoint:** `GET /api/Client/{id}`

**Descripción:** Obtiene los datos completos de un cliente específico junto con su información de usuario asociado.

**⚠️ Nota:** El parámetro `{id}` corresponde al **UserId** (ID del usuario), no al ClientId.

**Parámetros de URL:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | int | ID del usuario asociado al cliente (UserId) |

**Response exitoso (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "userEmail": "cliente@example.com",
    "userPassword": "hashedPassword",
    "userType": "Client",
    "userState": true,
    "clientId": 1,
    "contactName": "Juan",
    "contactSurname": "Pérez",
    "customerType": "Empresa",
    "docType": "RUC",
    "docNumber": "20123456789",
    "phone": "+51987654321",
    "country": "Perú",
    "region": "Lima",
    "enterpriseName": "Empresa SAC",
    "enterpriseAddress": "Av. Principal 123",
    "enterpriseEmail": "contacto@empresa.com",
    "state": true,
    "createdAt": "2026-02-01T10:30:00Z",
    "updatedAt": "2026-02-15T14:20:00Z"
  }
}
```

**Campos del Response (ClientDetailDto):**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| userId | int | ID del usuario |
| userEmail | string | Email del usuario |
| userPassword | string | Contraseña del usuario (hasheada) |
| userType | string | Tipo de usuario (siempre "Client") |
| userState | boolean | Estado activo del usuario |
| clientId | int | ID del cliente |
| contactName | string | Nombre del contacto |
| contactSurname | string | Apellido del contacto |
| customerType | string | Tipo de cliente |
| docType | string | Tipo de documento |
| docNumber | string | Número de documento |
| phone | string | Teléfono |
| country | string | País |
| region | string | Región |
| enterpriseName | string | Nombre de empresa |
| enterpriseAddress | string | Dirección de empresa |
| enterpriseEmail | string | Email corporativo |
| state | boolean | Estado activo del cliente |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Fecha de última actualización |

**Response cuando no se encuentra (200 OK con success: false):**
```json
{
  "success": false,
  "mensaje": "Cliente no encontrado"
}
```

**Ejemplo de uso (cURL):**
```bash
# Obtener cliente por UserId (no ClientId)
curl -X GET "http://localhost:5000/api/Client/1"
```

---

### 1.3. Actualizar Cliente

**Endpoint:** `PUT /api/Client`

**Descripción:** Actualiza la información de un cliente existente. Todos los campos son opcionales excepto `userId`. Solo se actualizarán los campos que se envíen en el request.

**Request Body:**
```json
{
  "userId": 1,
  "userEmail": "string",
  "contactName": "string",
  "contactSurname": "string",
  "customerType": "string",
  "docType": "string",
  "docNumber": "string",
  "phone": "string",
  "country": "string",
  "region": "string",
  "enterpriseName": "string",
  "enterpriseAddress": "string",
  "enterpriseEmail": "string"
}
```

**Campos del Request:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| userId | int | Sí | ID del usuario a actualizar |
| userEmail | string | No | Nuevo email (si se desea cambiar) |
| contactName | string | No | Nombre del contacto |
| contactSurname | string | No | Apellido del contacto |
| customerType | string | No | Tipo de cliente |
| docType | string | No | Tipo de documento |
| docNumber | string | No | Número de documento |
| phone | string | No | Teléfono |
| country | string | No | País |
| region | string | No | Región |
| enterpriseName | string | No | Nombre de empresa |
| enterpriseAddress | string | No | Dirección de empresa |
| enterpriseEmail | string | No | Email corporativo |

**Response exitoso (200 OK):**
```json
{
  "success": true,
  "mensaje": "Cliente actualizado exitosamente",
  "data": {
    "userId": 1,
    "clientId": 1
  }
}
```

**Response con error (200 OK con success: false):**
```json
{
  "success": false,
  "mensaje": "Error al actualizar el cliente",
  "detailedErrors": [
    {
      "field": "userEmail",
      "message": "El email ya está en uso por otro usuario"
    }
  ]
}
```

**Ejemplo de uso (cURL):**
```bash
curl -X PUT "http://localhost:5000/api/Client" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "phone": "+51999888777",
    "enterpriseAddress": "Nueva Dirección 456"
  }'
```

---

## 2. ENDPOINTS DE PROVEEDORES (Provider)

Base URL: `/api/Provider`

### 2.1. Crear Proveedor

**Endpoint:** `POST /api/Provider`

**Descripción:** Crea un nuevo proveedor junto con su usuario asociado. El sistema automáticamente crea un registro de Usuario con tipo "Provider".

**Request Body:**
```json
{
  "userEmail": "string",
  "userPassword": "string",
  "enterpriseName": "string",
  "providerType": "string",
  "phone": "string",
  "sector": "string",
  "docType": "string",
  "docNumber": "string",
  "countryCode": "string",
  "region": "string",
  "address": "string",
  "website": "string"
}
```

**Campos del Request:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| userEmail | string | Sí | Email del usuario (credencial de acceso) |
| userPassword | string | Sí | Contraseña del usuario |
| enterpriseName | string | Sí | Nombre de la empresa proveedora |
| providerType | string | Sí | Tipo de proveedor (ej: "Mayorista", "Distribuidor", "Fabricante") |
| phone | string | Sí | Teléfono de contacto |
| sector | string | Sí | Sector o rubro (ej: "Tecnología", "Alimentos", "Textil") |
| docType | string | Sí | Tipo de documento (ej: "RUC", "Tax ID") |
| docNumber | string | Sí | Número de documento |
| countryCode | string | Sí | Código del país (ej: "PE", "US", "BR") |
| region | string | Sí | Región o estado |
| address | string | Sí | Dirección física |
| website | string | Sí | Sitio web de la empresa |

**Response exitoso (200 OK):**
```json
{
  "success": true,
  "mensaje": "Proveedor creado exitosamente",
  "data": {
    "userId": 2,
    "providerId": 1,
    "userEmail": "proveedor@example.com"
  }
}
```

**Response con error (200 OK con success: false):**
```json
{
  "success": false,
  "mensaje": "Error al crear el proveedor",
  "detailedErrors": [
    {
      "field": "docNumber",
      "message": "El número de documento ya está registrado"
    }
  ]
}
```

**Ejemplo de uso (cURL):**
```bash
curl -X POST "http://localhost:5000/api/Provider" \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "proveedor@example.com",
    "userPassword": "Password123!",
    "enterpriseName": "Proveedora SAC",
    "providerType": "Mayorista",
    "phone": "+51987654321",
    "sector": "Tecnología",
    "docType": "RUC",
    "docNumber": "20987654321",
    "countryCode": "PE",
    "region": "Lima",
    "address": "Av. Industrial 789",
    "website": "https://proveedora.com"
  }'
```

---

### 2.2. Listar Proveedores (Paginado)

**Endpoint:** `GET /api/Provider`

**Descripción:** Obtiene un listado paginado de todos los proveedores registrados en el sistema, incluyendo su información de usuario asociada. La paginación se controla mediante query parameters. El tamaño máximo de página es 50.

**Query Parameters:**
| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| pageNumber | int | No | 1 | Número de página a consultar (mínimo 1) |
| pageSize | int | No | 10 | Cantidad de registros por página (mínimo 1, máximo 50) |

**Response exitoso (200 OK):**
```json
{
  "success": true,
  "mensaje": "Proveedores encontrados",
  "data": {
    "items": [
      {
        "userId": 2,
        "userEmail": "proveedor1@example.com",
        "userPassword": "hashedPassword",
        "userType": "Provider",
        "userState": true,
        "providerId": 1,
        "enterpriseName": "Proveedora SAC",
        "providerType": "Mayorista",
        "phone": "+51987654321",
        "sector": "Tecnología",
        "docType": "RUC",
        "docNumber": "20987654321",
        "countryCode": "PE",
        "region": "Lima",
        "address": "Av. Industrial 789",
        "website": "https://proveedora.com",
        "state": true,
        "createdAt": "2026-02-01T10:30:00Z",
        "updatedAt": "2026-02-15T14:20:00Z"
      },
      {
        "userId": 5,
        "userEmail": "proveedor2@example.com",
        "userPassword": "hashedPassword",
        "userType": "Provider",
        "userState": true,
        "providerId": 2,
        "enterpriseName": "Distribuidora XYZ",
        "providerType": "Distribuidor",
        "phone": "+51912345678",
        "sector": "Alimentos",
        "docType": "RUC",
        "docNumber": "20111222333",
        "countryCode": "PE",
        "region": "Arequipa",
        "address": "Calle Comercio 456",
        "website": "https://distribuidora-xyz.com",
        "state": true,
        "createdAt": "2026-02-10T08:00:00Z",
        "updatedAt": "2026-03-01T12:00:00Z"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 25,
    "totalPages": 3,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

**Campos del Response (PaginatedResult<ProviderDetailDto>):**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| items | ProviderDetailDto[] | Lista de proveedores de la página actual |
| pageNumber | int | Número de página actual |
| pageSize | int | Tamaño de página solicitado |
| totalCount | int | Cantidad total de proveedores en la base de datos |
| totalPages | int | Cantidad total de páginas disponibles |
| hasPreviousPage | boolean | Indica si existe una página anterior |
| hasNextPage | boolean | Indica si existe una página siguiente |

**Campos de cada item (ProviderDetailDto):** (mismos campos que el endpoint GET `/api/Provider/{id}`, ver sección 2.3)

**Ejemplo de uso (cURL):**
```bash
# Primera página, 10 registros por defecto
curl -X GET "http://localhost:5000/api/Provider"

# Página 2, 5 registros por página
curl -X GET "http://localhost:5000/api/Provider?pageNumber=2&pageSize=5"

# Página 1, máximo de registros por página
curl -X GET "http://localhost:5000/api/Provider?pageNumber=1&pageSize=50"
```

---

### 2.3. Obtener Proveedor por ID

**Endpoint:** `GET /api/Provider/{id}`

**Descripción:** Obtiene los datos completos de un proveedor específico junto con su información de usuario asociado.

**⚠️ Nota:** El parámetro `{id}` corresponde al **UserId** (ID del usuario), no al ProviderId.

**Parámetros de URL:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | int | ID del usuario asociado al proveedor (UserId) |

**Response exitoso (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": 2,
    "userEmail": "proveedor@example.com",
    "userPassword": "hashedPassword",
    "userType": "Provider",
    "userState": true,
    "providerId": 1,
    "enterpriseName": "Proveedora SAC",
    "providerType": "Mayorista",
    "phone": "+51987654321",
    "sector": "Tecnología",
    "docType": "RUC",
    "docNumber": "20987654321",
    "countryCode": "PE",
    "region": "Lima",
    "address": "Av. Industrial 789",
    "website": "https://proveedora.com",
    "state": true,
    "createdAt": "2026-02-01T10:30:00Z",
    "updatedAt": "2026-02-15T14:20:00Z"
  }
}
```

**Campos del Response (ProviderDetailDto):**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| userId | int | ID del usuario |
| userEmail | string | Email del usuario |
| userPassword | string | Contraseña del usuario (hasheada) |
| userType | string | Tipo de usuario (siempre "Provider") |
| userState | boolean | Estado activo del usuario |
| providerId | int | ID del proveedor |
| enterpriseName | string | Nombre de la empresa |
| providerType | string | Tipo de proveedor |
| phone | string | Teléfono |
| sector | string | Sector o rubro |
| docType | string | Tipo de documento |
| docNumber | string | Número de documento |
| countryCode | string | Código del país |
| region | string | Región |
| address | string | Dirección |
| website | string | Sitio web |
| state | boolean | Estado activo del proveedor |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Fecha de última actualización |

**Response cuando no se encuentra (200 OK con success: false):**
```json
{
  "success": false,
  "mensaje": "Proveedor no encontrado"
}
```

**Ejemplo de uso (cURL):**
```bash
# Obtener proveedor por UserId (no ProviderId)
curl -X GET "http://localhost:5000/api/Provider/1"
```

---

### 2.4. Actualizar Proveedor

**Endpoint:** `PUT /api/Provider`

**Descripción:** Actualiza la información de un proveedor existente. Todos los campos son opcionales excepto `userId`. Solo se actualizarán los campos que se envíen en el request.

**Request Body:**
```json
{
  "userId": 2,
  "userEmail": "string",
  "enterpriseName": "string",
  "providerType": "string",
  "phone": "string",
  "sector": "string",
  "docType": "string",
  "docNumber": "string",
  "countryCode": "string",
  "region": "string",
  "address": "string",
  "website": "string"
}
```

**Campos del Request:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| userId | int | Sí | ID del usuario a actualizar |
| userEmail | string | No | Nuevo email (si se desea cambiar) |
| enterpriseName | string | No | Nombre de la empresa |
| providerType | string | No | Tipo de proveedor |
| phone | string | No | Teléfono |
| sector | string | No | Sector o rubro |
| docType | string | No | Tipo de documento |
| docNumber | string | No | Número de documento |
| countryCode | string | No | Código del país |
| region | string | No | Región |
| address | string | No | Dirección |
| website | string | No | Sitio web |

**Response exitoso (200 OK):**
```json
{
  "success": true,
  "mensaje": "Proveedor actualizado exitosamente",
  "data": {
    "userId": 2,
    "providerId": 1
  }
}
```

**Response con error (200 OK con success: false):**
```json
{
  "success": false,
  "mensaje": "Error al actualizar el proveedor",
  "detailedErrors": [
    {
      "field": "website",
      "message": "El formato de la URL no es válido"
    }
  ]
}
```

**Ejemplo de uso (cURL):**
```bash
curl -X PUT "http://localhost:5000/api/Provider" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "phone": "+51999888777",
    "website": "https://nuevositio.com"
  }'
```

---

## 3. ENDPOINTS DE USUARIOS (Users)

Base URL: `/api/Users`

### 3.1. Eliminar Usuario

**Endpoint:** `DELETE /api/Users/{id}`

**Descripción:** Elimina un usuario del sistema junto con sus datos asociados (Cliente o Proveedor). Esta operación es permanente y no se puede revertir.

**Parámetros de URL:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | int | ID del usuario a eliminar |

**Response exitoso (200 OK):**
```json
{
  "success": true,
  "mensaje": "Usuario eliminado exitosamente"
}
```

**Response cuando el usuario no existe (404 NOT FOUND):**
```json
{
  "success": false,
  "mensaje": "Usuario no encontrado"
}
```

**Response con error (200 OK con success: false):**
```json
{
  "success": false,
  "mensaje": "Error al eliminar el usuario",
  "detalle": "El usuario tiene pedidos pendientes y no puede ser eliminado"
}
```

**Ejemplo de uso (cURL):**
```bash
curl -X DELETE "http://localhost:5000/api/Users/1"
```

**⚠️ Nota importante:** 
- La eliminación de un usuario también eliminará en cascada sus datos de Cliente o Proveedor asociados
- El handler detecta automáticamente el tipo de usuario (Client/Provider) y elimina la entidad asociada antes de eliminar el usuario
- Verificar que no existan dependencias críticas antes de eliminar (pedidos activos, transacciones pendientes, etc.)
- Los endpoints `DELETE /api/Client/{id}` y `DELETE /api/Provider/{id}` existen en la capa de aplicación (Commands) pero están **comentados** en los controllers. Toda eliminación se gestiona a través de `DELETE /api/Users/{id}`

---

## 4. ENDPOINTS DE AUTENTICACIÓN (Auth)

Base URL: `/api/Auth`

**Autenticación:** Clerk (JWT). Todos los endpoints de este controller requieren `[Authorize]`.

### 4.1. Sincronizar Usuario

**Endpoint:** `POST /api/Auth/sync`

**Descripción:** Sincroniza el usuario autenticado de Clerk con la base de datos local. Debe llamarse después de cada login en el frontend. Maneja 3 escenarios:
1. **Usuario ya vinculado:** Retorna datos completos del usuario + perfil (Client/Provider)
2. **Email existe sin ClerkUserId:** Vincula automáticamente el ClerkUserId al usuario existente y retorna sus datos
3. **Usuario nuevo:** Retorna `isRegistered: false` indicando que debe completar el registro como Client o Provider

**Headers requeridos:**
```
Authorization: Bearer <JWT_TOKEN_DE_CLERK>
```

**Request Body:** Ninguno (los datos se extraen del JWT token)

**Response exitoso - Usuario ya registrado (200 OK):**
```json
{
  "success": true,
  "mensaje": "Usuario sincronizado correctamente",
  "data": {
    "userId": 14,
    "email": "alex.calizaya@pucp.edu.pe",
    "type": "Client",
    "state": true,
    "isRegistered": true,
    "profile": {
      "clientId": 1,
      "contactName": "Alex",
      "contactSurname": "Calizaya",
      "enterpriseName": "Mi Empresa SAC"
    }
  }
}
```

**Response exitoso - Usuario Provider registrado (200 OK):**
```json
{
  "success": true,
  "mensaje": "Usuario sincronizado correctamente",
  "data": {
    "userId": 16,
    "email": "francis.fari@gmail.com",
    "type": "Provider",
    "state": true,
    "isRegistered": true,
    "profile": {
      "providerId": 1,
      "enterpriseName": "Proveedora SAC",
      "providerType": "Mayorista"
    }
  }
}
```

**Response exitoso - Usuario no registrado (200 OK):**
```json
{
  "success": true,
  "mensaje": "Usuario autenticado pero no registrado en el sistema",
  "data": {
    "clerkUserId": "user_2xAbCdEfGhIjKl",
    "email": "nuevo@email.com",
    "isRegistered": false
  }
}
```

**Response sin token (401 Unauthorized):**
```json
{
  "success": false,
  "mensaje": "Token inválido: no se encontró ClerkUserId"
}
```

**Campos del Response (cuando isRegistered = true):**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| userId | int | ID del usuario local en la BD |
| email | string | Email del usuario |
| type | string | Tipo de usuario ("Client", "Provider", "Admin") |
| state | boolean | Estado activo del usuario |
| isRegistered | boolean | `true` si el usuario tiene perfil completo |
| profile | object/null | Datos resumidos del perfil (Client o Provider) |

**Campos del Response (cuando isRegistered = false):**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| clerkUserId | string | ID del usuario en Clerk |
| email | string | Email del usuario de Clerk |
| isRegistered | boolean | `false` — debe completar registro |

**Ejemplo de uso (cURL):**
```bash
curl -X POST "http://localhost:5000/api/Auth/sync" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 4.2. Obtener Datos del Token (Debug)

**Endpoint:** `GET /api/Auth/me`

**Descripción:** Retorna los claims (datos) extraídos del JWT de Clerk. Útil para debug y verificación de que el token se está enviando correctamente.

**Headers requeridos:**
```
Authorization: Bearer <JWT_TOKEN_DE_CLERK>
```

**Response exitoso (200 OK):**
```json
{
  "success": true,
  "data": {
    "clerkUserId": "user_2xAbCdEfGhIjKl",
    "email": "alex.calizaya@pucp.edu.pe"
  }
}
```

**Ejemplo de uso (cURL):**
```bash
curl -X GET "http://localhost:5000/api/Auth/me" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

## 5. CÓDIGOS DE ESTADO HTTP

| Código | Descripción | Uso en la API |
|--------|-------------|---------------|
| 200 OK | Solicitud exitosa | Todas las operaciones exitosas |
| 401 UNAUTHORIZED | No autenticado | Endpoints `[Authorize]` sin JWT o con JWT inválido |
| 404 NOT FOUND | Recurso no encontrado | Cuando un usuario/cliente/proveedor no existe |
| 400 BAD REQUEST | Solicitud inválida | Validaciones fallidas (no implementado actualmente) |
| 500 INTERNAL SERVER ERROR | Error del servidor | Errores no controlados |

**Nota:** Actualmente la API retorna 200 OK en la mayoría de los casos, incluso para errores. El campo `success` en el objeto Response indica si la operación fue exitosa o no.

---

## 6. CONSIDERACIONES PARA EL FRONTEND

### 6.1. Autenticación con Clerk
El servicio utiliza **Clerk** como proveedor de autenticación. Los endpoints marcados con `[Authorize]` requieren un JWT válido de Clerk en el header `Authorization: Bearer <token>`.

**Configuración:**
- **Clerk Authority:** `https://logical-narwhal-71.clerk.accounts.dev`
- **Publishable Key:** `pk_test_bG9naWNhbC1uYXJ3aGFsLTcxLmNsZXJrLmFjY291bnRzLmRldiQ`

**Endpoints protegidos actualmente:**
- `POST /api/Auth/sync` — Requiere JWT
- `GET /api/Auth/me` — Requiere JWT

**Endpoints públicos (sin autenticación requerida):**
- Todos los endpoints de Client, Provider y Users (pendiente de proteger)

### 6.2. Manejo de Errores
- Siempre verificar el campo `success` en la respuesta
- Si `success: false`, mostrar el `mensaje` al usuario
- Si existen `detailedErrors`, mostrar los errores específicos por campo
- Implementar validación del lado del cliente antes de enviar requests

### 6.3. Validaciones Recomendadas (Frontend)
| Campo | Validación |
|-------|------------|
| userEmail | Formato de email válido, único |
| userPassword | Mínimo 8 caracteres, al menos 1 mayúscula, 1 número |
| phone | Formato internacional (ej: +51987654321) |
| docNumber | Según tipo de documento (DNI: 8 dígitos, RUC: 11 dígitos) |
| website | URL válida (http:// o https://) |
| countryCode | Código ISO de país (2 letras) |

### 6.4. Flujo de Usuario Recomendado

#### Flujo de Autenticación (todos los usuarios):
1. **Login/Registro:** Usuario se autentica con Clerk en el frontend (email, Google, etc.)
2. **Sync:** POST `/api/Auth/sync` con JWT → Determina si el usuario ya está registrado
3. **Si `isRegistered: true`:** Redirigir al dashboard según `type` (Client/Provider)
4. **Si `isRegistered: false`:** Redirigir al formulario de registro (elegir Client o Provider)

#### Para Clientes:
1. **Registro:** POST `/api/Client` → Guardar **userId** del response
2. **Ver perfil:** GET `/api/Client/{userId}` ⚠️ Usar el **userId**, no el clientId
3. **Editar perfil:** PUT `/api/Client` con userId en el body
4. **Eliminar cuenta:** DELETE `/api/Users/{userId}`

#### Para Proveedores:
1. **Registro:** POST `/api/Provider` → Guardar **userId** del response
2. **Listar proveedores:** GET `/api/Provider?pageNumber=1&pageSize=10` → Tabla paginada
3. **Ver perfil:** GET `/api/Provider/{userId}` ⚠️ Usar el **userId**, no el providerId
4. **Editar perfil:** PUT `/api/Provider` con userId en el body
5. **Eliminar cuenta:** DELETE `/api/Users/{userId}`

### 6.5. Interfaces TypeScript Recomendadas

```typescript
// Response estándar
interface ApiResponse<T = any> {
  success: boolean;
  mensaje?: string;
  detalle?: string;
  data?: T;
  dataLista?: T[];
  detailedErrors?: DetailedError[];
}

interface DetailedError {
  field?: string;
  message?: string;
}

// Cliente
interface CreateClientRequest {
  userEmail: string;
  userPassword: string;
  contactName: string;
  contactSurname: string;
  customerType: string;
  docType: string;
  docNumber: string;
  phone: string;
  country: string;
  region: string;
  enterpriseName: string;
  enterpriseAddress: string;
  enterpriseEmail: string;
}

interface UpdateClientRequest {
  userId: number;
  userEmail?: string;
  contactName?: string;
  contactSurname?: string;
  customerType?: string;
  docType?: string;
  docNumber?: string;
  phone?: string;
  country?: string;
  region?: string;
  enterpriseName?: string;
  enterpriseAddress?: string;
  enterpriseEmail?: string;
}

interface ClientDetail {
  userId: number;
  userEmail: string;
  userPassword: string;
  userType: string;
  userState: boolean;
  clientId: number;
  contactName: string;
  contactSurname: string;
  customerType: string;
  docType: string;
  docNumber: string;
  phone: string;
  country: string;
  region: string;
  enterpriseName: string;
  enterpriseAddress: string;
  enterpriseEmail: string;
  state: boolean;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

// Proveedor
interface CreateProviderRequest {
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

interface UpdateProviderRequest {
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

interface ProviderDetail {
  userId: number;
  userEmail: string;
  userPassword: string;
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
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

// Paginación
interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Tipo específico para listado paginado de proveedores
type PaginatedProviders = PaginatedResult<ProviderDetail>;

// Autenticación / Sync
interface SyncResponse {
  userId?: number;
  email: string;
  type?: string;
  state?: boolean;
  isRegistered: boolean;
  profile?: ClientProfile | ProviderProfile;
  clerkUserId?: string;
}

interface ClientProfile {
  clientId: number;
  contactName: string;
  contactSurname: string;
  enterpriseName: string;
}

interface ProviderProfile {
  providerId: number;
  enterpriseName: string;
  providerType: string;
}

interface MeResponse {
  clerkUserId: string;
  email: string;
}
```

### 6.6. Servicios Angular Recomendados

```typescript
// client.service.ts
@Injectable({ providedIn: 'root' })
export class ClientService {
  private apiUrl = 'http://localhost:5000/api/Client';

  constructor(private http: HttpClient) {}

  create(request: CreateClientRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, request);
  }

  getById(id: number): Observable<ApiResponse<ClientDetail>> {
    return this.http.get<ApiResponse<ClientDetail>>(`${this.apiUrl}/${id}`);
  }

  update(request: UpdateClientRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(this.apiUrl, request);
  }
}

// provider.service.ts
@Injectable({ providedIn: 'root' })
export class ProviderService {
  private apiUrl = 'http://localhost:5000/api/Provider';

  constructor(private http: HttpClient) {}

  create(request: CreateProviderRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, request);
  }

  getAll(pageNumber: number = 1, pageSize: number = 10): Observable<ApiResponse<PaginatedProviders>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<ApiResponse<PaginatedProviders>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<ProviderDetail>> {
    return this.http.get<ApiResponse<ProviderDetail>>(`${this.apiUrl}/${id}`);
  }

  update(request: UpdateProviderRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(this.apiUrl, request);
  }
}

// auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/Auth';

  constructor(private http: HttpClient) {}

  sync(): Observable<ApiResponse<SyncResponse>> {
    return this.http.post<ApiResponse<SyncResponse>>(`${this.apiUrl}/sync`, {});
  }

  me(): Observable<ApiResponse<MeResponse>> {
    return this.http.get<ApiResponse<MeResponse>>(`${this.apiUrl}/me`);
  }
}

// user.service.ts
@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:5000/api/Users';

  constructor(private http: HttpClient) {}

  delete(userId: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${userId}`);
  }
}
```

---

## 7. RESUMEN DE ENDPOINTS

| Método | Endpoint | Auth | Descripción | Body | Response |
|--------|----------|------|-------------|------|----------|
| POST | `/api/Auth/sync` | 🔒 JWT | Sincronizar usuario Clerk con BD local | - (datos del JWT) | Response con SyncData |
| GET | `/api/Auth/me` | 🔒 JWT | Obtener claims del token (debug) | - | Response con MeData |
| POST | `/api/Client` | Público | Crear cliente | CreateClientCommand | Response con data |
| GET | `/api/Client/{id}` | Público | Obtener cliente por UserId | - | Response con ClientDetailDto |
| PUT | `/api/Client` | Público | Actualizar cliente | UpdateClientCommand | Response con data |
| POST | `/api/Provider` | Público | Crear proveedor | CreateProviderCommand | Response con data |
| GET | `/api/Provider` | Público | Listar proveedores (paginado) | Query: pageNumber, pageSize | Response con PaginatedResult<ProviderDetailDto> |
| GET | `/api/Provider/{id}` | Público | Obtener proveedor por UserId | - | Response con ProviderDetailDto |
| PUT | `/api/Provider` | Público | Actualizar proveedor | UpdateProviderCommand | Response con data |
| DELETE | `/api/Users/{id}` | Público | Eliminar usuario | - | Response |

---

## 8. INFORMACIÓN TÉCNICA ADICIONAL

### 8.1. Base de Datos
- **Motor:** PostgreSQL
- **ORM:** Entity Framework Core
- **Patrón:** Repository Pattern

### 8.2. Arquitectura
- **Capas:**
  - `Chancorp.Marketplace.Users`: API Layer (Controllers)
  - `Chancorp.Marketplace.Application`: Application Layer (Commands, Queries, DTOs)
  - `Chancorp.Marketplace.Domain`: Domain Layer (Entities, Interfaces)
  - `Chancorp.Marketplace.Infrastructure`: Infrastructure Layer (Repositories, DbContext)
- **Patrón:** CQRS con MediatR
- **Inyección de Dependencias:** Built-in .NET Core DI

### 8.3. Configuración del Servidor
- **Framework:** ASP.NET Core 8.0
- **Puerto por defecto:** 5000 (HTTP), 5001 (HTTPS)
- **CORS:** Configurar según necesidades del frontend

### 8.4. Variables de Entorno Recomendadas
```bash
API_BASE_URL=http://localhost:5000
```

---

## 9. PRÓXIMOS PASOS RECOMENDADOS

### Para el Backend:
1. ~~Implementar autenticación y autorización (JWT)~~ ✅ Implementado con Clerk
2. Agregar endpoint de listado (GetAll) para Clientes
3. ~~Implementar paginación en listados~~ ✅ Implementado para Proveedores
4. Agregar filtros y búsquedas
5. Implementar soft delete en lugar de delete permanente
6. Agregar validaciones más robustas con FluentValidation
7. Implementar logging centralizado
8. Agregar documentación con Swagger/OpenAPI

### Para el Frontend:
1. Crear módulos separados para Client, Provider y User
2. Implementar formularios reactivos con validaciones
3. Crear interceptores HTTP para manejo de errores globales
4. Implementar guards de navegación
5. Crear componentes de listado con paginación
6. Agregar confirmaciones para operaciones destructivas (delete)
7. Implementar feedback visual (toasts, spinners)
8. Guardar userId en localStorage/sessionStorage después del registro
9. Crear layouts diferentes para Clientes y Proveedores

---

**Fecha de documentación:** Marzo 2026  
**Versión de la API:** 1.3  
**Autor:** Sistema de Documentación Automática

**Changelog:**
- **v1.3 (Abril 2026):** Agregada autenticación con Clerk (JWT). Nuevos endpoints `POST /api/Auth/sync` y `GET /api/Auth/me`. Agregadas interfaces TypeScript `SyncResponse`, `MeResponse`, `ClientProfile`, `ProviderProfile`. Agregado `AuthService` Angular. Actualizado flujo de usuario con paso de autenticación. Campo `ClerkUserId` agregado a la entidad User.
- **v1.2 (Marzo 2026):** Corregida documentación de endpoints GET Client y GET Provider: el parámetro `{id}` es el **UserId**, no el ClientId/ProviderId. Aclarado que los endpoints DELETE de Client y Provider están comentados en los controllers (toda eliminación se gestiona vía `DELETE /api/Users/{id}`). Actualizado flujo de usuario recomendado.
- **v1.1 (Marzo 2026):** Agregado endpoint GET `/api/Provider` con paginación server-side (pageNumber, pageSize). Incluye interfaces TypeScript `PaginatedResult<T>` y método `getAll()` en `ProviderService`.
- **v1.0 (Febrero 2026):** Documentación inicial con CRUD de Clientes, Proveedores y eliminación de Usuarios.
