export type Plato = {
  id: string;
  nombre: string;
  precio: number;
  creado_en: string;
  actualizado_en: string;
  borrado_en?: string | null;
};

export type PlatoIngrediente = {
  ingrediente_id: string;
  cantidad: number;
  nombre: string | null;
  unidad: string | null;
};

export type CreatePlatoDto = {
  nombre: string;
  precio: number;
};

export type UpdatePlatoDto = Partial<CreatePlatoDto>;

export type AddIngredienteDto = {
  ingrediente_id: string;
  cantidad: number;
};
