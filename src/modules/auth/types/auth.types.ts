export interface Usuario {
  id: string;
  nombre: string;
  nombre_usuario: string;
  rol: string; // 'admin', 'cajero', 'mesero', 'cocinero', etc.
}

export interface LoginCredentials {
  nombre_usuario: string;
  contrasena: string;
}

export interface LoginResponse {
  access_token: string;
  usuario: Usuario;
}

export interface AuthContextType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}
