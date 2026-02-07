import axiosInstance from "@/lib/axios";
import type{
  Ingrediente,
  CreateIngredienteDto,
  UpdateIngredienteDto,
} from "../types/ingrediente.types";

export const ingredientesService = {
  getAll: async (): Promise<Ingrediente[]> => {
    const { data } = await axiosInstance.get("/ingredientes");
    return data;
  },

  getOne: async (id: string): Promise<Ingrediente> => {
    const { data } = await axiosInstance.get(`/ingredientes/${id}`);
    return data;
  },

  create: async (dto: CreateIngredienteDto): Promise<Ingrediente> => {
    const { data } = await axiosInstance.post("/ingredientes", dto);
    return data;
  },

  update: async (
    id: string,
    dto: UpdateIngredienteDto,
  ): Promise<Ingrediente> => {
    const { data } = await axiosInstance.patch(`/ingredientes/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/ingredientes/${id}`);
  },
};
