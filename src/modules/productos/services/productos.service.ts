import axiosInstance from "@/lib/axios";
import type {
  Producto,
  CreateProductoDto,
  UpdateProductoDto,
} from "../types/producto.types";

export const productosService = {
  getAll: async (): Promise<Producto[]> => {
    const { data } = await axiosInstance.get("/productos");
    return data;
  },

  getOne: async (id: string): Promise<Producto> => {
    const { data } = await axiosInstance.get(`/productos/${id}`);
    return data;
  },

  create: async (dto: CreateProductoDto): Promise<Producto> => {
    const { data } = await axiosInstance.post("/productos", dto);
    return data;
  },

  update: async (id: string, dto: UpdateProductoDto): Promise<Producto> => {
    const { data } = await axiosInstance.patch(`/productos/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/productos/${id}`);
  },
};
