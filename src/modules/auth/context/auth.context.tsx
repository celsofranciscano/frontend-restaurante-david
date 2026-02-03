import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

import { toast } from 'sonner';
import type { AuthContextType, LoginCredentials, Usuario } from '../types/auth.types';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Proveedor del contexto de autenticación
 * Maneja el estado global de autenticación de la aplicación
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Cargar usuario al montar el componente
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = authService.getStoredUser();
        const token = authService.getToken();

        if (storedUser && token) {
          // Solo usar el usuario almacenado sin verificar con el servidor
          // La verificación se hará en la primera request protegida
          setUsuario(storedUser);
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Escuchar cambios en localStorage para detectar logout desde el interceptor
  useEffect(() => {
    const handleStorageChange = () => {
      const token = authService.getToken();
      if (!token && usuario) {
        // Token eliminado pero usuario aún en estado = sesión expirada
        setUsuario(null);
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
        navigate('/login');
      }
    };

    // Verificar periódicamente si el token fue eliminado
    const interval = setInterval(handleStorageChange, 1000);

    return () => clearInterval(interval);
  }, [usuario, navigate]);

  /**
   * Inicia sesión con las credenciales proporcionadas
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      setUsuario(response.usuario);
      toast.success(`¡Bienvenido ${response.usuario.nombre}!`);
    } catch (error: unknown) {
      console.error('Error al iniciar sesión:', error);
      const message =  'Error al iniciar sesión' + (error instanceof Error ? `: ${error.message}` : '');
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cierra la sesión del usuario
   */
  const logout = () => {
    authService.logout();
    setUsuario(null);
    toast.info('Sesión cerrada');
    navigate('/login');
  };

  const value: AuthContextType = {
    usuario,
    isAuthenticated: !!usuario,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
