import axiosInstance from "@/lib/axios";
import type {
    Transaccion,
    CreateTransaccionDto,
    UpdateTransaccionDto,
    DetalleItem,
    AddItemDto,
    DetalleItemExtra,
    AddExtraDto,
    Pago,
    CreatePagoDto,
} from "../types/transaccion.types";

export const transaccionesService = {
    // ========== TRANSACCIONES CRUD ==========

    getAll: async (): Promise<Transaccion[]> => {
        const { data } = await axiosInstance.get("/transacciones");
        return data;
    },

    getOne: async (id: number): Promise<Transaccion> => {
        const { data } = await axiosInstance.get(`/transacciones/${id}`);
        return data;
    },

    create: async (dto: CreateTransaccionDto): Promise<Transaccion> => {
        const { data } = await axiosInstance.post("/transacciones", dto);
        return data;
    },

    update: async (
        id: number,
        dto: UpdateTransaccionDto
    ): Promise<Transaccion> => {
        const { data } = await axiosInstance.patch(`/transacciones/${id}`, dto);
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/transacciones/${id}`);
    },

    // ========== ITEMS MANAGEMENT ==========

    getItems: async (transaccionId: number): Promise<DetalleItem[]> => {
        const { data } = await axiosInstance.get(
            `/transacciones/${transaccionId}/items`
        );
        return data;
    },

    addItem: async (
        transaccionId: number,
        dto: AddItemDto
    ): Promise<DetalleItem> => {
        const { data } = await axiosInstance.post(
            `/transacciones/${transaccionId}/items`,
            dto
        );
        return data;
    },

    removeItem: async (transaccionId: number, itemId: number): Promise<void> => {
        await axiosInstance.delete(`/transacciones/${transaccionId}/items/${itemId}`);
    },

    // ========== EXTRAS MANAGEMENT ==========

    getExtras: async (
        transaccionId: number,
        itemId: number
    ): Promise<DetalleItemExtra[]> => {
        const { data } = await axiosInstance.get(
            `/transacciones/${transaccionId}/items/${itemId}/extras`
        );
        return data;
    },

    addExtra: async (
        transaccionId: number,
        itemId: number,
        dto: AddExtraDto
    ): Promise<DetalleItemExtra> => {
        const { data } = await axiosInstance.post(
            `/transacciones/${transaccionId}/items/${itemId}/extras`,
            dto
        );
        return data;
    },

    removeExtra: async (
        transaccionId: number,
        itemId: number,
        extraId: number
    ): Promise<void> => {
        await axiosInstance.delete(
            `/transacciones/${transaccionId}/items/${itemId}/extras/${extraId}`
        );
    },

    // ========== PAYMENTS MANAGEMENT ==========

    getPagos: async (transaccionId: number): Promise<Pago[]> => {
        const { data } = await axiosInstance.get(
            `/transacciones/${transaccionId}/pagos`
        );
        return data;
    },

    addPago: async (
        transaccionId: number,
        dto: CreatePagoDto
    ): Promise<Pago> => {
        const { data } = await axiosInstance.post(
            `/transacciones/${transaccionId}/pagos`,
            dto
        );
        return data;
    },

    // ========== CAJA INTEGRATION ==========

    getByCaja: async (cajaId: number): Promise<Transaccion[]> => {
        const { data } = await axiosInstance.get(`/transacciones/caja/${cajaId}`);
        return data;
    },

    getResumenItems: async (cajaId: number): Promise<{ nombre: string; cantidad: number; total: number; tipo: 'producto' | 'plato' }[]> => {
        const { data } = await axiosInstance.get(`/transacciones/caja/${cajaId}/resumen`);
        return data;
    },

    // ========== COCINA ==========

    getPendientesCocina: async (): Promise<Transaccion[]> => {
        const { data } = await axiosInstance.get("/transacciones/cocina/pendientes");
        return data;
    },

    completarOrdenCocina: async (id: number): Promise<void> => {
        await axiosInstance.patch(`/transacciones/${id}/cocina/completar`);
    },
};
