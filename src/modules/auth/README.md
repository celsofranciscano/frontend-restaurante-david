# Módulo de Autenticación - Frontend

Sistema de autenticación completo integrado con el backend de NestJS.

## 🏗️ Arquitectura

### Estructura de archivos

```
src/
├── lib/
│   └── axios.ts                          # Configuración de Axios con interceptores
├── modules/
│   └── auth/
│       ├── components/
│       │   ├── login-form.tsx            # Formulario de login con validación
│       │   └── protected-route.tsx       # HOC para proteger rutas
│       ├── context/
│       │   └── auth.context.tsx          # Context API para estado global
│       ├── hooks/
│       │   └── useAuth.ts                # Hook personalizado para autenticación
│       ├── pages/
│       │   └── login-page.tsx            # Página de login
│       ├── services/
│       │   └── auth.service.ts           # Servicio para llamadas a la API
│       └── types/
│           └── auth.types.ts             # Tipos TypeScript
└── pages/
    ├── home-page.tsx                     # Página de inicio
    └── dashboard-page.tsx                # Dashboard protegido
```

## 🚀 Características

### 1. Servicio de Autenticación (`auth.service.ts`)
- ✅ Login con credenciales
- ✅ Logout y limpieza de sesión
- ✅ Obtener perfil del usuario
- ✅ Verificar estado de autenticación
- ✅ Gestión de token en localStorage

### 2. Context de Autenticación (`auth.context.tsx`)
- ✅ Estado global del usuario
- ✅ Verificación automática de sesión al cargar
- ✅ Notificaciones con toast (sonner)
- ✅ Navegación automática después del login
- ✅ Manejo de estados de carga

### 3. Configuración de Axios (`axios.ts`)
- ✅ Interceptor de request para agregar token
- ✅ Interceptor de response para manejar errores 401
- ✅ Redirección automática al login si el token expira
- ✅ URL base configurable por variable de entorno

### 4. Componente ProtectedRoute
- ✅ Protección de rutas que requieren autenticación
- ✅ Redirección automática al login
- ✅ Soporte para restricción por roles
- ✅ Loading state mientras verifica autenticación

### 5. Formulario de Login
- ✅ Validación con Zod y React Hook Form
- ✅ Manejo de errores
- ✅ Estados de carga
- ✅ Diseño responsivo con shadcn/ui

## 📋 Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000/api
```

### Uso del Hook useAuth

```tsx
import { useAuth } from '@/modules/auth/hooks/useAuth';

function MyComponent() {
  const { usuario, isAuthenticated, login, logout } = useAuth();

  // Login
  const handleLogin = async () => {
    await login({
      nombre_usuario: 'admin',
      contrasena: 'password123'
    });
  };

  // Logout
  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Hola, {usuario?.nombre}</p>
      ) : (
        <button onClick={handleLogin}>Iniciar sesión</button>
      )}
    </div>
  );
}
```

### Proteger Rutas

```tsx
import { ProtectedRoute } from '@/modules/auth/components/protected-route';

// Ruta protegida básica
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>

// Ruta protegida con roles específicos
<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={['administrador']}>
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

## 🔐 Flujo de Autenticación

1. **Login:**
   - Usuario ingresa credenciales en LoginForm
   - Se envía request a `/api/auth/login`
   - Backend valida y retorna token + datos del usuario
   - Token se guarda en localStorage
   - Usuario se redirige al dashboard
   - Se muestra notificación de bienvenida

2. **Navegación:**
   - Todas las requests incluyen el token en header Authorization
   - ProtectedRoute verifica autenticación antes de mostrar contenido
   - Si no hay token o es inválido, redirige a login

3. **Logout:**
   - Se limpian token y datos del localStorage
   - Usuario se redirige al login
   - Se muestra notificación

4. **Token Expirado:**
   - Interceptor de Axios detecta respuesta 401
   - Limpia sesión automáticamente
   - Redirige al login

## 🎨 Componentes UI Utilizados

- Button
- Input
- Field, FieldGroup, FieldLabel
- Card, CardHeader, CardContent, CardTitle, CardDescription
- Badge
- Sonner (Toast notifications)

## 📦 Dependencias

```json
{
  "axios": "^1.13.4",
  "react-router-dom": "^7.13.0",
  "react-hook-form": "^7.71.1",
  "@hookform/resolvers": "^5.2.2",
  "zod": "^4.3.6",
  "sonner": "^2.0.7"
}
```

## 🔧 API Endpoints

El módulo consume los siguientes endpoints del backend:

- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil del usuario

## 🎯 Tipos TypeScript

```typescript
interface Usuario {
  id: string;
  nombre: string;
  nombre_usuario: string;
  rol: 'administrador' | 'mesero' | 'cocinero';
}

interface LoginCredentials {
  nombre_usuario: string;
  contrasena: string;
}

interface LoginResponse {
  access_token: string;
  usuario: Usuario;
}
```

## 📝 Notas

- El token se almacena en localStorage para persistencia entre recargas
- Los interceptores de Axios manejan automáticamente la autenticación
- El contexto se inicializa automáticamente al cargar la aplicación
- Las notificaciones toast proporcionan feedback al usuario
- El sistema soporta roles para control de acceso granular

## 🚧 Próximas Mejoras

- [ ] Refresh token automático
- [ ] Remember me functionality
- [ ] Recuperación de contraseña
- [ ] Registro de usuarios
- [ ] 2FA (Autenticación de dos factores)
