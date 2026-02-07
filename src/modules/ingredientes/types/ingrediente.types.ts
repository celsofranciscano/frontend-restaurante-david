export type Ingrediente = {
  id: string;
  nombre: string;
  unidad: string;
  cantidad: number;
  cantidad_minima: number;
  creado_en: string;
  actualizado_en: string;
  borrado_en?: string | null;
};

export type CreateIngredienteDto = {
  nombre: string;
  unidad: string;
  cantidad: number;
  cantidad_minima: number;
};

export type UpdateIngredienteDto = Partial<CreateIngredienteDto>;
