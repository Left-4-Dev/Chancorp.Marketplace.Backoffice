# Instrucciones: Integrar Clerk Authentication en Angular

## Contexto del Proyecto

Tengo un marketplace con múltiples backends .NET 8 que ya tienen configurada la validación de JWT de Clerk. Necesito integrar Clerk en mi proyecto Angular para manejar la autenticación.

### Datos de configuración de Clerk:
- **Publishable Key:** `pk_test_bG9naWNhbC1uYXJ3aGFsLTcxLmNsZXJrLmFjY291bnRzLmRldiQ`
- **Authority:** `https://logical-narwhal-71.clerk.accounts.dev`

### Backend - Users Service (ya implementado):
- **URL base:** `http://localhost:5000`
- **Endpoint de sync:** `POST /api/Auth/sync` — Requiere JWT en header `Authorization: Bearer <token>`. Sincroniza el usuario de Clerk con la BD local. Retorna los datos del usuario y su perfil.
- **Endpoint debug:** `GET /api/Auth/me` — Requiere JWT. Retorna claims del token.

### Response del endpoint sync:

**Cuando el usuario YA está registrado (`isRegistered: true`):**
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

**Cuando el usuario NO está registrado (`isRegistered: false`):**
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

---

## Lo que necesito implementar

### 1. Instalar Clerk en Angular

Instalar el SDK de Clerk para JavaScript:
```bash
npm install @clerk/clerk-js
```

### 2. Servicio de Clerk (`clerk.service.ts`)

Crear un servicio Angular que:
- Inicialice Clerk con la Publishable Key
- Exponga el estado de autenticación como Observable (si el usuario está logueado o no)
- Provea métodos para obtener el token JWT actual (`clerk.session.getToken()`)
- Provea acceso al objeto `clerk.user` (datos del usuario de Clerk)
- Permita montar los componentes de SignIn y SignUp de Clerk en elementos del DOM
- Provea método de logout (`clerk.signOut()`)

### 3. Interceptor HTTP (`auth.interceptor.ts`)

Crear un interceptor que:
- Intercepte TODOS los requests HTTP salientes
- Obtenga el JWT actual de Clerk (`clerk.session.getToken()`)
- Si hay token, agregue el header `Authorization: Bearer <token>` al request
- Si no hay token, deje pasar el request sin modificar (para endpoints públicos)
- Este interceptor debe registrarse en `app.config.ts` o en el módulo principal

### 4. Guard de rutas (`auth.guard.ts`)

Crear un guard que:
- Verifique si el usuario está autenticado en Clerk
- Si está autenticado → permitir acceso
- Si NO está autenticado → redirigir a la página de login
- Aplicar a las rutas protegidas (dashboard, perfil, etc.)

### 5. Servicio de Auth (`auth.service.ts`)

Crear un servicio que se comunique con el backend:
```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/Auth';

  constructor(private http: HttpClient) {}

  // Llamar después de cada login para sincronizar con BD local
  sync(): Observable<ApiResponse<SyncResponse>> {
    return this.http.post<ApiResponse<SyncResponse>>(`${this.apiUrl}/sync`, {});
  }

  // Debug: ver claims del token
  me(): Observable<ApiResponse<MeResponse>> {
    return this.http.get<ApiResponse<MeResponse>>(`${this.apiUrl}/me`);
  }
}
```

### 6. Interfaces TypeScript

```typescript
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

### 7. Componentes de Login y Registro

**Página de Login (`/login`):**
- Montar el componente `clerk.mountSignIn()` de Clerk
- Clerk maneja todo el flujo (email/password, Google, etc.)
- Después del login exitoso, llamar a `POST /api/Auth/sync`
- Si sync retorna `isRegistered: true` → redirigir al dashboard según `type` (Client o Provider)
- Si sync retorna `isRegistered: false` → redirigir a `/register` para elegir tipo y completar perfil

**Página de Registro (`/register`):**
- Montar el componente `clerk.mountSignUp()` de Clerk
- Después del registro exitoso en Clerk, llamar a `POST /api/Auth/sync`
- Sync retornará `isRegistered: false` (es usuario nuevo)
- Redirigir a un formulario donde el usuario elige si es Client o Provider y completa sus datos
- Luego llamar a `POST /api/Client` o `POST /api/Provider` según corresponda

**Botón/Componente de Usuario (navbar):**
- Mostrar `clerk.mountUserButton()` cuando el usuario esté logueado
- Usar `clerk.signOut()` para cerrar sesión

### 8. Flujo completo esperado

```
1. Usuario entra a la app → Guard verifica si está logueado
2. NO logueado → Redirige a /login
3. Se loguea con Clerk (email, Google, etc.)
4. Angular llama POST /api/Auth/sync con JWT automático (interceptor)
5. Backend responde:
   a) isRegistered: true → Guardar datos en estado local → Ir a dashboard
   b) isRegistered: false → Ir a formulario de completar registro
6. Usuario completa registro → POST /api/Client o /api/Provider
7. Redirigir al dashboard
```

### 9. Estado global del usuario

Guardar los datos del sync en un servicio o state management:
- `userId` (ID local en la BD)
- `email`
- `type` (Client/Provider/Admin)
- `isRegistered`
- `profile` (datos resumidos del perfil)

Esto permite que cualquier componente sepa quién es el usuario y de qué tipo es.

### 10. Consideraciones importantes

- **NO almacenar el JWT manualmente** — Clerk maneja la sesión y renueva tokens automáticamente
- **El JWT expira ~60 segundos** — Clerk lo renueva silenciosamente, el interceptor siempre llama a `getToken()` que retorna un token fresco
- **La Publishable Key (`pk_test_...`) va en el frontend** — Es segura para el cliente
- **La Secret Key (`sk_test_...`) NUNCA va en el frontend** — Solo en el backend
- **CORS:** El backend ya tiene configurado CORS para `http://localhost:4200`
- **El interceptor agrega el JWT a TODAS las llamadas HTTP**, incluyendo las de los otros backends (Products, Categories). Esos backends ya tienen configurada la validación del mismo JWT de Clerk.

### 11. URLs de los backends

| Backend | URL | Descripción |
|---------|-----|-------------|
| Users | `http://localhost:5000` | Usuarios, Clientes, Proveedores, Auth |
| Products | (configurar) | Productos, Categorías, Subcategorías |
