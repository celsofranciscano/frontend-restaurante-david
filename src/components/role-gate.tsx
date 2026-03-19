import { useAuth } from '@/modules/auth/hooks/useAuth';
import { ShieldOff } from 'lucide-react';

type Rol = 'admin' | 'cajero' | 'mesero' | 'cocinero' | 'gerente';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: Rol[];
  fallback?: React.ReactNode;
}

export function RoleGate({ children, allowedRoles, fallback }: RoleGateProps) {
  const { usuario } = useAuth();

  if (!usuario) {
    return fallback ?? null;
  }

  const userRole = usuario.rol.toLowerCase() as Rol;
  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    return fallback ?? (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <ShieldOff className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
      </div>
    );
  }

  return <>{children}</>;
}

export function useHasRole(roles: Rol[]): boolean {
  const { usuario } = useAuth();
  
  if (!usuario) return false;
  
  const userRole = usuario.rol.toLowerCase() as Rol;
  return roles.includes(userRole);
}
