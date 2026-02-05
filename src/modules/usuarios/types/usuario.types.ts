export interface Usuario {
  id: string;
  nombre: string;
  nombre_usuario: string;
  rol: string;
  creado_en?: string;
  actualizado_en?: string;
}

export interface CreateUsuarioDto {
  nombre: string;
  nombre_usuario: string;
  contrasena: string;
  rol: string;
}

export interface UpdateUsuarioDto {
  nombre?: string;
  nombre_usuario?: string;
  contrasena?: string;
  rol?: string;
}

export interface UsuariosResponse {
  data: Usuario[];
  total: number;
}
