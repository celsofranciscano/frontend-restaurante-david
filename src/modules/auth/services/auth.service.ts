import axiosInstance from "@/lib/axios";
import type { LoginCredentials, LoginResponse, Usuario } from "../types/auth.types";

/**
 * Servicio de autenticación que consume la API del backend
 */
class AuthService {
  /**
   * Inicia sesión con las credenciales del usuario
   * @param credentials - Credenciales de login (nombre_usuario y contraseña)
   * @returns Respuesta con el token y datos del usuario
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>(
      "/auth/login",
      credentials,
    );

    // Guardar token y usuario en localStorage
    if (response.data.access_token) {
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("usuario", JSON.stringify(response.data.usuario));
    }

    return response.data;
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("usuario");
  }

  /**
   * Obtiene el perfil del usuario autenticado
   * @returns Datos del usuario
   */
  async getProfile(): Promise<Usuario> {
    const response = await axiosInstance.get<Usuario>("/auth/profile");
    return response.data;
  }

  /**
   * Verifica si hay una sesión activa
   * @returns true si hay un token almacenado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("access_token");
  }

  /**
   * Obtiene el usuario almacenado en localStorage
   * @returns Usuario o null
   */
  getStoredUser(): Usuario | null {
    const userString = localStorage.getItem("usuario");
    if (!userString) return null;

    try {
      return JSON.parse(userString);
    } catch {
      return null;
    }
  }

  /**
   * Obtiene el token almacenado
   * @returns Token o null
   */
  getToken(): string | null {
    return localStorage.getItem("access_token");
  }
}

// Exportar instancia singleton
export const authService = new AuthService();
