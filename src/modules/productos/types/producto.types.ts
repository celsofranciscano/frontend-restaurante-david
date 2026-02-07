export type Producto = {
  id: string;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock: number;
  unidad: string;
  creado_en: string;
  actualizado_en: string;
  borrado_en?: string | null;
};

export type CreateProductoDto = {
  nombre: string;
  precio: number;
  stock: number;
  unidad: string;
};

export type UpdateProductoDto = Partial<CreateProductoDto>;
