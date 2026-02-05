import axiosInstance from "@/lib/axios";
import type {
  Usuario,
  CreateUsuarioDto,
  UpdateUsuarioDto,
} from "../types/usuario.types";

/**
 * Servicio para gestionar usuarios
 */
class UsuariosService {
  private readonly baseUrl = "/usuarios";

  /**
   * Obtiene todos los usuarios
   */
  async getAll(): Promise<Usuario[]> {
    const response = await axiosInstance.get<Usuario[]>(this.baseUrl);
    return response.data;
  }

  /**
   * Obtiene un usuario por ID
   */
  async getById(id: string): Promise<Usuario> {
    const response = await axiosInstance.get<Usuario>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Crea un nuevo usuario
   */
  async create(data: CreateUsuarioDto): Promise<Usuario> {
    const response = await axiosInstance.post<Usuario>(this.baseUrl, data);
    return response.data;
  }

  /**
   * Actualiza un usuario
   */
  async update(id: string, data: UpdateUsuarioDto): Promise<Usuario> {
    const response = await axiosInstance.put<Usuario>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Elimina un usuario (soft delete)
   */
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`);
  }
}

export const usuariosService = new UsuariosService();
