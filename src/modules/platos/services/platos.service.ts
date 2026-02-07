import axiosInstance from "@/lib/axios";
import type{
  Plato,
  CreatePlatoDto,
  UpdatePlatoDto,
  PlatoIngrediente,
  AddIngredienteDto,
} from "../types/plato.types";

export const platosService = {
  getAll: async (): Promise<Plato[]> => {
    const { data } = await axiosInstance.get("/platos");
    return data;
  },

  getOne: async (id: string): Promise<Plato> => {
    const { data } = await axiosInstance.get(`/platos/${id}`);
    return data;
  },

  create: async (dto: CreatePlatoDto): Promise<Plato> => {
    const { data } = await axiosInstance.post("/platos", dto);
    return data;
  },

  update: async (id: string, dto: UpdatePlatoDto): Promise<Plato> => {
    const { data } = await axiosInstance.patch(`/platos/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/platos/${id}`);
  },

  getIngredientes: async (platoId: string): Promise<PlatoIngrediente[]> => {
    const { data } = await axiosInstance.get(`/platos/${platoId}/ingredientes`);
    return data;
  },

  addIngrediente: async (
    platoId: string,
    dto: AddIngredienteDto,
  ): Promise<PlatoIngrediente> => {
    const { data } = await axiosInstance.post(
      `/platos/${platoId}/ingredientes`,
      dto,
    );
    return data;
  },

  removeIngrediente: async (
    platoId: string,
    ingredienteId: string,
  ): Promise<void> => {
    await axiosInstance.delete(
      `/platos/${platoId}/ingredientes/${ingredienteId}`,
    );
  },

  updateIngrediente: async (
    platoId: string,
    ingredienteId: string,
    cantidad: number,
  ): Promise<void> => {
    await axiosInstance.patch(
      `/platos/${platoId}/ingredientes/${ingredienteId}`,
      { cantidad },
    );
  },
};
