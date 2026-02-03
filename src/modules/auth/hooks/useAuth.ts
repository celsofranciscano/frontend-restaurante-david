import { useContext } from 'react';
import { AuthContext } from '../context/auth.context';

/**
 * Hook personalizado para acceder al contexto de autenticación
 * @returns Contexto de autenticación con el estado y métodos del usuario
 * @throws Error si se usa fuera del AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
}
